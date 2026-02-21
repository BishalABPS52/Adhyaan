import sys
import os
from pathlib import Path

# Add the project root to sys.path
root_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(root_dir))

from app.services.email_service import send_password_reset_email

def test_email():
    target_email = "bs426808@gmail.com"
    code = "123456"
    
    print(f"Testing Gmail API email sending to {target_email}...")
    success = send_password_reset_email(target_email, code)
    
    if success:
        print("✅ Email sent successfully via Gmail API!")
    else:
        print("❌ Failed to send email. Check logs above.")

if __name__ == "__main__":
    test_email()
