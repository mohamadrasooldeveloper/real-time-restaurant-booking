from django.urls import path
from . import views

urlpatterns = [
    path('reservations/', views.create_reservation, name='create_reservation'),
]
