from django.urls import path

from .views import ChangeEmailView, ChangePasswordView, LoginView, MeView

urlpatterns = [
    path("login/", LoginView.as_view(), name="auth-login"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("change-email/", ChangeEmailView.as_view(), name="auth-change-email"),
    path("change-password/", ChangePasswordView.as_view(), name="auth-change-password"),
]
