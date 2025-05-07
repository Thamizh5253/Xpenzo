from django.db import models
from django.contrib.auth.models import User
import uuid
from expense.models import Expense

class ExpenseGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group_name = models.CharField(max_length=100)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_groups")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    currency = models.CharField(max_length=3, default='INR')  # ISO currency codes
    description = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='group_avatars/', null=True, blank=True)

    def __str__(self):
        return self.group_name

class GroupMember(models.Model):
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE, related_name="members")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    nickname = models.CharField(max_length=50, blank=True, null=True)  # Custom name in group

    class Meta:
        unique_together = ('group', 'user')
        ordering = ['joined_at']

    def __str__(self):
        return f"{self.user.username} in {self.group.group_name}"

class GroupExpense(models.Model):
    SPLIT_TYPES = [
        ('EQUAL', 'Equal'),
        ('EXACT', 'Exact amounts'),
        ('PERCENTAGE', 'Percentage'),
        ('SHARES', 'Shares'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE, related_name="expenses")
    paid_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="paid_expenses")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    date = models.DateField()
    category = models.CharField(max_length=20, choices=Expense.CATEGORIES, default='other')
    payment_method = models.CharField(max_length=10, choices=Expense.PAYMENT_METHODS)
    split_type = models.CharField(max_length=10, choices=SPLIT_TYPES, default='EQUAL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    receipt = models.ImageField(upload_to='expense_receipts/', null=True, blank=True)
    personal_expense = models.ForeignKey('expense.Expense', on_delete=models.SET_NULL, null=True, blank=True)  # Link to personal expense if synced

    def __str__(self):
        return f"{self.description} - ₹{self.amount} by {self.paid_by.username}"



class ExpenseSplit(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"  # Payment not initiated
        REQUESTED = "requested", "Settlement Requested"  # Payer clicked "Settle"
        CONFIRMED = "confirmed", "Confirmed by Payee"  # Payee accepted
        REJECTED = "rejected", "Rejected by Payee"  # Payee rejected the claim

    expense = models.ForeignKey(GroupExpense, on_delete=models.CASCADE, related_name="splits")
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # who owes
    amount_owed = models.DecimalField(max_digits=10, decimal_places=2)
    percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    shares = models.PositiveSmallIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('expense', 'user')

    def __str__(self):
        return f"{self.user.username} owes ₹{self.amount_owed} for {self.expense.description} [{self.get_status_display()}]"

class Settlement(models.Model):
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE)
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments_made")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments_received")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('settled', 'Settled'), ('cancelled', 'Cancelled')], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, blank=True, null=True)
    transaction_reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.from_user} ➝ {self.to_user} ₹{self.amount} ({self.status})"

class GroupInvitation(models.Model):
    group = models.ForeignKey(ExpenseGroup, on_delete=models.CASCADE)
    email = models.EmailField()
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('expired', 'Expired')], default='pending')