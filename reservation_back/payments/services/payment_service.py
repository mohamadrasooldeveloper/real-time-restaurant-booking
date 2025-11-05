import random
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from core.models import Order
from payments.models import Payment, PaymentLog

def create_fake_payment(user, order_id, method):
    order = get_object_or_404(Order, id=order_id, user=user)

    if order.status != 'pending':
        raise ValueError("این سفارش قابل پرداخت نیست.")

    payment, created = Payment.objects.get_or_create(
        order=order,
        defaults={'amount': order.total_price, 'method': method}
    )

    PaymentLog.objects.create(
        payment=payment,
        event='payment_created',
        payload={'user_id': user.id, 'method': method}
    )

    return payment


def verify_fake_payment(ref_code, card_number, cvv2, otp):
    if not (card_number.isdigit() and 12 <= len(card_number) <= 19):
        raise ValueError("شماره کارت نامعتبر است.")
    if not (cvv2.isdigit() and 3 <= len(cvv2) <= 4):
        raise ValueError("CVV2 نامعتبر است.")
    if not (otp.isdigit() and len(otp) == 6):
        raise ValueError("رمز پویا باید ۶ رقم باشد.")

    payment = get_object_or_404(Payment.objects.select_related('order'), ref_code=ref_code)

    if payment.status != Payment.STATUS_PENDING:
        raise ValueError("تراکنش قابل پردازش نیست (قبلاً بررسی شده).")

    success = random.choices([True, False], weights=[90, 10], k=1)[0]

    with transaction.atomic():
        PaymentLog.objects.create(
            payment=payment,
            event='verify_attempt',
            payload={'card_last4': card_number[-4:]}
        )

        if success:
            payment.mark_success(card_number[-4:])
            order = payment.order
            order.status = 'preparing'
            order.save(update_fields=['status'])

            PaymentLog.objects.create(payment=payment, event='verify_success', payload={'order_id': order.id})
            return {'status': 'success', 'order_uuid': str(order.uuid)}
        else:
            payment.mark_failed()
            PaymentLog.objects.create(payment=payment, event='verify_failed', payload={})
            return {'status': 'failed'}
