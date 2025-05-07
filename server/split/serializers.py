from rest_framework import serializers
from .models import ExpenseGroup, GroupMember
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import GroupExpense, ExpenseSplit


# class GroupMemberSerializer(serializers.ModelSerializer):
#     user = serializers.StringRelatedField(read_only=True)

#     class Meta:
#         model = GroupMember
#         fields = ['id', 'user', 'is_admin', 'nickname', 'joined_at']


class GroupMemberSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = GroupMember
        fields = ['id', 'username', 'is_admin', 'nickname', 'joined_at']


class GroupMemberInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    nickname = serializers.CharField(required=False, allow_blank=True)
    is_admin = serializers.BooleanField(default=False)


class ExpenseGroupSerializer(serializers.ModelSerializer):
    members = GroupMemberInputSerializer(many=True, write_only=True, required=False)
    created_by = serializers.StringRelatedField(read_only=True)
    all_members = GroupMemberSerializer(source='members', many=True, read_only=True)

    class Meta:
        model = ExpenseGroup
        fields = [
            'id', 'group_name', 'created_by', 'created_at', 'updated_at',
            'currency', 'description', 'avatar', 'members', 'all_members'
        ]




class ExpenseSplitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseSplit
        fields = ['id', 'user', 'amount_owed', 'percentage', 'shares', 'status', 'settled_at']

class GroupExpenseSerializer(serializers.ModelSerializer):
    splits = ExpenseSplitSerializer(many=True, read_only=True)
    
    class Meta:
        model = GroupExpense
        fields = ['id', 'group', 'paid_by', 'amount', 'description', 'date', 'category', 'payment_method', 'split_type', 'created_at', 'updated_at', 'splits']
