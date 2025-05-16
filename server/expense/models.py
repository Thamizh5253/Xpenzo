from django.db import models
from django.contrib.auth.models import User



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
