from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RestaurantViewSet,
    FoodViewSet,
    OrderViewSet,
    RegisterView,
    LoginView,
    LogoutView,
    UserMeView,
    RestaurantListWithFoodsView,
    CartView,
    AddToCartView,
    RemoveFromCartView,
    DecrementCartItemView,
    CheckoutView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'foods', FoodViewSet, basename='food')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('restaurants-public/', RestaurantListWithFoodsView.as_view(), name='restaurant-list-public'),
    path('register/', RegisterView.as_view(), name='user-register'),
    path('login/', LoginView.as_view(), name='user-login'),
    path('logout/', LogoutView.as_view(), name='user-logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view(), name='user-me'),
    path('cart/', CartView.as_view(), name='cart'),
    path('cart/add/', AddToCartView.as_view(), name='add-to-cart'),
    path('cart/decrement/', DecrementCartItemView.as_view(), name='decrement-cart'),
    path('cart/remove/', RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('orders/<uuid:uuid>/checkout/', CheckoutView.as_view(), name='order_checkout'),

]
