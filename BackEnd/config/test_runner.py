"""
Our tables (admins, wilayas, communes, orders) are created by le_fil_dor_schema.sql,
so the models say `managed = False` and Django never creates them.

When we run  `python manage.py test`  Django builds an empty temporary database.
This runner switches the models to `managed = True` just for the tests, so the
temporary database gets the tables too.
"""
from django.apps import apps
from django.conf import settings
from django.test.runner import DiscoverRunner


class UnmanagedModelTestRunner(DiscoverRunner):
    def setup_test_environment(self, *args, **kwargs):
        super().setup_test_environment(*args, **kwargs)
        # remember the original value so we can put it back
        self._unmanaged = [m for m in apps.get_models() if not m._meta.managed]
        for model in self._unmanaged:
            model._meta.managed = True
        # The migrations of these apps say "unmanaged" too, so skip them in tests:
        # Django then creates the tables straight from the models.
        settings.MIGRATION_MODULES = {model._meta.app_label: None for model in self._unmanaged}

    def teardown_test_environment(self, *args, **kwargs):
        super().teardown_test_environment(*args, **kwargs)
        for model in self._unmanaged:
            model._meta.managed = False
