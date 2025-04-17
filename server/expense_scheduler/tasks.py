from celery import shared_task
from datetime import date, timedelta
from .models import ExpenseSchedule
from django.db.models import Q  # Import Q here
from expense.models import Expense
from django.core.mail import send_mail
from django.conf import settings





@shared_task
def process_expense_schedules():
    today = date.today()
    
    # Get all active schedules where the next occurrence is due or not set yet
    schedules = ExpenseSchedule.objects.filter(
        is_active=True, 
        start_date__lte=today,  # Ensure it has started
    ).filter(
        Q(next_occurrence__lte=today) | Q(next_occurrence__isnull=True)
    )

    for schedule in schedules:
        # Check if the schedule's end_date has passed
        if schedule.end_date and schedule.end_date < today:
            # Mark the schedule as completed and skip it
            schedule.is_active = False
            schedule.save()
            continue
        
        # If next_occurrence is null, set it to start_date
        if not schedule.next_occurrence:
            schedule.next_occurrence = schedule.start_date

        # Create Expense record
        Expense.objects.create(
            user=schedule.user,
            amount=schedule.amount,
            date=today,
            category=schedule.category,
            payment_method=schedule.payment_method,
            description=schedule.description,
        )

        # Send an email notification (asynchronously)
        send_expense_email.delay(
            user_email=schedule.user.email,
            user_name=schedule.user.get_full_name() or schedule.user.username,
            amount=schedule.amount,
            description=schedule.description,
            date=str(today)
        )

        # Update last_processed field
        schedule.last_processed = today

        # Calculate next_occurrence based on frequency
        if schedule.frequency == 'daily':
            next_date = today + timedelta(days=schedule.interval)
        elif schedule.frequency == 'weekly':
            next_date = today + timedelta(weeks=schedule.interval)
        elif schedule.frequency == 'monthly':
            # To ensure next occurrence falls on the same day in the next month
            next_date = today.replace(day=1) + timedelta(days=32 * schedule.interval)
            next_date = next_date.replace(day=schedule.start_date.day)
        elif schedule.frequency == 'yearly':
            next_date = today.replace(year=today.year + schedule.interval)
        else:
            continue

        # Ensure that the new next_occurrence is within the end date
        if schedule.end_date and next_date > schedule.end_date:
            schedule.is_active = False
            schedule.save()
            continue

        # Set the next_occurrence date
        schedule.next_occurrence = next_date
        schedule.save()



@shared_task
def send_expense_email(user_email, user_name, amount, description, date):
    subject = "📅 Your Scheduled Expense Has Been Added - Xpenzo"
    message = (
        f"Hi {user_name},\n\n"
        f"We wanted to let you know that your scheduled expense has been successfully added to your account in **Xpenzo** on {date}.\n\n"
        f"🧾 **Expense Details:**\n"
        f"• Amount: ₹{amount}\n"
        f"• Description: {description}\n\n"
        f"This is part of your recurring schedule, and we’ve taken care of it for you automatically – no action needed!\n\n"
        f"💡 Stay on top of your finances effortlessly with Xpenzo.\n"
        f"You can view or edit your expenses anytime by logging into your Xpenzo dashboard.\n\n"
        f"Thanks for using Xpenzo 💙\n"
        f"— The Xpenzo Team"
    )

    from_email = settings.DEFAULT_FROM_EMAIL # Update this to match your domain

    send_mail(subject, message, from_email, [user_email])

