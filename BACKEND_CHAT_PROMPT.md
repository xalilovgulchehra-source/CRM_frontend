# Backend Chat Endpoint — Prompt

## Maqsad
Mijozlar ham salon egasi bilan chat qila olishlari kerak. Hozircha faqat owner xabar yozadi, mijoz faqat o'qiy oladi. Customer ham xabar yozishi kerak.

## Kerakli endpointlar

### 1. GET /api/chat/<int:booking_id>/
Booking bo'yicha chat xabarlarini olish.

**Auth:** Bearer token (owner yoki customer — faqat o'z bookinglari)

**Response:**
```json
{
  "xabarlar": [
    {
      "id": 1,
      "from": "owner",
      "text": "Salom! Xizmatga yozildingiz.",
      "timestamp": "2026-08-25T15:00:00+05:00",
      "read": true
    },
    {
      "id": 2,
      "from": "customer", 
      "text": "Rahmat, kelaman!",
      "timestamp": "2026-08-25T15:05:00+05:00",
      "read": false
    }
  ]
}
```

### 2. POST /api/chat/<int:booking_id>/
Yangi xabar yozish.

**Auth:** Bearer token (owner yoki customer)

**Request body:**
```json
{
  "text": "Salom! Qachon kelsam bo'ladi?"
}
```

**Response:**
```json
{
  "xabar": {
    "id": 3,
    "from": "customer",
    "text": "Salom! Qachon kelsam bo'ladi?",
    "timestamp": "2026-08-25T15:10:00+05:00",
    "read": false
  }
}
```

**Xatoliklar:**
- 403: `{"xato": "Ruxsat etilmagan"}` — booking sizniki emas
- 404: `{"xato": "Navbat topilmadi"}`

### 3. PUT /api/chat/<int:booking_id>/read/
Xabarlarni o'qilgan deb belgilash.

**Auth:** Bearer token

**Response:**
```json
{"ok": true, "yangilandi": 2}
```

---

## Model (Django)

```python
# models.py
from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    booking = models.ForeignKey(
        'Booking', 
        on_delete=models.CASCADE, 
        related_name='chat_messages'
    )
    from_role = models.CharField(
        max_length=10, 
        choices=[('owner', 'Owner'), ('customer', 'Customer')]
    )
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Chat {self.booking_id} - {self.from_role}: {self.text[:30]}"
```

## Serializer

```python
# serializers.py
from rest_framework import serializers
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'from_role', 'text', 'timestamp', 'read']
        read_only_fields = ['id', 'timestamp', 'read']
```

## View

```python
# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ChatMessage, Booking
from .serializers import ChatMessageSerializer

def check_booking_access(booking, user):
    """Owner yoki customer o'z bookingiga kirishi mumkin"""
    if user.role == 'OWNER':
        return booking.service.salon.owner == user
    elif user.role == 'CUSTOMER':
        return booking.client.user == user
    return False

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_messages(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"xato": "Navbat topilmadi"}, status=404)

    if not check_booking_access(booking, request.user):
        return Response({"xato": "Ruxsat etilmagan"}, status=403)

    messages = booking.chat_messages.all()
    serializer = ChatMessageSerializer(messages, many=True)
    return Response({"xabarlar": serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"xato": "Navbat topilmadi"}, status=404)

    if not check_booking_access(booking, request.user):
        return Response({"xato": "Ruxsat etilmagan"}, status=403)

    text = request.data.get('text', '').strip()
    if not text:
        return Response({"xato": "Xabar matni bo'sh"}, status=400)

    from_role = 'owner' if request.user.role == 'OWNER' else 'customer'

    msg = ChatMessage.objects.create(
        booking=booking,
        from_role=from_role,
        text=text,
    )
    serializer = ChatMessageSerializer(msg)
    return Response({"xabar": serializer.data}, status=201)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_read(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"xato": "Navbat topilmadi"}, status=404)

    if not check_booking_access(booking, request.user):
        return Response({"xato": "Ruxsat etilmagan"}, status=403)

    for_role = 'owner' if request.user.role == 'OWNER' else 'customer'
    # O'ziga yuborilgan, lekin hali o'qilmagan xabarlarni belgila
    updated = booking.chat_messages.filter(
        from_role__in=['owner', 'customer'],
    ).exclude(from_role=for_role).filter(read=False).update(read=True)

    return Response({"ok": True, "yangilandi": updated})
```

## URL

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... mavjud endpointlar
    path('chat/<int:booking_id>/', views.chat_messages, name='chat-messages'),
    path('chat/<int:booking_id>/send/', views.send_message, name='chat-send'),
    path('chat/<int:booking_id>/read/', views.mark_read, name='chat-read'),
]
```

## Migration

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## Frontend (React) — API call format

```typescript
// Yangi xabar yozish
api.post(`/chat/${bookingId}`, { text: "Salom!" })

// Xabarlarni olish  
api.get<{ xabarlar: ChatMessage[] }>(`/chat/${bookingId}`)

// O'qilgan deb belgilash
api.put(`/chat/${bookingId}/read`)
```
