from django.urls import path
from .views import CreateFakePaymentView, VerifyFakePaymentView

urlpatterns = [
    path('payments/create-fake/', CreateFakePaymentView.as_view(), name='create_fake_payment'),
    path('payments/verify-fake/', VerifyFakePaymentView.as_view(), name='verify_fake_payment'),
]
