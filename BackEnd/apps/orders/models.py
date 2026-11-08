import uuid

from django.db import models

from apps.geography.models import Commune, Wilaya


def order_image_path(instance, filename):
    """
    Where an uploaded photo is saved, relative to the BackEnd/uploads/ folder.
    The original file name is thrown away and replaced by a random one,
    so two photos can never overwrite each other and links cannot be guessed.
    This relative path is the ONLY thing stored in the database (column model_image).
    """
    return f"{uuid.uuid4().hex}.jpg"


class Order(models.Model):
    """
    One caftan order sent by a customer.
    Maps to the existing `orders` table (created by le_fil_dor_schema.sql).
    """

    # The 5 allowed values of the `status` column (the database refuses anything else)
    STATUS_CHOICES = [
        ("pending", "جديد"),
        ("contacted", "تم الاتصال"),
        ("in_progress", "قيد التنفيذ"),
        ("completed", "مكتمل"),
        ("cancelled", "ملغى"),
    ]

    # --- customer ---
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    wilaya = models.ForeignKey(Wilaya, on_delete=models.DO_NOTHING, db_column="wilaya_id")
    commune = models.ForeignKey(Commune, on_delete=models.DO_NOTHING, db_column="commune_id")

    # --- the photo: the file lives in BackEnd/uploads/, the column keeps its path ---
    model_image = models.ImageField(upload_to=order_image_path, max_length=255)

    # --- the 4 measurements in centimetres ---
    chest = models.DecimalField(max_digits=6, decimal_places=2)
    hips = models.DecimalField(max_digits=6, decimal_places=2)
    sleeve_length = models.DecimalField(max_digits=6, decimal_places=2)
    garment_length = models.DecimalField(max_digits=6, decimal_places=2)

    # --- follow-up ---
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        managed = False        # the table already exists, Django must not touch it
        db_table = "orders"
        ordering = ["-created_at", "-id"]   # newest first

    def __str__(self):
        return f"{self.order_number} - {self.full_name}"

    @property
    def order_number(self):
        """Friendly number shown to the admin, e.g. id 7 -> LFD-0007."""
        return f"LFD-{self.id:04d}"
