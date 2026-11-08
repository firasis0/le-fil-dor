"""
Serializers for orders.

  OrderCreateSerializer  -> checks what a CUSTOMER sends (the order form)
  OrderSerializer        -> what the ADMIN dashboard receives (read only)
  OrderStatusSerializer  -> the admin changing the status of an order
Error messages are in Arabic because they are shown directly on the website.
"""
import re

from django.conf import settings
from rest_framework import serializers

from apps.geography.models import Commune, Wilaya

from .models import Order
from .utils import optimize_image

# Algerian mobile numbers: 05xxxxxxxx, 06xxxxxxxx or 07xxxxxxxx
PHONE_REGEX = re.compile(r"^0[567]\d{8}$")

# Allowed range (cm) for each measurement. Keep in sync with FrontEnd/src/lib/measurements.js
MEASUREMENT_RANGES = {
    "chest": (60, 160, "محيط الصدر"),
    "hips": (70, 180, "محيط الأرداف"),
    "sleeve_length": (30, 80, "طول الكم"),
    "garment_length": (80, 190, "طول القفطان"),
}

ALLOWED_IMAGE_TYPES = ("image/jpeg", "image/png", "image/webp")


class OrderCreateSerializer(serializers.ModelSerializer):
    """Validates the public order form and creates the order."""

    # We receive ids; the model needs the objects, so declare them explicitly
    wilaya = serializers.PrimaryKeyRelatedField(
        queryset=Wilaya.objects.all(),
        error_messages={"required": "اختر الولاية", "does_not_exist": "ولاية غير صحيحة", "incorrect_type": "ولاية غير صحيحة"},
    )
    commune = serializers.PrimaryKeyRelatedField(
        queryset=Commune.objects.all(),
        error_messages={"required": "اختر البلدية", "does_not_exist": "بلدية غير صحيحة", "incorrect_type": "بلدية غير صحيحة"},
    )

    class Meta:
        model = Order
        fields = [
            "full_name", "phone", "wilaya", "commune", "model_image",
            "chest", "hips", "sleeve_length", "garment_length",
        ]
        extra_kwargs = {
            "full_name": {"error_messages": {"required": "أدخل الاسم الكامل", "blank": "أدخل الاسم الكامل"}},
            "phone": {"error_messages": {"required": "أدخل رقم الهاتف", "blank": "أدخل رقم الهاتف"}},
            "model_image": {"error_messages": {
                "required": "أضف صورة النموذج",
                "invalid_image": "الملف ليس صورة صالحة",
                "empty": "الملف فارغ",
            }},
        }

    def validate_full_name(self, value):
        value = " ".join(value.split())           # remove extra spaces
        if len(value) < 3:
            raise serializers.ValidationError("الاسم قصير جدا")
        return value

    def validate_phone(self, value):
        value = value.replace(" ", "").replace("-", "")
        if not PHONE_REGEX.match(value):
            raise serializers.ValidationError("رقم هاتف غير صحيح (مثال: 0555123456)")
        return value

    def validate_model_image(self, value):
        """Only jpg / png / webp, and not bigger than MAX_UPLOAD_MB."""
        if getattr(value, "content_type", None) not in ALLOWED_IMAGE_TYPES:
            raise serializers.ValidationError("الصورة يجب أن تكون JPG أو PNG أو WEBP")
        if value.size > settings.MAX_UPLOAD_MB * 1024 * 1024:
            raise serializers.ValidationError(f"حجم الصورة يجب ألا يتجاوز {settings.MAX_UPLOAD_MB} ميغابايت")
        return value

    def validate(self, data):
        """Checks that need several fields: the 4 measurements and wilaya/commune match."""
        errors = {}

        for field, (low, high, label) in MEASUREMENT_RANGES.items():
            value = data.get(field)
            if value is not None and not (low <= value <= high):
                errors[field] = f"{label} يجب أن يكون بين {low} و {high} سم"

        # the commune must really belong to the chosen wilaya
        if data["commune"].wilaya_id != data["wilaya"].id:
            errors["commune"] = "هذه البلدية لا تتبع الولاية المختارة"

        if errors:
            raise serializers.ValidationError(errors)
        return data

    def create(self, validated_data):
        """Shrink the photo first, then save the order (the file goes to BackEnd/uploads/)."""
        validated_data["model_image"] = optimize_image(validated_data["model_image"])
        return super().create(validated_data)


class OrderSerializer(serializers.ModelSerializer):
    """What the dashboard receives. Image is a RELATIVE url, the frontend adds the server address."""

    order_number = serializers.CharField(read_only=True)
    wilaya_name = serializers.CharField(source="wilaya.name", read_only=True)
    commune_name = serializers.CharField(source="commune.name", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    model_image = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_number", "full_name", "phone",
            "wilaya", "wilaya_name", "commune", "commune_name",
            "model_image", "chest", "hips", "sleeve_length", "garment_length",
            "status", "status_label", "created_at", "updated_at",
        ]
        read_only_fields = fields

    def get_model_image(self, order):
        """e.g. /uploads/ab12cd.jpg  (settings.MEDIA_URL + the path stored in the database)."""
        if not order.model_image:
            return None
        return f"{settings.MEDIA_URL}{order.model_image.name}"


class OrderStatusSerializer(serializers.Serializer):
    """Body of PATCH /api/orders/<id>/ : { "status": "contacted" }"""

    status = serializers.ChoiceField(
        choices=[value for value, _ in Order.STATUS_CHOICES],
        error_messages={"invalid_choice": "حالة غير صحيحة"},
    )
