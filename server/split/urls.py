from django.urls import path
from . import views

urlpatterns = [
    path('groups/', views.list_groups, name='list_groups'),
    path('groups/create/', views.create_group, name='create_group'),
    path('groups/delete/<uuid:group_id>/', views.delete_group, name='delete_group'),

    # path('groups/<uuid:group_id>/add_member/', views.add_member, name='add_member'),
    # path('groups/<uuid:group_id>/remove_member/<int:user_id>/', views.remove_member, name='remove_member'),


    path('groups_expense/create/', views.create_group_expense, name='create_group_expense'),
    path('groups_expense/<uuid:group_id>/expenses/', views.get_group_expenses, name='get_group_expenses'),

    path('user_expense/', views.user_split_expenses, name='get_group_expense'),

]
