
import sys
import json
import socket
import time

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt4_get_summary.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

HOST = "127.0.0.1"
PORT = 8090
RETRIES = 3
TIMEOUT = 5  # seconds

def send_command(command):
    for attempt in range(RETRIES):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(TIMEOUT)
                s.connect((HOST, PORT))
                s.sendall(json.dumps(command).encode("utf-8"))
                data = s.recv(8192).decode("utf-8")
                return json.loads(data)
        except ConnectionRefusedError:
            # EA not running
            if attempt < RETRIES - 1:
                time.sleep(1)  # wait a bit before retrying
                continue
            return {"success": False, "message": f"Connection refused at {HOST}:{PORT}. Is MT4 EA running?"}
        except Exception as e:
            return {"success": False, "message": str(e)}

# Step 1: Login
login_request = {"action": "login", "login": login, "password": password, "server": server}
login_response = send_command(login_request)

if not login_response.get("success"):
    print(json.dumps({"success": False, "message": login_response.get("message", "Failed to connect to MT4")}))
    sys.exit(1)

# Step 2: Get account summary
summary_request = {"action": "get_account_info"}
summary_response = send_command(summary_request)

if not summary_response.get("success"):
    print(json.dumps({"success": False, "message": summary_response.get("message", "Could not fetch account info")}))
    sys.exit(1)

# Step 3: Return standard output
output = {
    "success": True,
    "login": summary_response.get("login", login),
    "currency": summary_response.get("currency", ""),
    "balance": summary_response.get("balance", 0),
    "equity": summary_response.get("equity", 0),
    "margin": summary_response.get("margin", 0),
    "freeMargin": summary_response.get("freeMargin", 0),
    "marginLevel": summary_response.get("marginLevel", 0)
}

print(json.dumps(output))
