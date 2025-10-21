import sys
import json
import socket
import time
from datetime import datetime

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt4_get_trades.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

HOST = "127.0.0.1"
PORT = 8090
RETRIES = 3
TIMEOUT = 5  # seconds

def send_command(command):
    """Send JSON command to MT4 EA with retries."""
    for attempt in range(RETRIES):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(TIMEOUT)
                s.connect((HOST, PORT))
                s.sendall(json.dumps(command).encode("utf-8"))
                data = s.recv(65536).decode("utf-8")
                return json.loads(data)
        except Exception as e:
            if attempt < RETRIES - 1:
                time.sleep(1)
                continue
            return {"success": False, "message": str(e)}

# Step 1: Login
login_response = send_command({
    "action": "login",
    "login": login,
    "password": password,
    "server": server
})

if not login_response.get("success"):
    print(json.dumps({"success": False, "message": login_response.get("message", "Failed to login to MT4")}))
    sys.exit(1)

# Step 2: Get open trades
trades_response = send_command({"action": "get_open_trades"})
if not trades_response.get("success"):
    print(json.dumps({"success": False, "message": trades_response.get("message", "Could not fetch trades")}))
    sys.exit(1)

# Step 3: Format trades
formatted_trades = []
for t in trades_response.get("data", []):
    formatted_trades.append({
        "order": t.get("ticket"),
        "time": t.get("time") or datetime.now().strftime("%Y.%m.%d %H:%M:%S"),
        "type": t.get("type"),
        "size": t.get("volume"),
        "symbol": t.get("symbol"),
        "entry_price": t.get("open_price"),
        "current_price": t.get("current_price"),
        "sl": t.get("sl"),
        "tp": t.get("tp"),
        "profit": t.get("profit"),
        "commission": t.get("commission", 0.0),
        "swap": t.get("swap", 0.0),
    })

# Step 4: Return JSON output
print(json.dumps({"success": True, "data": formatted_trades}, indent=2))
