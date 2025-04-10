
from django.urls import path
from .views import receipt_ocr_api

urlpatterns = [
    path('extract-receipt/', receipt_ocr_api, name='extract_receipt'),
]
