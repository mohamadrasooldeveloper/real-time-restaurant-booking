from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Restaurant, Food, Order, OrderItem

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_staff', 'is_active']
    list_filter = ['role', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('role',)}),
    )

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner']
    search_fields = ['name', 'owner__username']

@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ['name', 'restaurant', 'price', 'discount_percent']  # اصلاح شده
    search_fields = ['name', 'restaurant__name']  # اصلاح شده

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'restaurant', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]
