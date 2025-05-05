# tasks.py
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
import qrcode
from io import BytesIO
import base64
from email.mime.image import MIMEImage
from datetime import datetime

@shared_task
def send_payment_request_email(recipient_email, recipient_name, payer_name, amount, payer_upi_id):
    """
    Send a professional payment request email with embedded UPI QR code.
    """
    try:
        # UPI URI Format
        upi_uri = f"upi://pay?pa={payer_upi_id}&pn={payer_name}&am={amount}&cu=INR"

        # Generate QR Code
        qr = qrcode.make(upi_uri)
        buffer = BytesIO()
        qr.save(buffer, format="PNG")
        qr_data = buffer.getvalue()

        # Generate unique content ID
        qr_cid = f"payment_qr_{datetime.now().strftime('%Y%m%d%H%M%S')}"

        # Email content
        subject = f"Payment Request: Settlement of ₹{amount} for Shared Expenses"
        
        text_content = (
            f"Dear {recipient_name},\n\n"
            f"I hope this message finds you well. This is a gentle reminder regarding your "
            f"outstanding payment of ₹{amount} to {payer_name} for our recent shared expenses.\n\n"
            "Payment Options:\n"
            f"1. Scan the QR code attached to this email\n"
            f"2. Direct UPI Transfer to: {payer_upi_id}\n"
            f"3. Cash payment (please inform {payer_name} directly if choosing this option)\n\n"
            f"Requested Amount: ₹{amount}\n"
            f"Payment Reference: XPENZO-{datetime.now().strftime('%Y%m%d')}\n\n"
            "For your convenience, we've included a UPI QR code that can be scanned "
            "using any UPI-enabled banking application for instant payment.\n\n"
            "If you've already processed this payment, please accept our thanks and "
            "kindly disregard this reminder.\n\n"
            "We appreciate your prompt attention to this matter.\n\n"
            "Warm regards,\n"
            "The Xpenzo Team\n"
            f"{settings.COMPANY_NAME}\n"
            "This is an automated message. Please do not reply directly to this email."
        )
        
        html_content = f"""
        <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 25px; }}
                    .header {{ color: #2c3e50; border-bottom: 1px solid #eaeaea; padding-bottom: 15px; }}
                    .qr-container {{ text-align: center; margin: 25px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }}
                    .payment-details {{ background: #f0f8ff; padding: 18px; border-left: 4px solid #4682b4; margin: 20px 0; }}
                    .footer {{ font-size: 0.8em; color: #777777; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 25px; }}
                    .highlight {{ color: #2c3e50; font-weight: 600; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2 style="margin-bottom: 5px;">Payment Request</h2>
                        <p style="margin-top: 0; color: #7f8c8d;">Reference: XPENZO-{datetime.now().strftime('%Y%m%d')}</p>
                    </div>
                    
                    <p>Dear {recipient_name},</p>
                    
                    <p>I hope this message finds you well. This is a gentle reminder regarding your 
                    outstanding payment of <span class="highlight">₹{amount}</span> to 
                    <span class="highlight">{payer_name}</span> for our recent shared expenses.</p>
                    
                    <div class="qr-container">
                        <img src="cid:{qr_cid}" alt="UPI Payment QR Code" style="max-width: 220px;">
                        <p style="font-size: 0.9em; margin-top: 10px;">Scan with any UPI app to pay instantly</p>
                    </div>
                    
                    <div class="payment-details">
                        <h3 style="margin-top: 0; color: #2c3e50;">Payment Details</h3>
                        <p><strong>Payee Name:</strong> {payer_name}</p>
                        <p><strong>UPI ID:</strong> {payer_upi_id}</p>
                        <p><strong>Amount:</strong> ₹{amount}</p>
                        <p><strong>Payment Reference:</strong> XPENZO-{datetime.now().strftime('%Y%m%d')}</p>
                    </div>
                    
                    <h3>Alternative Payment Methods:</h3>
                    <ol>
                        <li>Direct UPI Transfer to the ID above</li>
                        <li>Cash payment (please inform {payer_name} directly)</li>
                    </ol>
                    
                    <p>If you've already processed this payment, please accept our thanks and 
                    kindly disregard this reminder.</p>
                    
                    <p>For any questions or assistance, please contact our support team at 
                    <a href="mailto:{settings.DEFAULT_FROM_EMAIL}">{settings.DEFAULT_FROM_EMAIL}</a>.</p>
                    
                    <div class="footer">
                        <p>Warm regards,</p>
                        <p><strong>The Xpenzo Team</strong></p>
                        <p>{settings.COMPANY_NAME}<br>
                        <p style="font-size: 0.8em; color: #95a5a6;">
                            This is an automated message. Please do not reply directly to this email.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """

        # Create email
        email = EmailMultiAlternatives(
            subject,
            text_content,
            f"{settings.COMPANY_NAME} <{settings.DEFAULT_FROM_EMAIL}>",
            [recipient_email]
        )
        email.attach_alternative(html_content, "text/html")
        
        # Create MIMEImage for the QR code
        qr_image = MIMEImage(qr_data)
        qr_image.add_header('Content-ID', f'<{qr_cid}>')
        qr_image.add_header('Content-Disposition', 'inline', filename='payment_qr.png')
        email.attach(qr_image)
        
        # Attach as regular attachment for fallback
        email.attach(
            filename=f"UPI_Payment_{datetime.now().strftime('%Y%m%d')}.png",
            content=qr_data,
            mimetype="image/png"
        )
        
        email.send()
        return f"Email sent successfully to {recipient_email}"
    except Exception as e:
        return f"Failed to send email to {recipient_email}: {str(e)}"