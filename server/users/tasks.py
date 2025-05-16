from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from datetime import datetime

@shared_task
def send_password_reset_email(email, reset_link, user_name=None):
    """
    Send a professional password reset email with HTML formatting.
    """
    try:
        # Email content
        subject = "🔐 Password Reset Request – Xpenzo"
        
        # Text version
        text_content = (
            f"Dear {'User' if not user_name else user_name},\n\n"
            "We received a request to reset your password for your Xpenzo account.\n\n"
            "To reset your password, please click the link below:\n"
            f"{reset_link}\n\n"
            "This link will expire in 24 hours for your security.\n\n"
            "If you didn't request this password reset, please ignore this email. "
            "Your account remains secure and no changes will be made.\n\n"
            "For security reasons:\n"
            "- Never share your password or this link with anyone\n"
            "- Xpenzo staff will never ask for your password\n"
            "- Always check that links come from @xpenzo.com\n\n"
            "Need help? Contact our support team at support@xpenzo.com\n\n"
            "Stay smart with your spending!\n"
            "– The Xpenzo Team\n\n"
            "This is an automated message. Please do not reply directly to this email."
        )
        
        # HTML version
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 25px; }}
                    .header {{ color: #2c3e50; border-bottom: 1px solid #eaeaea; padding-bottom: 15px; }}
                    .button {{ 
                        display: inline-block; 
                        padding: 12px 24px; 
                        background-color: #4682b4; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 4px; 
                        font-weight: bold; 
                        margin: 15px 0;
                    }}
                    .security {{ 
                        background: #f8f9fa; 
                        padding: 18px; 
                        border-left: 4px solid #e74c3c; 
                        margin: 20px 0; 
                        font-size: 0.9em;
                    }}
                    .footer {{ 
                        font-size: 0.8em; 
                        color: #777777; 
                        border-top: 1px solid #eaeaea; 
                        padding-top: 15px; 
                        margin-top: 25px; 
                    }}
                    .highlight {{ color: #2c3e50; font-weight: 600; }}
                    .small {{ font-size: 0.9em; color: #7f8c8d; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin-bottom: 5px;">Password Reset Request</h2>
                        <p class="small">Request received on {datetime.now().strftime('%B %d, %Y at %H:%M %p')}</p>
                    </div>
                    
                    <p>Dear {'User' if not user_name else user_name},</p>
                    
                    <p>We received a request to reset your password for your Xpenzo account.</p>
                    
                    <p>To reset your password, please click the button below:</p>
                    
                    <p>
                        <a href="{reset_link}" class="button">Reset My Password</a>
                    </p>
                    
                    <p class="small">This link will expire in 24 hours for your security.</p>
                    
                    <p>If you didn't request this password reset, please ignore this email. 
                    Your account remains secure and no changes will be made.</p>
                    
                    <div class="security">
                        <h3 style="margin-top: 0; color: #2c3e50;">Security Information</h3>
                        <ul>
                            <li>Never share your password or this link with anyone</li>
                            <li>Xpenzo staff will never ask for your password</li>
                            <li>Always check that links come from @xpenzo.com</li>
                        </ul>
                    </div>
                    
                    <p>Need help? Contact our support team at 
                    <a href="mailto:{settings.DEFAULT_FROM_EMAIL}">{settings.DEFAULT_FROM_EMAIL}</a></p>
                    
                    <div class="footer">
                        <p>Stay smart with your spending!</p>
                        <p><strong>– The Xpenzo Team</strong></p>
                        <p>{settings.COMPANY_NAME}</p>
                        <p class="small">
                            This is an automated message. Please do not reply directly to this email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Create email
        email_msg = EmailMultiAlternatives(
            subject,
            text_content,
            f"{settings.COMPANY_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
            [email]
        )
        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()
        
        return f"Password reset email sent successfully to {email}"
    except Exception as e:
        return f"Failed to send password reset email to {email}: {str(e)}"