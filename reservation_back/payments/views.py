from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from ratelimit.decorators import ratelimit
from .serializers import CreatePaymentSerializer, VerifyPaymentSerializer
from .services.payment_service import create_fake_payment, verify_fake_payment

class CreateFakePaymentView(APIView):
    permission_classes = [IsAuthenticated]

    @ratelimit(key='user_or_ip', rate='5/m', block=True)
    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payment = create_fake_payment(
                user=request.user,
                **serializer.validated_data
            )
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'ref_code': payment.ref_code,
            'payment_id': payment.id,
            'gateway_url': f"{request.build_absolute_uri('/')}fake-gateway/{payment.ref_code}"
        }, status=status.HTTP_201_CREATED)


class VerifyFakePaymentView(APIView):
    permission_classes = [AllowAny]

    @ratelimit(key='ip', rate='10/m', block=True)
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            result = verify_fake_payment(**serializer.validated_data)
            return Response({
                'status': result['status'],
                'message': 'پرداخت موفق بود.' if result['status'] == 'success' else 'پرداخت ناموفق بود.',
                'order_uuid': result.get('order_uuid')
            })
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
