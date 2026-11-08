from django.contrib import admin

from .models import Order


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "full_name", "phone", "wilaya", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("full_name", "phone")
