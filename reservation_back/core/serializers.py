from .models import CustomUser, Restaurant, Food, Order, OrderItem
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# -----------------------
# Serializer برای غذا
# -----------------------
class FoodSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = ['id', 'name', 'description', 'price', 'discount_percent', 'discounted_price']

    def get_discounted_price(self, obj):
        return obj.discounted_price


# -----------------------
# Serializer برای رستوران
# -----------------------
class RestaurantSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    foods = FoodSerializer(many=True)  # فرض می‌کنیم اینجا هست

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'image', 'foods']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            # به همراه دامین کامل
            return request.build_absolute_uri(obj.image.url)
        return None


# -----------------------
# Serializer برای آیتم‌های سفارش
# -----------------------
class OrderItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    food_id = serializers.PrimaryKeyRelatedField(queryset=Food.objects.all(), write_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'food', 'food_id', 'quantity']

    def create(self, validated_data):
        food = validated_data.pop('food_id')
        return OrderItem.objects.create(food=food, **validated_data)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    total_price = serializers.SerializerMethodField()
    user = serializers.StringRelatedField(read_only=True)  # فقط نمایش دهی

    class Meta:
        model = Order
        fields = ['id', 'user', 'restaurant', 'status', 'created_at', 'items', 'total_price']

    def get_total_price(self, obj):
        total = 0
        for item in obj.items.all():
            total += item.food.discounted_price * item.quantity
        return total

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            food = item_data.pop('food_id')
            OrderItem.objects.create(order=order, food=food, **item_data)
        return order

User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)  # تکرار رمز

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role']
        extra_kwargs = {'role': {'required': True}}

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "رمز عبور و تکرار آن باید یکسان باشند."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('نام کاربری یا رمز عبور اشتباه است.')

        if not user.is_active:
            raise serializers.ValidationError('کاربر غیرفعال است.')

        refresh = RefreshToken.for_user(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = user
        return data
