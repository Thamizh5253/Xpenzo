from django.urls import path

from .views import ask_orm_query_view , ChatHistoryView

urlpatterns = [
    path("", ask_orm_query_view, name="ask_sql"),
    path('history/', ChatHistoryView.as_view(), name='fetch_history'),
]
