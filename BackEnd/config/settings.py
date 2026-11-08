"""
Django settings for Le Fil d'Or.

Every value that changes between your computer and the server is read from the
.env file (see BackEnd/.env). You should not need to edit this file to deploy.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Read the .env file and put its values in os.environ
load_dotenv(BASE_DIR / ".env")


# ------------------------------------------------------------------
# Small helpers to read .env values
# ------------------------------------------------------------------
def env_bool(name, default=False):
    """Read a True/False value:  DEBUG=True  ->  True"""
    return os.getenv(name, str(default)).strip().lower() in ("1", "true", "yes", "on")


def env_list(name, default=""):
    """Read a comma separated list:  a.com,b.com  ->  ['a.com', 'b.com']"""
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


def env_int(name, default):
    """Read a whole number, falling back to the default when empty."""
    value = os.getenv(name, "").strip()
    return int(value) if value else default


# ------------------------------------------------------------------
# Core
# ------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-dev-only-key")
DEBUG = env_bool("DEBUG", True)
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")

# Address of the website (used in emails)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")


# ------------------------------------------------------------------
# Apps
# ------------------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third party apps
    "rest_framework",
    "corsheaders",

    # Local apps
    "apps.geography",   # wilayas + communes
    "apps.orders",      # customer orders + order emails
    "apps.accounts",    # admin login, change email / password
]

MIDDLEWARE = [
    # CORS must stay first: it lets the website (another address) call this API
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,  # finds apps/orders/templates/ (the email design lives there)
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ------------------------------------------------------------------
# Database (PostgreSQL) — the tables come from le_fil_dor_schema.sql
# ------------------------------------------------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST"),
        "PORT": os.getenv("DB_PORT"),
    }
}

# Our tables are created by the SQL file (models use managed = False),
# so tests need this runner to create them in the temporary test database.
TEST_RUNNER = "config.test_runner.UnmanagedModelTestRunner"


# ------------------------------------------------------------------
# REST framework (the API)
# ------------------------------------------------------------------
REST_FRAMEWORK = {
    # Every request is checked with our own login token (apps/accounts/authentication.py)
    "DEFAULT_AUTHENTICATION_CLASSES": ["apps.accounts.authentication.AdminTokenAuthentication"],
    # Safe by default: every endpoint needs a logged-in admin,
    # public endpoints (create order, wilayas...) say AllowAny themselves.
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    # Answer with JSON only (no browsable HTML page)
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    # Decimal numbers (measurements) are sent as numbers, not as "96.00" strings
    "COERCE_DECIMAL_TO_STRING": False,
    # Anti-spam limits, used with throttle_scope inside the views
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "login": "10/min",         # login attempts per IP
        "order_create": "30/hour",  # new orders per IP
    },
    # Set to 1 when the API is behind nginx so the real visitor IP is used
    "NUM_PROXIES": env_int("NUM_PROXIES", 0) or None,
}


# ------------------------------------------------------------------
# CORS: which websites may call the API
# ------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:5173")


# ------------------------------------------------------------------
# Admin login token
# ------------------------------------------------------------------
TOKEN_LIFETIME_DAYS = env_int("TOKEN_LIFETIME_DAYS", 7)


# ------------------------------------------------------------------
# Password validation (used by Django's own admin site)
# ------------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ------------------------------------------------------------------
# Language & time
# ------------------------------------------------------------------
LANGUAGE_CODE = "ar"            # built-in error messages are in Arabic
TIME_ZONE = "Africa/Algiers"    # order times are shown in Algeria's time
USE_I18N = True
USE_TZ = True


# ------------------------------------------------------------------
# Static files (only used by Django's own /admin/ pages)
# ------------------------------------------------------------------
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# ------------------------------------------------------------------
# Uploaded order photos
# Photos are saved in  BackEnd/uploads/  and only their path is stored in the database.
# ------------------------------------------------------------------
MEDIA_ROOT = BASE_DIR / "uploads"
MEDIA_URL = "/uploads/"
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)   # create the folder if it doesn't exist

MAX_UPLOAD_MB = env_int("MAX_UPLOAD_MB", 10)
# Django refuses bigger uploads before our own check, so give it a little room
DATA_UPLOAD_MAX_MEMORY_SIZE = (MAX_UPLOAD_MB + 2) * 1024 * 1024

DEFAULT_AUTO_FIELD = "django.db.models.AutoField"


# ------------------------------------------------------------------
# Email (Gmail + 16 character App Password)
# Django 6.1 configures email with MAILERS.
# ------------------------------------------------------------------
GMAIL_USER = os.getenv("EMAIL_HOST_USER", "").strip()
# Google shows the app password as "abcd efgh ijkl mnop" -> remove the spaces
GMAIL_APP_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "").replace(" ", "")

if GMAIL_USER and GMAIL_APP_PASSWORD:
    # Real sending through Gmail (or any SMTP server set in .env)
    MAILERS = {
        "default": {
            "BACKEND": "django.core.mail.backends.smtp.EmailBackend",
            "OPTIONS": {
                "host": os.getenv("EMAIL_HOST", "smtp.gmail.com"),
                "port": env_int("EMAIL_PORT", 587),
                "username": GMAIL_USER,
                "password": GMAIL_APP_PASSWORD,
                "use_tls": env_bool("EMAIL_USE_TLS", True),
                "timeout": 20,   # never hang more than 20 seconds
            },
        },
    }
else:
    # No Gmail details yet: print the email in the terminal instead of sending it
    MAILERS = {"default": {"BACKEND": "django.core.mail.backends.console.EmailBackend"}}

DEFAULT_FROM_EMAIL = f"Le Fil d'Or <{GMAIL_USER or 'no-reply@lefildor.dz'}>"
# Who receives the "new order" email (the Gmail account itself if nothing else is set)
ORDER_NOTIFY_EMAIL = os.getenv("ORDER_NOTIFY_EMAIL", "").strip() or GMAIL_USER


# ------------------------------------------------------------------
# First admin (read by:  python manage.py create_admin)
# ------------------------------------------------------------------
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
