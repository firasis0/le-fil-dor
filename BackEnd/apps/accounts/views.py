"""
Admin account endpoints:

    POST /api/auth/login/            email + password  ->  token
    GET  /api/auth/me/               who is logged in (used to check the saved token)
    POST /api/auth/change-email/     current password + new email
    POST /api/auth/change-password/  current password + new password + confirmation
"""
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import make_token
from .models import Admin
from .serializers import (
    AdminSerializer,
    ChangeEmailSerializer,
    ChangePasswordSerializer,
    LoginSerializer,
)

WRONG_PASSWORD = "كلمة المرور الحالية غير صحيحة"


class LoginView(APIView):
    """Check the email + password and give back a login token."""

    permission_classes = [AllowAny]   # nobody is logged in yet
    throttle_scope = "login"          # max 10 attempts per minute (see settings.py)

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].strip()
        password = serializer.validated_data["password"]

        admin = Admin.objects.filter(email__iexact=email).first()

        # Same message for "unknown email" and "wrong password":
        # we never tell an attacker which one is wrong.
        if admin is None or not admin.check_password(password):
            return Response(
                {"detail": "البريد الإلكتروني أو كلمة المرور غير صحيحة"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"token": make_token(admin), "admin": AdminSerializer(admin).data})


class MeView(APIView):
    """Return the logged in admin. Needs a valid token (default permission)."""

    def get(self, request):
        return Response(AdminSerializer(request.user).data)


class ChangeEmailView(APIView):
    """Change the login email. The current password is required for safety."""

    def post(self, request):
        admin = request.user
        serializer = ChangeEmailSerializer(data=request.data, context={"admin": admin})
        serializer.is_valid(raise_exception=True)

        if not admin.check_password(serializer.validated_data["current_password"]):
            return Response({"current_password": [WRONG_PASSWORD]}, status=status.HTTP_400_BAD_REQUEST)

        admin.email = serializer.validated_data["new_email"]
        admin.save(update_fields=["email"])
        return Response({"admin": AdminSerializer(admin).data, "detail": "تم تغيير البريد الإلكتروني"})


class ChangePasswordView(APIView):
    """
    Change the login password. The current password is required for safety.
    Old tokens stop working, so we return a fresh token to keep this admin logged in.
    """

    def post(self, request):
        admin = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not admin.check_password(serializer.validated_data["current_password"]):
            return Response({"current_password": [WRONG_PASSWORD]}, status=status.HTTP_400_BAD_REQUEST)

        admin.set_password(serializer.validated_data["new_password"])
        admin.save(update_fields=["password_hash"])
        return Response({"token": make_token(admin), "detail": "تم تغيير كلمة المرور"})
