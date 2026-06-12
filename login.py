"""
Run this once to authenticate with your Google account.
It opens a browser window — log in to Google, then close the browser.
Your session is saved to ~/.notebooklm/profiles/default/storage_state.json
"""

import subprocess
import sys

def main():
    print("Opening browser for Google login...")
    print("1. Log in to your Google account (mataseloanamaria@gmail.com)")
    print("2. Close the browser when done")
    print()
    result = subprocess.run(
        [sys.executable, "-m", "notebooklm", "login"],
        capture_output=False
    )
    if result.returncode == 0:
        print("\nLogin successful! You can now run notebooklm_client.py")
    else:
        print("\nLogin failed. Try running: python3 -m notebooklm login")

if __name__ == "__main__":
    main()
