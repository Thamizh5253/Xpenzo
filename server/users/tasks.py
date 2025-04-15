from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_password_reset_email(email, reset_link):
    subject = "🔐 Reset Your Password – Xpenzo"
    message = (
        "Hi there,\n\n"
        "We received a request to reset your password for your Xpenzo account.\n"
        "To proceed, please click the link below:\n\n"
        f"{reset_link}\n\n"
        "If you didn't request this password reset, please ignore this email. "
        "Your account remains secure.\n\n"
        "For any assistance, feel free to reach out to our support team.\n\n"
        "Stay smart with your spending!\n"
        "– The Xpenzo Team 💙"
    )
    from_email = settings.DEFAULT_FROM_EMAIL  # Make sure this is configured in your settings

    send_mail(subject, message, from_email, [email], fail_silently=False)
