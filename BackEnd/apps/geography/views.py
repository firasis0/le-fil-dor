from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Commune, Wilaya
from .serializers import CommuneSerializer, WilayaSerializer


# Wilaya View :
# GET /api/geography/wilayas/   ->  all the wilayas (public, used by the order form)
class WilayaListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        wilayas = Wilaya.objects.order_by("id")

        serializer = WilayaSerializer(wilayas, many=True)

        return Response(serializer.data)


# Commune View :
# GET /api/geography/communes/?wilaya_id=16   ->  the communes of one wilaya (public)
class CommuneListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        wilaya_id = request.query_params.get("wilaya_id")

        # the id must be a number, otherwise the database query would crash
        if not wilaya_id or not wilaya_id.isdigit():
            return Response({"error": "wilaya_id is required"}, status=400)

        communes = Commune.objects.filter(wilaya_id=wilaya_id).order_by("name")

        serializer = CommuneSerializer(communes, many=True)

        return Response(serializer.data)
