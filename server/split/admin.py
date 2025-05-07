from django.contrib import admin
from .models import  ExpenseGroup , GroupMember , GroupInvitation ,GroupExpense  , ExpenseSplit
admin.site.register((ExpenseGroup , GroupExpense,GroupInvitation , GroupMember , ExpenseSplit))  # Replace 'Split' with the actual model name