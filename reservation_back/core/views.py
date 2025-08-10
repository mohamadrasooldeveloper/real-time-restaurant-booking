from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .serializers import RestaurantSerializer, FoodSerializer, OrderSerializer
from .models import Restaurant, Food, Order
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import login, logout
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserRegisterSerializer, UserLoginSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
# پرمیژن سفارشی برای فروشنده یا ادمین
class IsVendorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role in ['vendor', 'admin'])

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        # فقط صاحب رستوران اجازه تغییر دارد
        return getattr(obj, 'owner', None) == request.user

# -------------------
# RestaurantViewSet
# -------------------
class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            # اجازه فقط خواندن برای همه
            return Restaurant.objects.all()

        if user.role == 'vendor':
            return Restaurant.objects.filter(owner=user)
        elif user.role == 'admin':
            return Restaurant.objects.all()
        else:
            # کاربران معمولی رستوران‌ها را فقط مشاهده کنند
            return Restaurant.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

# -------------------
# FoodViewSet
# -------------------
class FoodViewSet(viewsets.ModelViewSet):
    serializer_class = FoodSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Food.objects.all()

        if user.role == 'vendor':
            # فقط غذاهای رستوران‌های خود فروشنده
            return Food.objects.filter(resturant__owner=user)
        elif user.role == 'admin':
            return Food.objects.all()
        else:
            return Food.objects.all()

    def perform_create(self, serializer):
        # در صورتی که بخواهی چک کنی که غذا حتما به رستوران خود فروشنده مربوط باشد، باید رستوران را بررسی کنی
        restaurant = serializer.validated_data.get('resturant')
        if self.request.user.role == 'vendor' and restaurant.owner != self.request.user:
            raise PermissionDenied("شما اجازه اضافه کردن غذا به این رستوران را ندارید.")
        serializer.save()

# -------------------
# OrderViewSet
# -------------------
class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'customer':
            return Order.objects.filter(user=user)
        elif user.role == 'vendor':
            return Order.objects.filter(restaurant__owner=user)
        elif user.role == 'admin':
            return Order.objects.all()
        else:
            return Order.objects.none()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


def set_cookie(response, key, value, max_age):
    response.set_cookie(
        key,
        value,
        max_age=max_age,
        httponly=True,
        samesite='Lax',  # یا 'Strict' بر حسب نیاز
        secure=False  # در پروداکشن True کن (HTTPS)
    )


class RegisterView(APIView):
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            login(request, user)
            response = Response({"detail": "ثبت‌نام موفقیت‌آمیز بود."}, status=status.HTTP_201_CREATED)
            set_cookie(response, 'access_token', str(refresh.access_token), 3600)
            set_cookie(response, 'refresh_token', str(refresh), 7 * 24 * 3600)
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            login(request, user)
            response = Response({
                "detail": "ورود موفقیت‌آمیز بود.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }, status=status.HTTP_200_OK)
            set_cookie(response, 'access_token', str(refresh.access_token), 3600)
            set_cookie(response, 'refresh_token', str(refresh), 7 * 24 * 3600)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        logout(request)
        response = Response({"detail": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


class UserMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
        }
        return Response(data)
class RefreshTokenView(APIView):
    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            return Response({'access': new_access_token}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)

class RestaurantListWithFoodsView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        queryset = Restaurant.objects.all()
        serializer = RestaurantSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print('User:', request.user)
        print('Is Authenticated:', request.user.is_authenticated)
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
        })