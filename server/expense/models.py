from django.db import models
from django.contrib.auth.models import User

# class Category(models.Model):
#     id = models.AutoField(primary_key=True)
#     name = models.CharField(max_length=100)
#     user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

#     def __str__(self):
#         return self.name


class Expense(models.Model):
    
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    ]

    CATEGORIES = [
        ('food', 'Food'),
        ('transport', 'Transport'),
        ('entertainment', 'Entertainment'),
        ('health', 'Health'),
        ('shopping', 'Shopping'),
        ('other', 'Other'),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORIES , default='other')
    # date = models.DateTimeField(auto_now_add=True)
    date = models.DateField()  # User manually inputs this date

    description = models.TextField(blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHODS)
    # receipt_image = models.ImageField(upload_to='receipts/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.amount} ({self.category})"

# class Budget(models.Model):
#     id = models.AutoField(primary_key=True)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
#     limit = models.DecimalField(max_digits=10, decimal_places=2)
#     month = models.DateField()
#     alerts_enabled = models.BooleanField(default=True)

#     def __str__(self):
#         category_display = self.category.name if self.category else "Overall"
#         return f"{self.user.username} - {category_display} - {self.month.strftime('%B %Y')}"

# class Alert(models.Model):
#     id = models.AutoField(primary_key=True)
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     budget = models.ForeignKey(Budget, on_delete=models.CASCADE)
#     alert_threshold = models.DecimalField(max_digits=10, decimal_places=2)
#     triggered_at = models.DateTimeField(auto_now_add=True)
#     status = models.BooleanField(default=False)

#     def __str__(self):
#         return f"Alert for {self.user.username} on {self.triggered_at.strftime('%Y-%m-%d %H:%M:%S')}"
