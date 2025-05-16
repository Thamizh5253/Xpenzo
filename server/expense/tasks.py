# tasks.py
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime

@shared_task
def send_budget_alert_email_task(user_email, username, total_expenses, budget):
    """
    Send a styled budget alert email when the user exceeds their monthly budget.
    """
    try:
        subject = "⚠️ Budget Alert: You've Exceeded Your Monthly Limit"
        today = datetime.now().strftime("%Y-%m-%d")
        
        text_content = (
            f"Hi {username},\n\n"
            f"You have exceeded your monthly budget of ₹{budget}.\n"
            f"Your total expenses are now ₹{total_expenses}.\n"
            f"Please review your expenses and consider adjusting your budget or spending.\n\n"
            "Best regards,\n"
            "The Xpenzo Team"
        )

        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', sans-serif; color: #333; background: #f4f4f4; padding: 20px; }}
                    .container {{ background: #fff; padding: 30px; border-radius: 10px; max-width: 600px; margin: auto; }}
                    .header {{ border-bottom: 1px solid #e0e0e0; margin-bottom: 20px; }}
                    .header h2 {{ color: #e74c3c; }}
                    .content p {{ line-height: 1.6; }}
                    .footer {{ font-size: 0.9em; color: #777; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>🚨 Budget Exceeded Alert</h2>
                        <p>Date: {today}</p>
                    </div>
                    <div class="content">
                        <p>Hi <strong>{username}</strong>,</p>
                        <p>We noticed that your <strong>total expenses</strong> have reached <span style="color: #e74c3c;"><strong>₹{total_expenses}</strong></span>, which is over your monthly budget of <strong>₹{budget}</strong>.</p>
                        <p>Please take a moment to review your recent transactions and consider adjusting your spending habits to stay within your financial goals.</p>
                        <p>If this was expected or you’ve recently updated your budget, you can disregard this alert.</p>
                    </div>
                    <div class="footer">
                        <p>Best regards,</p>
                        <p><strong>The Xpenzo Team</strong></p>
                        <p>{settings.COMPANY_NAME}</p>
                        <p style="font-size: 0.8em;">This is an automated message. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Compose the email
        email = EmailMultiAlternatives(
            subject,
            text_content,
            f"{settings.COMPANY_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
            [user_email]
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        return f"Budget alert sent to {user_email}"
    
    except Exception as e:
        return f"Failed to send budget alert to {user_email}: {str(e)}"
