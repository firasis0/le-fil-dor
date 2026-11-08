"""
Orders endpoints:

    POST   /api/orders/        PUBLIC  customer sends an order (multipart form)
    GET    /api/orders/        ADMIN   list orders (optional ?status=pending)
    GET    /api/orders/<id>/   ADMIN   one order
    PATCH  /api/orders/<id>/   ADMIN   change the status  {"status": "contacted"}
    DELETE /api/orders/<id>/   ADMIN   delete the order and its photo file
"""
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .emails import send_new_order_email
from .models import Order
from .serializers import OrderCreateSerializer, OrderSerializer, OrderStatusSerializer


class OrderListCreateView(APIView):
    """GET = admin list, POST = public order form."""

    parser_classes = [MultiPartParser, FormParser]   # the form sends a file

    def get_permissions(self):
        """Anyone may send an order, only the logged in admin may list them."""
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_throttles(self):
        """Limit order spam (see settings.py: order_create), only for POST."""
        if self.request.method == "POST":
            self.throttle_scope = "order_create"
            return super().get_throttles()
        return []

    def get(self, request):
        """List orders, newest first. Optional filter: ?status=pending"""
        orders = Order.objects.select_related("wilaya", "commune")
        wanted = request.query_params.get("status")
        if wanted:
            orders = orders.filter(status=wanted)
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        """Save the order, then email the admin (in the background)."""
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        send_new_order_email(order)

        return Response(
            {"id": order.id, "order_number": order.order_number},
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(APIView):
    """Admin only (default permission): read, change status, delete."""

    def get_order(self, pk):
        return get_object_or_404(Order.objects.select_related("wilaya", "commune"), pk=pk)

    def get(self, request, pk):
        return Response(OrderSerializer(self.get_order(pk)).data)

    def patch(self, request, pk):
        """Change only the status."""
        order = self.get_order(pk)
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = serializer.validated_data["status"]
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data)

    def delete(self, request, pk):
        """Delete the row AND the photo file in BackEnd/uploads/."""
        order = self.get_order(pk)
        order.model_image.delete(save=False)   # removes the file
        order.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
