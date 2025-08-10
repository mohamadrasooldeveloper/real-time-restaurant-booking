from django.db import models

class Reservation(models.Model):
    date = models.DateField()
    time = models.TimeField()
    guests = models.PositiveIntegerField()
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
from django.db import models

# Create your models here.
