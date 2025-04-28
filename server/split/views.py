from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .models import ExpenseGroup, GroupMember
from .serializers import ExpenseGroupSerializer
from decimal import Decimal


from .models import GroupExpense, ExpenseSplit
from .serializers import GroupExpenseSerializer, ExpenseSplitSerializer
from decimal import Decimal

import json




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group(request):
    data = request.data.copy()
    members_data = data.pop('members', [])

    if isinstance(members_data, str):
        members_data = json.loads(members_data)
    
    serializer = ExpenseGroupSerializer(data=data)
    
    if serializer.is_valid():
        group = serializer.save(created_by=request.user)
        GroupMember.objects.create(group=group, user=request.user, is_admin=True)

        data_list = json.loads(members_data[0])

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
                return Response({"error": "Only an admin can delete this group."},
                                status=status.HTTP_403_FORBIDDEN)
       

        # Delete the group
        group.delete()
        return Response({"message": "Group deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

    except ExpenseGroup.DoesNotExist:
        return Response({"error": "Group not found."}, status=status.HTTP_404_NOT_FOUND)

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
    expenses_data = GroupExpenseSerializer(expenses, many=True).data
    return Response(expenses_data, status=status.HTTP_200_OK)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_group_expense(request):
    data = request.data
    print(data)
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
                ExpenseSplit.objects.create(expense=expense, user=user, amount_owed=amount_owed)

        elif split_type == 'PERCENTAGE':
            # Percent-based splits, sum should be 100
            # total_percent = sum([split['shares'] for split in data['splits']])
            total_percent = sum([split['percentage'] for split in data['splits'] if split['percentage'] is not None])

            print(total_percent)
            if total_percent != 100:
                return Response({"detail": "Total percentage must be 100."}, status=status.HTTP_400_BAD_REQUEST)

            for member_data in data['splits']:
                user = get_object_or_404(User, id=member_data['user_id'])
                percentage = Decimal(member_data['percentage'])
                amount_owed = (percentage / 100) * total_amount
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

                ExpenseSplit.objects.create(
                    expense=expense,
                    user=user,
                    amount_owed=amount_owed,
                    shares=shares
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
        expense = split.expense
        data["expenses_user_owes"].append({
            "expense_id": str(expense.id),
            "description": expense.description,
            "amount_owed": split.amount_owed,
            "paid_to": expense.paid_by.username,
            "group": expense.group.group_name,
            "date": expense.date
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
                "date": expense.date
            })

    return Response(data)
