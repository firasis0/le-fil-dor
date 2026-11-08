from django.contrib.auth.hashers import check_password, make_password
from django.db import models


class Admin(models.Model):
    """
    The shop owner who logs in to the dashboard.
    Maps to the existing `admins` table (created by le_fil_dor_schema.sql).
    The password is never stored as plain text, only as a hash.
    """

    username = models.CharField(max_length=100, unique=True)
    email = models.CharField(max_length=255, unique=True)
    password_hash = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    # Django REST framework asks every "user" this question to know if it is logged in.
    # Since an Admin object only exists after a successful login, the answer is always True.
    is_authenticated = True

    class Meta:
        managed = False        # the table already exists, Django must not touch it
        db_table = "admins"

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Turn a plain password into a hash and keep it (call .save() afterwards)."""
        self.password_hash = make_password(raw_password)

    def check_password(self, raw_password):
        """True if the plain password matches the stored hash."""
        return check_password(raw_password, self.password_hash)
