from django.urls import path
from .views import register_user, login_user, protected_view , get_user_profile , create_or_update_profile , forgot_password , reset_password
from .views import list_possible_group_members , refresh_token_view

urlpatterns = [
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),
    path("protected/", protected_view, name="protected"),
    path("profile/", get_user_profile, name="get_profile"),
    path("profile/create_or_update/", create_or_update_profile, name="create_or_update_profile"),
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/', reset_password, name='reset-password'),
    path('groups/members/', list_possible_group_members, name='group-members-list'),
    path('refresh/', refresh_token_view, name='token_refresh'),

]


