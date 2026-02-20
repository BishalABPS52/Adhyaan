"""
Script to convert token.pickle into a base64 string for Railway environment variable.
"""
import base64
import os

TOKEN_FILE = os.path.join(os.path.dirname(__file__), '..', 'token.pickle')

def main():
    if not os.path.exists(TOKEN_FILE):
        print(f"Error: {TOKEN_FILE} not found. Run generate_token.py first.")
        return

    with open(TOKEN_FILE, 'rb') as f:
        token_data = f.read()
        base64_token = base64.b64encode(token_data).decode('utf-8')
    
    print("\n" + "="*50)
    print("GMAIL_TOKEN_BASE64 (Copy the entire string below):")
    print("="*50)
    print(base64_token)
    print("="*50 + "\n")
    print("Add the above GMAIL_TOKEN_BASE64 to your Railway Environment Variables.")

if __name__ == "__main__":
    main()
