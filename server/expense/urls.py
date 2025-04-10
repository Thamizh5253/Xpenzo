from django.urls import path
from .views import expense_list, expense_detail

urlpatterns = [
    path('', expense_list, name='expense-list'),
    path('<int:pk>/', expense_detail, name='expense-detail'),
]
