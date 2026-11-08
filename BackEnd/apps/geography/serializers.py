from rest_framework import serializers
from .models import Wilaya , Commune

class WilayaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wilaya
        fields = ['id', 'name', 'code']

class CommuneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Commune
        fields = ['id', 'name', 'wilaya']