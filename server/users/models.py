

from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    # Budget-related fields
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    savings_goal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    income = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    # currency = models.CharField(max_length=5, default="USD")  # Allow different currencies

    # User preferences
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    

    # Extra user info
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)

    # Tracking timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
