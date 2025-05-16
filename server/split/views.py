from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import ExpenseGroup, GroupMember
from .serializers import ExpenseGroupSerializer
from decimal import Decimal

from expense.models import Expense
from expense.serializers import ExpenseSerializer
from expense.tasks import send_budget_alert_email_task

from .models import GroupExpense, ExpenseSplit
from .serializers import GroupExpenseSerializer, ExpenseSplitSerializer
from decimal import Decimal

import json

from  .tasks  import send_payment_request_email
from users.models import UserProfile


from django.db import transaction
from datetime import datetime

from cloudinary.uploader import upload
from cloudinary.uploader import destroy


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    data = request.data.copy()
    members_data = data.pop('members', [])
    group_image = request.FILES.get('avatar')

    if isinstance(members_data, str):
        members_data = json.loads(members_data)
    
    serializer = ExpenseGroupSerializer(data=data)
    
    if serializer.is_valid():
        group = serializer.save(created_by=request.user)
        GroupMember.objects.create(group=group, user=request.user, is_admin=True)

        if group_image:
            try:
                upload_result = upload(group_image,
                                       folder="Xpenzo/group_avatar",  # Specify your folder path
                    public_id=f"group_{group.id}",  # Unique identifier
                    overwrite=True,
                    resource_type="image",
                    transformation=[
                        {'width': 500, 'height': 500, 'crop': "fill"},
                        {'quality': "auto"}
                    ]
                )
                if 'secure_url' in upload_result:
                    group.avatar_url = upload_result['secure_url']
                    group.save()
                else:
                    return Response(
                        {"error": "Cloudinary upload failed - no secure URL returned"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            except Exception as e:
                return Response(
                    {"error": f"Image upload failed: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        try:
            data_list = json.loads(members_data[0] if isinstance(members_data, list) else members_data)
            
            for member in data_list:
                user_id = member.get('user_id')
                nickname = member.get('nickname', '')
                is_admin = member.get('is_admin', False)

                try:
                    user = User.objects.get(id=user_id)
                    if user != request.user:
                        GroupMember.objects.create(group=group, user=user, nickname=nickname, is_admin=is_admin)
                except User.DoesNotExist:
                    continue
                    
        except (json.JSONDecodeError, IndexError, TypeError) as e:
            return Response(
                {"error": f"Invalid members data: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(ExpenseGroupSerializer(group).data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_group(request, group_id):
    try:
        group = ExpenseGroup.objects.get(id=group_id)
        
        # Check if the user is an admin of the group
        membership = GroupMember.objects.get(group=group, user=request.user)
        if not membership.is_admin:
            return Response(
                {"error": "Only an admin can delete this group."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Delete the associated image from Cloudinary if it exists
        if group.avatar_url:
            try:
                # Extract public_id from the URL
                import re
                match = re.search(r'Xpenzo/group_avatar/(group_\d+|group_[a-f0-9-]+)', group.avatar_url)
                if match:
                    public_id = match.group(1)
                    # Delete the specific image
                    destroy(public_id)
                    # Optional: delete all derived resources too
                    # delete_resources([public_id], resource_type="image")
            except Exception as e:
                # Log the error but continue with group deletion
                import logging
                logging.error(f"Failed to delete Cloudinary image: {str(e)}")

        # Delete the group
        group.delete()
        return Response(
            {"message": "Group deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

    except ExpenseGroup.DoesNotExist:
        return Response(
            {"error": "Group not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    except GroupMember.DoesNotExist:
        return Response(
            {"error": "You are not a member of this group."},
            status=status.HTTP_403_FORBIDDEN
        )
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_groups(request):
    groups = ExpenseGroup.objects.filter(members__user=request.user).distinct()
    serializer = ExpenseGroupSerializer(groups, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_member(request, group_id):
    group = get_object_or_404(ExpenseGroup, id=group_id)
    user_id = request.data.get('user_id')
    nickname = request.data.get('nickname', '')

    user = get_object_or_404(User, id=user_id)

    if GroupMember.objects.filter(group=group, user=user).exists():
        return Response({"detail": "User already in group."}, status=status.HTTP_400_BAD_REQUEST)

    GroupMember.objects.create(group=group, user=user, nickname=nickname)
    return Response({"detail": "Member added successfully."})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, group_id, user_id):
    group = get_object_or_404(ExpenseGroup, id=group_id)
    member = get_object_or_404(GroupMember, group=group, user__id=user_id)

    if member.user == group.created_by:
        return Response({"detail": "Cannot remove the group creator."}, status=status.HTTP_400_BAD_REQUEST)

    member.delete()
    return Response({"detail": "Member removed successfully."})


#views for the expense group

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_group_expenses(request, group_id):
    group = get_object_or_404(ExpenseGroup, id=group_id)

    # Check if the user is part of the group
    if not group.members.filter(user=request.user).exists():
        return Response({"detail": "You are not a member of this group."}, status=status.HTTP_400_BAD_REQUEST)
    
    expenses = GroupExpense.objects.filter(group=group)
    print(expenses)
    expenses_data = GroupExpenseSerializer(expenses, many=True).data
    return Response(expenses_data, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_expense(request):
    data = request.data
    # print(data)
    # Get the group by ID
    group = get_object_or_404(ExpenseGroup, id=data['group_id'])
    
    # Check if the user is part of the group
    if not group.members.filter(user=request.user).exists():
        return Response({"detail": "You are not a member of this group."}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create the expense
    expense_data = {
        'group': group.id,
        'paid_by': request.user.id,
        'amount': data['amount'],
        'description': data.get('description', ''),
        'date': data['date'],
        'category': data.get('category', 'other'),
        'payment_method': data['payment_method'],
        'split_type': data['split_type']
    }
    current_user_data = {
        'description':data.get('description'),
        'date':data.get('date'),
        'category': data.get('category', 'other'),
        'payment_method': data['payment_method'],
        'user':request.user.id
    }

    serializer = GroupExpenseSerializer(data=expense_data)
    if serializer.is_valid():
        expense = serializer.save()

        # Calculate splits based on split type
        split_type = data['split_type']
        total_amount = Decimal(data['amount'])
        members = group.members.all()

        if split_type == 'EQUAL':
            # Divide the amount equally
            amount_per_member = total_amount / len(members)
            for member in members:
                # print(member.user)
                current_user_data['amount'] = str(round(amount_per_member, 2))
                ExpenseSplit.objects.create(expense=expense, user=member.user, amount_owed=amount_per_member)

        elif split_type == 'EXACT':
        # User must specify exact amounts
            total_entered_amount = sum(Decimal(split['amount_owed']) for split in data['splits'])

            if total_entered_amount != total_amount:
                return Response(
                    {"message": f"Check the Total entered amount ({total_amount})."},
                    status=400
                )
          
            for member_data in data['splits']:
                user = get_object_or_404(User, id=member_data['user_id'])
                amount_owed = Decimal(member_data['amount_owed'])
                if user == request.user:
                    current_user_data['amount'] = str(round(amount_owed, 2))
                    continue
                ExpenseSplit.objects.create(expense=expense, user=user, amount_owed=amount_owed)

        elif split_type == 'PERCENTAGE':
            
            total_percent = sum([split['percentage'] for split in data['splits'] if split['percentage'] is not None])

            if total_percent != 100:
                return Response({"detail": "Total percentage must be 100."}, status=status.HTTP_400_BAD_REQUEST)

            for member_data in data['splits']:
                user = get_object_or_404(User, id=member_data['user_id'])
                percentage = Decimal(member_data['percentage'])
                amount_owed = (percentage / 100) * total_amount
                if user == request.user:
                    current_user_data['amount'] = str(round(amount_owed, 2))
                    continue
                ExpenseSplit.objects.create(expense=expense, user=user, amount_owed=amount_owed, percentage=percentage)


        elif split_type == 'SHARES':
            # Share-based splits
            total_shares = sum([split['shares'] for split in data['splits']])
            print(total_shares)

            for member_data in data['splits']:
                user = get_object_or_404(User, id=member_data['user_id'])
                shares = member_data['shares']
                
                # Safely handle with Decimal
                shares_decimal = Decimal(str(shares))
                total_shares_decimal = Decimal(str(total_shares))

                amount_owed = (shares_decimal / total_shares_decimal) * total_amount
                if user == request.user:
                    current_user_data['amount'] = str(round(amount_owed, 2))
                    continue
                ExpenseSplit.objects.create(
                    expense=expense,
                    user=user,
                    amount_owed=amount_owed,
                    shares=shares
                )
        individual_user_expense_serializer = ExpenseSerializer(data=current_user_data)

        if individual_user_expense_serializer.is_valid():
            
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
                 individual_user_expense_serializer.save()
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
        else:
            print("invalid Data")


        upi_id = request.user.userprofile.upi_id if hasattr(request.user, 'userprofile') else None

        # Notify members who owe money (except the payer)
        for split in ExpenseSplit.objects.filter(expense=expense):
            if split.user != request.user and split.amount_owed > 0:
                send_payment_request_email.delay(
                    recipient_email=split.user.email,
                    recipient_name=split.user.username,
                    payer_name=request.user.username,
                    amount=str(split.amount_owed),
                    payer_upi_id = upi_id
                )

        return Response(GroupExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_split_expenses(request):
    user = request.user
    owed_splits = ExpenseSplit.objects.filter(user=user)
    paid_expenses = GroupExpense.objects.filter(paid_by=user)

    data = {
        "expenses_user_owes": [],
        "expenses_user_paid": [],
    }

    # Expenses the user owes to others
    for split in owed_splits:
        expense = split.expense # Exclude self-pay
        if expense.paid_by == user:
            continue
        
        data["expenses_user_owes"].append({
            "expense_id": str(expense.id),
            "description": expense.description,
            "amount_owed": split.amount_owed,
            "paid_to": expense.paid_by.username,
            "group": expense.group.group_name,
            "date": expense.date,
            "status": split.status,
            "settled_at": split.settled_at,
        })
       

    # Expenses the user paid for others
    for expense in paid_expenses:
        splits = expense.splits.exclude(user=user)  # Exclude self-pay
        for split in splits:
            data["expenses_user_paid"].append({
                "expense_id": str(expense.id),
                "description": expense.description,
                "user_owes": split.user.username,
                "amount_owed": split.amount_owed,
                "group": expense.group.group_name,
                "date": expense.date,
                "status": split.status,
                "settled_at": split.settled_at,
                # "payer": expense.paid_by.username,
            })
            


    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def request_settlement(request):
    expense_id = request.data.get('expense_id')
    if not expense_id:
        return Response({"detail": "Expense ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            # Get the expense and related splits
            expense = get_object_or_404(GroupExpense, id=expense_id)
            splits = ExpenseSplit.objects.filter(expense=expense)
            
            # Verify user is a payee in this expense
            if not splits.filter(user=request.user).exists():
                return Response(
                    {"detail": "You are not involved in this expense."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get the user's specific split
            user_split = splits.get(user=request.user)
            
            # Only allow requesting if status is PENDING
            if user_split.status != ExpenseSplit.Status.PENDING:
                return Response(
                    {"detail": "Settlement already requested or processed."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update status to REQUESTED
            user_split.status = ExpenseSplit.Status.REQUESTED
            user_split.save()
            
            return Response(
                {"detail": "Settlement request sent successfully."},
                status=status.HTTP_200_OK
            )
            
    except Exception as e:
        return Response(
            {"detail": f"Error requesting settlement: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_settlement(request):
    return handle_settlement_action(request, ExpenseSplit.Status.CONFIRMED, "confirmed")

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_settlement(request):
    return handle_settlement_action(request, ExpenseSplit.Status.REJECTED, "rejected")



def handle_settlement_action(request, new_status, action_name):
    expense_id = request.data.get('expense_id')
    username = request.data.get('username')  # The user whose split is being confirmed/rejected
    
    if not expense_id or not username:
        return Response(
            {"detail": "Expense ID and username are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with transaction.atomic():
            # Get the expense and the specific user's split
            expense = get_object_or_404(GroupExpense, id=expense_id)
            user = get_object_or_404(User, username=username)
            user_split = get_object_or_404(ExpenseSplit, expense=expense, user=user)
            
            # Verify the requesting user is the payer
            if request.user != expense.paid_by:
                return Response(
                    {"detail": "Only the payer can confirm/reject settlements."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Verify the split is in REQUESTED state
            if user_split.status != ExpenseSplit.Status.REQUESTED:
                return Response(
                    {"detail": "Settlement is not in requested state."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Update the status
            if new_status == ExpenseSplit.Status.CONFIRMED:
                user_split.status = new_status
                user_split.settled_at = datetime.now()
                message = "Settlement confirmed successfully."
            else:  # REJECTED
                user_split.status = ExpenseSplit.Status.PENDING  # Set back to PENDING
                message = "Settlement rejected and reset to pending."
            
            user_split.save()
            
            return Response(
                {"detail": message},
                status=status.HTTP_200_OK
            )
            
    except Exception as e:
        return Response(
            {"detail": f"Error processing settlement: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )