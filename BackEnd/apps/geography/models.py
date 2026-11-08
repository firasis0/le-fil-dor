from django.db import models

# Wialayas model :
class Wilaya(models.Model):
    code = models.CharField(
        max_length = 3,
        unique = True,
        null = True,
        blank = True
    )

    name = models.CharField(
        max_length = 100,
        unique = True
    )

    class Meta:
        managed = False
        db_table = 'wilayas'

    def __str__(self):
        return self.name

# Communes model :
class Commune(models.Model):
    wilaya = models.ForeignKey(
        Wilaya,
        on_delete = models.DO_NOTHING,
        db_column = 'wilaya_id'
    ) 

    name = models.CharField(max_length=150)

    class Meta:
        managed = False
        db_table = 'communes'
        unique_together = (('wilaya', 'name'),)

    def __str__(self):
        return f"{self.name} - {self.wilaya.name}"