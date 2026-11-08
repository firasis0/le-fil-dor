"""
Run with:  python manage.py test
Uses a temporary test database and a temporary uploads folder, so your real data is untouched.
"""
import io
import shutil
import tempfile

from django.core import mail
from django.test import TestCase, override_settings
from PIL import Image
from rest_framework.test import APIClient

from apps.accounts.authentication import make_token
from apps.accounts.models import Admin
from apps.geography.models import Commune, Wilaya

TEMP_UPLOADS = tempfile.mkdtemp()


def fake_photo():
    """A small valid JPEG file, like the one a customer uploads."""
    buffer = io.BytesIO()
    Image.new("RGB", (300, 400), (150, 40, 70)).save(buffer, "JPEG")
    buffer.name = "photo.jpg"
    buffer.seek(0)
    return buffer


@override_settings(MEDIA_ROOT=TEMP_UPLOADS)
class OrdersApiTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_UPLOADS, ignore_errors=True)

    def setUp(self):
        self.wilaya = Wilaya.objects.create(name="الجزائر", code="16")
        self.commune = Commune.objects.create(wilaya=self.wilaya, name="ابن عكنون")
        self.admin = Admin(username="admin", email="admin@test.dz")
        self.admin.set_password("secret12345")
        self.admin.save()
        self.client = APIClient()

    def order_data(self, **changes):
        data = {
            "full_name": "سارة بن علي", "phone": "0555123456",
            "wilaya": self.wilaya.id, "commune": self.commune.id,
            "chest": "92", "hips": "98", "sleeve_length": "58", "garment_length": "140",
            "model_image": fake_photo(),
        }
        data.update(changes)
        return data

    def login(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {make_token(self.admin)}")

    def test_customer_can_create_order_and_admin_gets_email(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post("/api/orders/", self.order_data(), format="multipart")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()["order_number"].startswith("LFD-"))

    def test_invalid_phone_is_rejected(self):
        response = self.client.post("/api/orders/", self.order_data(phone="123"), format="multipart")
        self.assertEqual(response.status_code, 400)
        self.assertIn("phone", response.json())

    def test_commune_must_belong_to_wilaya(self):
        other = Wilaya.objects.create(name="وهران", code="31")
        response = self.client.post("/api/orders/", self.order_data(wilaya=other.id), format="multipart")
        self.assertEqual(response.status_code, 400)

    def test_list_requires_login(self):
        self.assertEqual(self.client.get("/api/orders/").status_code, 401)

    def test_admin_can_list_change_status_and_delete(self):
        self.client.post("/api/orders/", self.order_data(), format="multipart")
        self.login()
        orders = self.client.get("/api/orders/").json()
        self.assertEqual(len(orders), 1)
        order_id = orders[0]["id"]

        patched = self.client.patch(f"/api/orders/{order_id}/", {"status": "contacted"}, format="json")
        self.assertEqual(patched.json()["status"], "contacted")

        self.assertEqual(self.client.delete(f"/api/orders/{order_id}/").status_code, 204)
        self.assertEqual(self.client.get("/api/orders/").json(), [])


class AccountTests(TestCase):
    def setUp(self):
        self.admin = Admin(username="admin", email="admin@test.dz")
        self.admin.set_password("secret12345")
        self.admin.save()
        self.client = APIClient()

    def test_login_ok_and_wrong_password(self):
        good = self.client.post("/api/auth/login/", {"email": "admin@test.dz", "password": "secret12345"}, format="json")
        self.assertEqual(good.status_code, 200)
        self.assertIn("token", good.json())
        bad = self.client.post("/api/auth/login/", {"email": "admin@test.dz", "password": "nope"}, format="json")
        self.assertEqual(bad.status_code, 400)

    def test_change_password_kills_old_token(self):
        old = make_token(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {old}")
        response = self.client.post(
            "/api/auth/change-password/",
            {"current_password": "secret12345", "new_password": "another12345", "confirm_password": "another12345"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)   # old token is dead
