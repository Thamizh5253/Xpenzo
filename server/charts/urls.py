
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('summary/', views.summary, name='summary'),
    path('category-wise/', views.category_wise, name='category-wise'),
    path('monthly-trend/', views.current_month_total_expenses, name='monthly-trend'),
]

# Frontend visualization hint (using Chart.js or similar library):
# Pie chart data -> category_spending
# Line chart data -> monthly_trend
# Bar chart data -> daily_trend
