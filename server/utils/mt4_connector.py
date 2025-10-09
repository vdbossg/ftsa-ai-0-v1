# server/utils/mt4_connector.py
import sys
import json
import socket
import time

# Arguments
login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

# =====================================================
# MT4 Connection via Local Socket (Pytrader / Bridge)
# =====================================================
# This assumes you have an MT4 Expert Advisor running locally
# that listens on a socket (default port 8090) for JSON commands.

HOST = "127.0.0.1"
PORT = 8090

def send_command(command):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)
            s.connect((HOST, PORT))
            s.sendall(json.dumps(command).encode("utf-8"))
            data = s.recv(8192).decode("utf-8")
            return json.loads(data)
    except Exception as e:
        return {"success": False, "message": str(e)}

# =====================================================
# Step 1: Login Request
# =====================================================
login_command = {
    "action": "login",
    "login": login,
    "password": password,
    "server": server
}

response = send_command(login_command)

if not response.get("success"):
    print(json.dumps({
        "success": False,
        "message": response.get("message", "Failed to login to MT4 account")
    }))
    sys.exit(1)

# =====================================================
# Step 2: Get Account Info
# =====================================================
info_command = {"action": "get_account_info"}
account_info = send_command(info_command)

if not account_info.get("success"):
    print(json.dumps({
        "success": False,
        "message": account_info.get("message", "Could not retrieve account info")
    }))
    sys.exit(1)

# =====================================================
# Step 3: Return Data
# =====================================================
output = {
    "success": True,
    "currency": account_info.get("currency"),
    "login": account_info.get("login", login),
    "balance": account_info.get("balance"),
    "equity": account_info.get("equity"),
    "margin": account_info.get("margin"),
    "freeMargin": account_info.get("freeMargin"),
    "marginLevel": account_info.get("marginLevel")
}

print(json.dumps(output))
