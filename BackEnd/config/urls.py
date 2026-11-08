"""
URL map of the whole backend.

    /api/auth/...       admin login + change email / password   (apps/accounts)
    /api/orders/...     create / list / update / delete orders   (apps/orders)
    /api/geography/...  wilayas and communes for the form        (apps/geography)
    /uploads/...        the uploaded order photos
    /admin/             Django's own admin site (optional)
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/orders/", include("apps.orders.urls")),
    path("api/geography/", include("apps.geography.urls")),

    # Serve the photos saved in BackEnd/uploads/.
    # Files have random names, so nobody can guess a link.
    # (For heavy traffic you can let nginx serve /uploads/ instead.)
    re_path(r"^uploads/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]
