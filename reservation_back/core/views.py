from rest_framework import viewsets, permissions, status, generics
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
    UserLoginSerializer,
    CartItemSerializer,
    CartSerializer,
    CheckoutSerializer
)
from .models import Restaurant, Food, Order,Cart, CartItem
from rest_framework.permissions import IsAuthenticated
User = get_user_model()
from .services.cart_service import *

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

def set_cookie(response, key, value, max_age):
    response.set_cookie(
        key,
        value,
        max_age=max_age,
        httponly=True,
        samesite='Lax', 
        secure=False     
    )

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

class FoodViewSet(viewsets.ModelViewSet):
    serializer_class = FoodSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsVendorOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            # کاربران مهمان همه غذاها را می‌بینند
            return Food.objects.all()

        if user.role == 'vendor':
            # فقط غذاهای رستوران خود فروشنده
            return Food.objects.filter(restaurant__owner=user)
        elif user.role == 'admin':
            # مدیر همه غذاها را می‌بیند
            return Food.objects.all()
        else:
            # مشتری‌ها همه غذاها را می‌بینند
            return Food.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'vendor':
            # غذا به رستوران فروشنده خودش مرتبط می‌شود
            restaurant = Restaurant.objects.filter(owner=user).first()
            if not restaurant:
                raise PermissionDenied("شما هنوز رستورانی ثبت نکرده‌اید.")
            serializer.save(restaurant=restaurant)
        elif user.role == 'admin':
            # مدیر می‌تواند غذا ایجاد کند اما باید رستوران را مشخص کند
            serializer.save()
        else:
            raise PermissionDenied("شما اجازه اضافه کردن غذا را ندارید.")


class CartView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, _ = Cart.objects.get_or_create(user=self.request.user)

        return cart



class AddToCartView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def create(self, request, *args, **kwargs):
        try:
            cart = add_to_cart(request.user, request.data.get("food_id"), int(request.data.get("quantity", 1)))
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'خطا در افزودن به سبد خرید'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RemoveFromCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def delete(self, request, *args, **kwargs):
        try:
            cart = remove_from_cart(request.user, request.data.get("food_id"))
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DecrementCartItemView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def post(self, request, *args, **kwargs):
        try:
            cart = decrement_item(request.user, request.data.get("food_id"))
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        try:
            order = Order.objects.get(uuid=uuid, user=request.user, status='pending')
        except Order.DoesNotExist:
            return Response({'detail': 'سفارش یافت نشد یا قابل پرداخت نیست.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CheckoutSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'اطلاعات سفارش ثبت شد.', 'order_uuid': str(order.uuid)})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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

class RestaurantListWithFoodsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        queryset = Restaurant.objects.all()
        serializer = RestaurantSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

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
