"""
Fill the `wilayas` and `communes` tables (58 wilayas, 1541 communes, in Arabic)
from apps/geography/data/algeria.json.

    python manage.py seed_geography

It only inserts when the tables are EMPTY, so it can never create duplicates
or overwrite data you already have.
"""
import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.geography.models import Commune, Wilaya

DATA_FILE = Path(__file__).resolve().parents[2] / "data" / "algeria.json"


class Command(BaseCommand):
    help = "Insert the 58 wilayas and their communes if the tables are empty"

    @transaction.atomic   # all or nothing: a crash in the middle leaves the tables untouched
    def handle(self, *args, **options):
        if Wilaya.objects.exists() or Commune.objects.exists():
            self.stdout.write("Wilayas/communes already exist -> nothing to do.")
            return

        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))

        total_communes = 0
        for item in data:
            wilaya = Wilaya.objects.create(code=item["code"], name=item["name"])
            Commune.objects.bulk_create(
                [Commune(wilaya=wilaya, name=name) for name in item["communes"]]
            )
            total_communes += len(item["communes"])

        self.stdout.write(self.style.SUCCESS(f"Inserted {len(data)} wilayas and {total_communes} communes."))
