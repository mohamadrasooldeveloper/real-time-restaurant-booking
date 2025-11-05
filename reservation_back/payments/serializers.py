from rest_framework import serializers
from .models import Payment, PaymentLog

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'method', 'status', 'ref_code', 'created_at', 'paid_at']
        read_only_fields = ['status', 'ref_code', 'created_at', 'paid_at']

class CreatePaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    method = serializers.ChoiceField(choices=[('fake','FakeGateway'), ('manual','Manual')], default='fake')

class VerifyPaymentSerializer(serializers.Serializer):
    ref_code = serializers.CharField()
    card_number = serializers.CharField(allow_blank=False)
    cvv2 = serializers.CharField(allow_blank=False)
    otp = serializers.CharField(allow_blank=False)
