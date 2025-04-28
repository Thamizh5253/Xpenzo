from django.contrib import admin
from .models import  ExpenseGroup , GroupMember , GroupInvitation ,GroupExpense 
admin.site.register((ExpenseGroup , GroupExpense,GroupInvitation , GroupMember))  # Replace 'Split' with the actual model name