from django.db import transaction
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from core.models import Cart, CartItem, Food


@transaction.atomic
def add_to_cart(user, food_id, quantity=1):
    if quantity <= 0:
        raise ValidationError("تعداد باید بزرگ‌تر از صفر باشد.")

    cart, _ = Cart.objects.get_or_create(user=user)
    food = get_object_or_404(Food, id=food_id)

    item, created = CartItem.objects.select_for_update().get_or_create(
        cart=cart, food=food
    )

    item.quantity = item.quantity + quantity if not created else quantity
    item.save()

    return cart  


@transaction.atomic
def remove_from_cart(user, food_id):
    cart = Cart.objects.filter(user=user).first()
    if not cart:
        raise ValidationError("سبد خرید یافت نشد.")

    CartItem.objects.filter(cart=cart, food_id=food_id).delete()
    return cart


@transaction.atomic
def decrement_item(user, food_id):
    cart = Cart.objects.filter(user=user).first()
    if not cart:
        raise ValidationError("سبد خرید یافت نشد.")

    item = get_object_or_404(CartItem, cart=cart, food_id=food_id)

    if item.quantity > 1:
        item.quantity -= 1
        item.save()
    else:
        item.delete()

    return cart
