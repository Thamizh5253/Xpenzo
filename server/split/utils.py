from collections import defaultdict
from .models import ExpenseSplit, GroupMember

def calculate_balances(group):
    balances = defaultdict(float)
    
    # Calculate who owes what
    for split in ExpenseSplit.objects.filter(expense__group=group, is_settled=False):
        balances[(split.user.id, split.expense.paid_by.id)] += float(split.amount_owed)
    
    # Net balances per user
    net_balances = defaultdict(float)
    for (debtor, creditor), amount in balances.items():
        net_balances[debtor] -= amount
        net_balances[creditor] += amount
    
    # Prepare response
    members = {m.user.id: m.user.username for m in GroupMember.objects.filter(group=group)}
    return {
        'balances': [
            {
                'user_id': uid,
                'username': members[uid],
                'balance': balance
            } for uid, balance in net_balances.items()
        ],
        'simplified_debts': simplify_balances(net_balances)
    }

def simplify_balances(net_balances):
    # Implement debt simplification algorithm here
    # (Reduces multiple debts to minimal transactions)
    return []