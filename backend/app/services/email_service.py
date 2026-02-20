"""Email service for sending verification codes and notifications via Gmail API."""
import random
import string
import base64
import pickle
import os
import json
from email.message import EmailMessage
from datetime import datetime, timedelta
from typing import Dict, Optional
from app.core.config import settings

# Gmail API imports
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials


# In-memory storage for verification codes (use Redis in production)
verification_codes: Dict[str, Dict] = {}

# Gmail API service (initialized once)
_gmail_service = None


def _get_gmail_service():
    """Get or create Gmail API service using environment variable or token file."""
    global _gmail_service
    if _gmail_service is not None:
        return _gmail_service

    creds = None
    
    # 1. Try to load from environment variable (Best for Railway/Production)
    gmail_token_base64 = os.getenv('GMAIL_TOKEN_BASE64')
    if gmail_token_base64:
        try:
            print("Loading Gmail API credentials from environment variable...")
            token_data = base64.b64decode(gmail_token_base64)
            creds = pickle.loads(token_data)
        except Exception as e:
            print(f"Error decoding GMAIL_TOKEN_BASE64: {e}")

    # 2. Fallback to local token.pickle (Best for Local Development)
    if not creds:
        token_path = os.path.join(os.path.dirname(__file__), '../../token.pickle')
        if os.path.exists(token_path):
            print(f"Loading Gmail API credentials from {token_path}...")
            with open(token_path, 'rb') as token_file:
                creds = pickle.load(token_file)

    if not creds:
        raise FileNotFoundError(
            "Gmail API credentials not found. Set GMAIL_TOKEN_BASE64 env var "
            "or ensure token.pickle exists locally."
        )

    # Refresh token if expired
    if creds and creds.expired and creds.refresh_token:
        print("Refreshing expired Gmail API token...")
        try:
            creds.refresh(Request())
            # If we loaded from a local file, update it
            token_path = os.path.join(os.path.dirname(__file__), '../../token.pickle')
            if os.path.exists(token_path):
                with open(token_path, 'wb') as token_file:
                    pickle.dump(creds, token_file)
                print("Local token.pickle refreshed and saved.")
        except Exception as e:
            print(f"Error refreshing Gmail token: {e}")

    _gmail_service = build('gmail', 'v1', credentials=creds)
    print("Gmail API service initialized successfully.")
    return _gmail_service


def _send_email_via_api(msg: EmailMessage) -> bool:
    """Send an EmailMessage using Gmail API."""
    try:
        service = _get_gmail_service()
        encoded_msg = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        send_result = service.users().messages().send(
            userId="me",
            body={'raw': encoded_msg}
        ).execute()
        print(f"Email sent via Gmail API! Message ID: {send_result['id']}")
        return True
    except Exception as e:
        print(f"Gmail API Error: {e}")
        return False


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


def send_verification_email(to_email: str, code: str, full_name: str = "User") -> bool:
    """Send verification code email using Gmail API."""
    try:
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
        
        return _send_email_via_api(msg)
    
    except Exception as e:
        print(f"Error sending verification email: {e}")
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
        
        return _send_email_via_api(msg)
    
    except Exception as e:
        print(f"Error sending welcome email: {e}")
        return False


def resend_verification_code(email: str, full_name: str = "User") -> Optional[str]:
    """Resend verification code to the email."""
    code = generate_verification_code()
    store_verification_code(email, code)
    
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
        
        success = _send_email_via_api(msg)
        if success:
            print(f"Password reset email sent successfully to: {to_email}")
        return success
    
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
