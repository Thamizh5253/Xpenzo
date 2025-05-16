from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Expense
from .serializers import ExpenseSerializer

from datetime import datetime
from users.models import UserProfile
from expense.tasks import send_budget_alert_email_task



# Get all expenses or create a new one
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def expense_list(request):
    if request.method == "GET":
        expenses = Expense.objects.filter(user=request.user)
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        data = request.data.copy()
        data['user'] = request.user.id  # Ensure expense is linked to the logged-in user
        print("Received data:", data)
        serializer = ExpenseSerializer(data=data)

        if serializer.is_valid():
            
            try:
                 # Calculate total expenses for the current month
                 current_month = datetime.now().month
                 current_year = datetime.now().year
                 total_expenses = sum(
                 exp.amount for exp in Expense.objects.filter(
                    user=request.user,
                    date__month=current_month,
                    date__year=current_year
                )
            )
                 user_profile = UserProfile.objects.get(user=request.user)
                 serializer.save()
            except UserProfile.DoesNotExist:
            # If UserProfile does not exist, return a response to update the profile
                 return Response(
                {"detail": "User profile not found. Please update your profile."},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
            # user_profile = UserProfile.objects.get(user=request.user)
            print("Total expenses for the month:", total_expenses , "Monthly budget:", user_profile.monthly_budget)
            # Check if total exceeds budget
            if total_expenses > user_profile.monthly_budget:
                print("Total expenses exceed budget!")
                # Send email asynchronously using thread
                send_budget_alert_email_task.delay(
                    request.user.email,
                    request.user.username,
                    total_expenses,
                    user_profile.monthly_budget
                )


            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# Retrieve, update, or delete an expense
@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def expense_detail(request, pk):
    
    try:
        expense = Expense.objects.get(pk=pk, user=request.user)
        print(expense)
    except Expense.DoesNotExist:
        return Response({"error": "Expense not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        serializer = ExpenseSerializer(expense)
        return Response(serializer.data)

    if request.method == "PUT":
        data = request.data.copy()
        data['user'] = request.user.id  # Ensure ownership remains intact
        serializer = ExpenseSerializer(expense, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
