"""Email service for sending verification codes and notifications."""
import smtplib
import random
import string
import socket
from email.message import EmailMessage
from datetime import datetime, timedelta
from typing import Dict, Optional
from app.core.config import settings


# In-memory storage for verification codes (use Redis in production)
verification_codes: Dict[str, Dict] = {}


def generate_verification_code() -> str:
    """Generate a 6-digit verification code."""
    return ''.join(random.choices(string.digits, k=6))


def store_verification_code(email: str, code: str, expires_minutes: int = 10) -> None:
    """Store verification code with expiration time."""
    verification_codes[email] = {
        'code': code,
        'expires_at': datetime.utcnow() + timedelta(minutes=expires_minutes),
        'attempts': 0
    }


def verify_code(email: str, code: str, consume: bool = True) -> bool:
    """Verify if the code is correct and not expired."""
    if email not in verification_codes:
        return False
    
    stored = verification_codes[email]
    
    # Check expiration
    if datetime.utcnow() > stored['expires_at']:
        del verification_codes[email]
        return False
    
    # Check attempts (max 3)
    if stored['attempts'] >= 3:
        del verification_codes[email]
        return False
    
    # Check code
    if stored['code'] != code:
        stored['attempts'] += 1
        return False
    
    # Success - remove code if consume is True
    if consume:
        del verification_codes[email]
    return True


def get_smtp_connection(timeout: int = 30):
    """
    Create a secured SMTP connection to Gmail.
    Tries Port 587 (STARTTLS) first — recommended for Railway.
    Falls back to Port 465 (SSL) if 587 fails.
    """
    host = settings.EMAIL_HOST

    # 1. Try Port 587 (STARTTLS) — Railway recommended
    try:
        print(f"Connecting to SMTP (STARTTLS) {host}:587...")
        smtp = smtplib.SMTP(host, 587, timeout=timeout)
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        print("SMTP 587 connected successfully.")
        return smtp
    except Exception as e:
        print(f"Port 587 hostname failed: {e}")

    # 2. Try Port 587 with forced IPv4
    try:
        addr_info = socket.getaddrinfo(host, 587, socket.AF_INET, socket.SOCK_STREAM)
        ip_address = addr_info[0][4][0]
        print(f"Connecting to SMTP (STARTTLS) at {ip_address}:587 (IPv4)...")
        smtp = smtplib.SMTP(ip_address, 587, timeout=timeout)
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        print("SMTP 587 IPv4 connected successfully.")
        return smtp
    except Exception as e:
        print(f"Port 587 IPv4 failed: {e}")

    # 3. Fallback: Port 465 (Implicit SSL)
    try:
        print(f"Fallback: Connecting to SMTP (SSL) {host}:465...")
        return smtplib.SMTP_SSL(host, 465, timeout=timeout)
    except Exception as e:
        print(f"Port 465 hostname failed: {e}")

    # 4. Final: Port 465 with forced IPv4
    try:
        addr_info = socket.getaddrinfo(host, 465, socket.AF_INET, socket.SOCK_STREAM)
        ip_address = addr_info[0][4][0]
        print(f"Final attempt: SMTP SSL at {ip_address}:465 (IPv4)...")
        return smtplib.SMTP_SSL(ip_address, 465, timeout=timeout)
    except Exception as e:
        print(f"All SMTP connection attempts failed: {e}")
        raise e


def send_verification_email(to_email: str, code: str, full_name: str = "User") -> bool:
    """
    Send verification code email using Gmail SMTP.
    
    Args:
        to_email: Recipient email address
        code: 6-digit verification code
        full_name: User's full name
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Create email message
        msg = EmailMessage()
        msg.set_content(f"""
Hello {full_name},

Welcome to Adhyaan! 

Your verification code is: {code}

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.

Best regards,
The Adhyaan Team
""")
        
        msg["Subject"] = "Verify your Adhyaan account"
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email
        
        # Send email using configured SMTP
        with get_smtp_connection() as smtp:
            smtp.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
            smtp.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_welcome_email(to_email: str, full_name: str) -> bool:
    """Send welcome email after successful registration."""
    try:
        msg = EmailMessage()
        msg.set_content(f"""
Hello {full_name},

Welcome to Adhyaan! 🎉

Your account has been successfully created. You can now:

• Browse and read books
• Join study rooms
• Connect with other learners
• Track your reading progress

Start exploring now!

Best regards,
The Adhyaan Team
""")
        
        msg["Subject"] = "Welcome to Adhyaan!"
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email
        
        with get_smtp_connection() as smtp:
            smtp.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
            smtp.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False


def resend_verification_code(email: str, full_name: str = "User") -> Optional[str]:
    """
    Resend verification code to the email.
    
    Returns:
        str: New verification code if successful, None otherwise
    """
    # Generate new code
    code = generate_verification_code()
    
    # Store it
    store_verification_code(email, code)
    
    # Send email
    if send_verification_email(email, code, full_name):
        return code
    
    return None


def send_password_reset_email(to_email: str, reset_code: str) -> bool:
    """Send password reset email with reset code."""
    try:
        print(f"Attempting to send password reset email to: {to_email}")
        msg = EmailMessage()
        msg.set_content(f"""
Hello,

You have requested to reset your password for your Adhyaan account.

Your password reset code is: {reset_code}

This code will expire in 10 minutes. Please use it to reset your password.

If you didn't request this password reset, please ignore this email.

Best regards,
The Adhyaan Team
""")
        
        msg["Subject"] = "Password Reset Code - Adhyaan"
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email
        
        try:
            with get_smtp_connection() as smtp:
                smtp.set_debuglevel(1)  # Enable debug output
                print("Logging in to SMTP...")
                smtp.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
                print("Sending message...")
                smtp.send_message(msg)
        except Exception as smtp_err:
             print(f"SMTP Error: {smtp_err}")
             raise smtp_err
        
        print(f"Password reset email sent successfully to: {to_email}")
        return True
    
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
