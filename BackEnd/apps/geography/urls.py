from django.urls import path
from .views import WilayaListView, CommuneListView

urlpatterns = [
    path('wilayas/',WilayaListView.as_view(), name = 'wilaya-list'),
    path('communes/',CommuneListView.as_view(),name = 'commune-list')
]