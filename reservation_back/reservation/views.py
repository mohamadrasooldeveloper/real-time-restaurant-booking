from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from utils.pusher_client import pusher_client
from reservation.models import Reservation
from django.utils.dateparse import parse_date, parse_time

@csrf_exempt
def create_reservation(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            date = parse_date(data.get("date"))
            time = parse_time(data.get("time"))
            guests = int(data.get("guests"))
            name = data.get("name")
            phone = data.get("phone")
            message = data.get("message", "")

            if not (date and time and guests > 0 and name and phone):
                return JsonResponse({"error": "داده‌های ورودی نامعتبر است."}, status=400)

            reservation = Reservation.objects.create(
                date=date,
                time=time,
                guests=guests,
                name=name,
                phone=phone,
                message=message
            )

            print("قبل از ارسال به Pusher")

            # ✅ ارسال به Pusher
            pusher_client.trigger('reservations', 'new-reservation', {
                "date": str(date),
                "time": str(time),
                "guests": guests,
                "name": name,
                "phone": phone,
                "message": message
            })

            print("بعد از ارسال به Pusher")

            return JsonResponse({"status": "success", "message": "رزرو ثبت شد."})
        except Exception as e:
            import traceback
            traceback.print_exc()  # برای بررسی خطای دقیق در ترمینال
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "فقط POST مجاز است."}, status=405)
