from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from expense.models import Expense


class ExpenseSchedule(models.Model):
    """Model to schedule recurring expenses"""

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)
    interval = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField(null=True, blank=True)

    category = models.CharField(max_length=20, choices=Expense.CATEGORIES, default='others')
    payment_method = models.CharField(max_length=10, choices=Expense.PAYMENT_METHODS, default='upi')
    description = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)
    last_processed = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s {self.name} ({self.frequency})"


class ScheduledExpenseLog(models.Model):
    """Log when a scheduled expense was created"""
    schedule = models.ForeignKey(ExpenseSchedule, on_delete=models.CASCADE, related_name='logs')
    expense = models.ForeignKey(Expense, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_date = models.DateField()
    processed_date = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = [
        ('processed', 'Processed'),
        ('skipped', 'Skipped'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='processed')
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-scheduled_date']

    def __str__(self):
        return f"{self.schedule.name} - {self.scheduled_date} ({self.status})"
