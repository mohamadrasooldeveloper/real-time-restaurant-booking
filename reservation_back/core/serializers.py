from .models import CustomUser, Restaurant, Food, Order, OrderItem, CartItem, Cart
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class RestaurantBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'image']

class FoodSerializer(serializers.ModelSerializer):
    discounted_price = serializers.SerializerMethodField(read_only=True)
    restaurant = RestaurantBasicSerializer(read_only=True)

    class Meta:
        model = Food
        fields = [
            'id',
            'name',
            'description',
            'price',
            'discount_percent',
            'discounted_price',
            'restaurant',
        ]
    def get_discounted_price(self, obj):
        return obj.discounted_price


class RestaurantSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField(read_only=True)
    foods = FoodSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'image', 'foods']

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None



class CartItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    food_id = serializers.PrimaryKeyRelatedField(
        queryset=Food.objects.all(),
        source='food',
        write_only=True
    )
    total_price = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'food', 'food_id', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.total_price()



class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_price']
        read_only_fields = ['user']

    def get_total_price(self, obj):
        return obj.total_price()

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
    total_price = serializers.SerializerMethodField(read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'uuid', 'user', 'restaurant', 'status', 'created_at', 'items', 'total_price']

    def get_total_price(self, obj):
        return sum(item.food.discounted_price * item.quantity for item in obj.items.all())

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            food = item_data.pop('food_id')
            OrderItem.objects.create(order=order, food=food, **item_data)
        return order


User = get_user_model()

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role']

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
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if not user:
            raise serializers.ValidationError('نام کاربری یا رمز عبور اشتباه است.')
        if not user.is_active:
            raise serializers.ValidationError('کاربر غیرفعال است.')

        refresh = RefreshToken.for_user(user)
        return {
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

class CheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['uuid', 'address', 'phone', 'note']
        read_only_fields = ['uuid']
