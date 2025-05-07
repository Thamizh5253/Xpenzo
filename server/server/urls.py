from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('expense/', include('expense.urls')),  # route for expense app
    path('ocr/', include('ocr.urls')),
    path('analytics/', include('charts.urls')),
    path('askai/', include('askai.urls')),
    path('scheduler/', include('expense_scheduler.urls')),
    path('split/', include('split.urls')),  # All expense split APIs
]
