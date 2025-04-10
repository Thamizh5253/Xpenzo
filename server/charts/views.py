from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import serializers, status
from expense.models import Expense
import pandas as pd
from .serializers import  SummarySerializer, CategoryWiseSerializer

from datetime import timedelta
from django.utils.timezone import now
from django.db.models import Sum

# Get user-specific summary
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def summary(request):
    expenses = Expense.objects.filter(user=request.user)
    if not expenses.exists():
        return Response({"message": "No expenses found for this user."}, status=status.HTTP_404_NOT_FOUND)
    
    df = pd.DataFrame(list(expenses.values('date', 'category', 'amount')))
    df['date'] = pd.to_datetime(df['date'])
    
    total_spent = df['amount'].sum()
    monthly_trend = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()
    monthly_trend = {str(period): value for period, value in monthly_trend.items()}
    daily_trend = df.groupby(df['date'].dt.date)['amount'].sum().to_dict()
    
    data = {
        "total_spent": total_spent,
        "monthly_trend": monthly_trend,
        "daily_trend": daily_trend
    }
    serializer = SummarySerializer(data=data)
    serializer.is_valid(raise_exception=True)
    
    return Response(serializer.data)

# Get user-specific category breakdown
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_wise(request):
    expenses = Expense.objects.filter(user=request.user)
    if not expenses.exists():
        return Response({"message": "No expenses found for this user."}, status=status.HTTP_404_NOT_FOUND)
    
    df = pd.DataFrame(list(expenses.values('category', 'amount')))
    category_spending = df.groupby('category')['amount'].sum().to_dict()
    
    data = {"category_spending": category_spending}
    serializer = CategoryWiseSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_month_total_expenses(request):
    today = now().date()
    start_of_month = today.replace(day=1)
    
    # Calculate total expenses for the current month
    total_expenses = Expense.objects.filter(
        user=request.user,
        date__gte=start_of_month,
        date__lt=today + timedelta(days=1)  # To include today's expenses
    ).aggregate(total_spent=Sum('amount'))['total_spent'] or 0


    return Response({"current_month_total": total_expenses}, status=status.HTTP_200_OK)