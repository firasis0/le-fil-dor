"""
Admin login token.

How it works (simple version):
  1. The admin logs in with email + password.
  2. We create a token: a small signed text that says "this is admin number 3".
     It is signed with SECRET_KEY, so nobody can forge it, and it expires after
     TOKEN_LIFETIME_DAYS (see .env).
  3. The website sends the token with every request:   Authorization: Bearer <token>
  4. AdminTokenAuthentication (below) reads it and finds the admin.

Nothing is stored in the database for tokens.
When the password changes, old tokens stop working (see `_password_stamp`).
"""
import hashlib

from django.conf import settings
from django.core import signing
from rest_framework import authentication, exceptions

from .models import Admin

# A "salt" makes our tokens different from any other signed value in the project
TOKEN_SALT = "le-fil-dor-admin-token"


def _password_stamp(admin):
    """
    A short fingerprint of the current password hash.
    It is placed inside the token: after a password change the fingerprint
    no longer matches, so every older token is refused automatically.
    """
    return hashlib.sha256(admin.password_hash.encode()).hexdigest()[:16]


def make_token(admin):
    """Create the signed login token for this admin."""
    return signing.dumps({"id": admin.id, "stamp": _password_stamp(admin)}, salt=TOKEN_SALT)


class AdminTokenAuthentication(authentication.BaseAuthentication):
    """Reads  'Authorization: Bearer <token>'  and returns the matching Admin."""

    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None  # no token sent: the request stays anonymous

        token = header[len("Bearer "):].strip()
        max_age = settings.TOKEN_LIFETIME_DAYS * 24 * 3600

        try:
            data = signing.loads(token, salt=TOKEN_SALT, max_age=max_age)
        except signing.SignatureExpired:
            raise exceptions.AuthenticationFailed("انتهت صلاحية الجلسة، سجّل الدخول من جديد")
        except signing.BadSignature:
            raise exceptions.AuthenticationFailed("رمز الدخول غير صالح")

        admin = Admin.objects.filter(id=data.get("id")).first()
        if admin is None or data.get("stamp") != _password_stamp(admin):
            raise exceptions.AuthenticationFailed("انتهت صلاحية الجلسة، سجّل الدخول من جديد")

        return (admin, token)

    def authenticate_header(self, request):
        # Makes DRF answer 401 (not 403) when the token is missing or wrong
        return "Bearer"
