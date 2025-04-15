
from django.urls import path
from . import views

urlpatterns = [
    path("schedule/", views.get_schedules, name="get_all_schedules"),
    path("schedule/<int:schedule_id>/", views.get_schedules, name="get_single_schedule"),
    path("schedule/create/", views.create_or_update_schedule, name="create_schedule"),
    path("schedule/update/<int:schedule_id>/", views.create_or_update_schedule, name="update_schedule"),
    path("schedule/delete/<int:schedule_id>/", views.delete_schedule, name="delete_schedule"),
]
