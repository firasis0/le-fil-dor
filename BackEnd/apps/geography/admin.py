from django.contrib import admin

from .models import Commune, Wilaya


@admin.register(Wilaya)
class WilayaAdmin(admin.ModelAdmin):
    list_display = ("id", "code", "name")


@admin.register(Commune)
class CommuneAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "wilaya")
    list_filter = ("wilaya",)
    search_fields = ("name",)
