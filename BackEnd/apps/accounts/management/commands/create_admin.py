"""
Create (or reset) the admin account.

    python manage.py create_admin
        uses ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD from the .env file

    python manage.py create_admin --email me@mail.com --password MyPass123

If an admin with this email already exists, its password is replaced.
That makes this command the way to recover a forgotten password.
"""
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import Admin


class Command(BaseCommand):
    help = "Create the dashboard admin (values come from .env unless given as options)"

    def add_arguments(self, parser):
        parser.add_argument("--username", default=settings.ADMIN_USERNAME)
        parser.add_argument("--email", default=settings.ADMIN_EMAIL)
        parser.add_argument("--password", default=settings.ADMIN_PASSWORD)

    def handle(self, *args, **options):
        email = options["email"].strip().lower()
        password = options["password"]

        if not email or not password:
            raise CommandError("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env (or use --email / --password).")
        if len(password) < 8:
            raise CommandError("The password must have at least 8 characters.")

        # Look for an existing admin by email, then by username (the email may have been
        # changed from the dashboard). If found we reset it, otherwise we create it.
        admin = (
            Admin.objects.filter(email__iexact=email).first()
            or Admin.objects.filter(username=options["username"]).first()
        )
        created = admin is None
        if created:
            admin = Admin(username=options["username"], email=email)
        admin.email = email

        admin.set_password(password)
        admin.save()

        action = "created" if created else "password reset for"
        self.stdout.write(self.style.SUCCESS(f"Admin {action}: {admin.email}"))
