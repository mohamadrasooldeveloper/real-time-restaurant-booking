import uuid
import random
from django.db import models
from django.utils import timezone
from core.models import Order

class Payment(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_SUCCESS = 'success'
    STATUS_FAILED = 'failed'

    METHOD_MANUAL = 'manual'
    METHOD_FAKE = 'fake'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'در انتظار پرداخت'),
        (STATUS_SUCCESS, 'موفق'),
        (STATUS_FAILED, 'ناموفق'),
    ]
    METHOD_CHOICES = [
        (METHOD_MANUAL, 'Manual'),
        (METHOD_FAKE, 'FakeGateway'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    method = models.CharField(max_length=30, choices=METHOD_CHOICES, default=METHOD_FAKE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    ref_code = models.CharField(max_length=32, unique=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    meta = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['ref_code']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        if not self.ref_code:
            self.ref_code = uuid.uuid4().hex[:20]
        super().save(*args, **kwargs)

    def mark_success(self, card_last4: str):
        self.status = self.STATUS_SUCCESS
        self.paid_at = timezone.now()
        self.meta.update({'card_last4': card_last4})
        self.save(update_fields=['status', 'paid_at', 'meta'])

    def mark_failed(self):
        self.status = self.STATUS_FAILED
        self.save(update_fields=['status'])

    def __str__(self):
        return f"Payment {self.ref_code} - {self.status}"

