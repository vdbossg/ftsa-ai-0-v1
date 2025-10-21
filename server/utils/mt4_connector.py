import sys
import json
import socket
import time

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt4_connector.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

HOST = "127.0.0.1"
PORT = 8090
RETRIES = 3
TIMEOUT = 5

def send_command(command):
    for attempt in range(RETRIES):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(TIMEOUT)
                s.connect((HOST, PORT))
                s.sendall(json.dumps(command).encode("utf-8"))
                data = s.recv(8192).decode("utf-8")
                return json.loads(data)
        except Exception as e:
            if attempt < RETRIES - 1:
                time.sleep(1)
                continue
            return {"success": False, "message": str(e)}

# Step 1: Login
login_response = send_command({"action": "login", "login": login, "password": password, "server": server})
if not login_response.get("success"):
    print(json.dumps({"success": False, "message": login_response.get("message", "Failed to login")})) 
    sys.exit(1)

# Step 2: Account info
info_response = send_command({"action": "get_account_info"})
if not info_response.get("success"):
    print(json.dumps({"success": False, "message": info_response.get("message", "Failed to fetch account info")}))
    sys.exit(1)

output = {
    "success": True,
    "login": info_response.get("login", login),
    "currency": info_response.get("currency", ""),
    "balance": info_response.get("balance", 0),
    "equity": info_response.get("equity", 0),
    "margin": info_response.get("margin", 0),
    "freeMargin": info_response.get("freeMargin", 0),
    "marginLevel": info_response.get("marginLevel", 0),
}

print(json.dumps(output))
