"""
Serializers check the data sent by the website before the views use it.
Error messages are in Arabic because they are shown directly to the admin.
"""
from rest_framework import serializers

from .models import Admin

MIN_PASSWORD_LENGTH = 8


class AdminSerializer(serializers.ModelSerializer):
    """What we send back about the logged in admin (never the password)."""

    class Meta:
        model = Admin
        fields = ["id", "username", "email"]


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField()


class ChangeEmailSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_email = serializers.EmailField(max_length=255)

    def validate_new_email(self, value):
        """The new email must not already belong to another admin."""
        value = value.strip().lower()
        taken = Admin.objects.filter(email__iexact=value).exclude(id=self.context["admin"].id)
        if taken.exists():
            raise serializers.ValidationError("هذا البريد مستخدم من حساب آخر")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password = serializers.CharField()
    confirm_password = serializers.CharField()

    def validate_new_password(self, value):
        if len(value) < MIN_PASSWORD_LENGTH:
            raise serializers.ValidationError(f"كلمة المرور يجب أن تكون {MIN_PASSWORD_LENGTH} أحرف على الأقل")
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "تأكيد كلمة المرور غير مطابق"})
        if data["new_password"] == data["current_password"]:
            raise serializers.ValidationError({"new_password": "اختر كلمة مرور مختلفة عن الحالية"})
        return data
