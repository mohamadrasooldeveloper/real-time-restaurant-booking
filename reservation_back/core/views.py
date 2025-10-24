from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login, logout, get_user_model

from .serializers import (
    RestaurantSerializer,
    FoodSerializer,
    OrderSerializer,
    UserRegisterSerializer,
    UserLoginSerializer
)
from .models import Restaurant, Food, Order

User = get_user_model()


# -----------------------------
# پرمیژن سفارشی فروشنده یا ادمین
# -----------------------------
class IsVendorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            request.user.role in ['vendor', 'admin']
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        return getattr(obj, 'owner', None) == request.user


# -----------------------------
# ابزار تنظیم کوکی امن
# -----------------------------
def set_cookie(response, key, value, max_age):
    response.set_cookie(
        key,
        value,
        max_age=max_age,
        httponly=True,
        samesite='Lax',  # یا 'Strict'
        secure=False     # در پروداکشن True کن (HTTPS)
    )


# -----------------------------
# Register View
# -----------------------------
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)

            login(request, user)
            response = Response(
                {"detail": "ثبت‌نام با موفقیت انجام شد."},
                status=status.HTTP_201_CREATED
            )

            set_cookie(response, 'access_token', str(refresh.access_token), 3600)
            set_cookie(response, 'refresh_token', str(refresh), 7 * 24 * 3600)
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# Login View
# -----------------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")

        if not User.objects.filter(username=username).exists():
            return Response(
                {"detail": "کاربری با این نام وجود ندارد، لطفاً ابتدا ثبت‌نام کنید."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)

            login(request, user)

            response = Response(
                {
                    "detail": "ورود موفقیت‌آمیز بود.",
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )

            set_cookie(response, 'access_token', str(refresh.access_token), 3600)
            set_cookie(response, 'refresh_token', str(refresh), 7 * 24 * 3600)

            return response

        return Response(
            {"detail": "رمز عبور اشتباه است."},
            status=status.HTTP_401_UNAUTHORIZED
        )


# -----------------------------
# Logout View
# -----------------------------
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass

        logout(request)
        response = Response({"detail": "خروج موفقیت‌آمیز بود."}, status=status.HTTP_200_OK)
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
        return response


# -----------------------------
# UserMeView — اطلاعات کاربر
# -----------------------------
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

        warnings = []

        if not user.first_name and not user.username:
            warnings.append("نام شما در سیستم ثبت نشده است. لطفاً پروفایل خود را تکمیل کنید.")

        if user.role == "vendor":
            restaurant = Restaurant.objects.filter(owner=user).first()
            if not restaurant:
                warnings.append("شما هنوز هیچ رستورانی ثبت نکرده‌اید.")
            else:
                data["restaurant"] = {
                    "id": restaurant.id,
                    "name": restaurant.name,
                    "is_approved": getattr(restaurant, "is_approved", True),
                }

        elif user.role == "customer":
            if not user.first_name and not user.username:
                warnings.append("لطفاً نام خود را وارد کنید تا سفارش‌های شما به درستی ثبت شوند.")

        elif user.role == "admin":
            if not user.first_name:
                warnings.append("نام مدیر در سیستم ثبت نشده است.")

        if warnings:
            data["warnings"] = warnings

        return Response(data, status=status.HTTP_200_OK)



# -----------------------------
# Refresh Token View
# -----------------------------
class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'توکن Refresh مورد نیاز است.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)
            return Response({'access': new_access_token}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'detail': 'توکن Refresh نامعتبر است.'}, status=status.HTTP_400_BAD_REQUEST)


# -----------------------------
# RestaurantViewSet
# -----------------------------
class RestaurantViewSet(viewsets.ModelViewSet):
    serializer_class = RestaurantSerializer
    permission_classes = [IsVendorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Restaurant.objects.all()

        if user.role == 'vendor':
            return Restaurant.objects.filter(owner=user)
        elif user.role == 'admin':
            return Restaurant.objects.all()
        else:
            return Restaurant.objects.all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# -----------------------------
# FoodViewSet
# -----------------------------
class FoodViewSet(viewsets.ModelViewSet):
    serializer_class = FoodSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Food.objects.all()

        if user.role == 'vendor':
            return Food.objects.filter(resturant__owner=user)
        elif user.role == 'admin':
            return Food.objects.all()
        else:
            return Food.objects.all()

    def perform_create(self, serializer):
        restaurant = serializer.validated_data.get('resturant')
        if self.request.user.role == 'vendor' and restaurant.owner != self.request.user:
            raise PermissionDenied("شما اجازه افزودن غذا به این رستوران را ندارید.")
        serializer.save()


# -----------------------------
# OrderViewSet
# -----------------------------
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


# -----------------------------
# RestaurantListWithFoodsView
# -----------------------------
class RestaurantListWithFoodsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Restaurant.objects.all()
        serializer = RestaurantSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


# -----------------------------
# MeView (برای دیباگ و تست)
# -----------------------------
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        print('User:', user)
        print('Is Authenticated:', user.is_authenticated)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        })
