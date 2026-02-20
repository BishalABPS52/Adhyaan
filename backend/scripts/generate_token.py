"""
Generate Gmail API OAuth token for sending emails.
Run this script ONCE locally to authorize your Gmail account.
It will create token.pickle which your backend uses to send emails.
"""
from google_auth_oauthlib.flow import InstalledAppFlow
import pickle
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

# Path to credentials
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), '..', 'credentials.json')
TOKEN_FILE = os.path.join(os.path.dirname(__file__), '..', 'token.pickle')

def main():
    print("Starting Gmail API OAuth authorization...")
    print(f"Using credentials from: {os.path.abspath(CREDENTIALS_FILE)}")
    
    flow = InstalledAppFlow.from_client_secrets_file(
        CREDENTIALS_FILE, SCOPES
    )
    
    # This will open a browser window for authorization
    creds = flow.run_local_server(port=8000)
    
    # Save credentials for backend use
    with open(TOKEN_FILE, 'wb') as token:
        pickle.dump(creds, token)
    
    print(f"\n✅ token.pickle created at: {os.path.abspath(TOKEN_FILE)}")
    print("Upload this file to Railway alongside your backend code.")

if __name__ == "__main__":
    main()
