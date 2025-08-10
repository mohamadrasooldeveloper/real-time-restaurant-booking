from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return None  # اجازه بده روش‌های دیگه احراز هویت رو بررسی کنه

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except TokenError as e:
            # می‌تونی اینجا خطا رو لاگ کنی یا ignore کنی
            return None
