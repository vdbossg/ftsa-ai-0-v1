# server/utils/mt4_get_trades.py
import sys
import json
import socket
from datetime import datetime

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt4_get_trades.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

# =====================================================
# MT4 bridge connection (via socket)
# =====================================================
# ⚠️ Requires an MT4 Expert Advisor (EA) to be running on the same machine
#     and listening for socket commands (port 8090 by default).
#     This EA must handle:
#       { "action": "login" }
#       { "action": "get_open_trades" }

HOST = "127.0.0.1"
PORT = 8090

def send_command(command):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(5)
            s.connect((HOST, PORT))
            s.sendall(json.dumps(command).encode("utf-8"))
            data = s.recv(65536).decode("utf-8")
            return json.loads(data)
    except Exception as e:
        return {"success": False, "message": str(e)}

# =====================================================
# Step 1: Login to MT4 account
# =====================================================
login_request = {
    "action": "login",
    "login": login,
    "password": password,
    "server": server
}

login_response = send_command(login_request)
if not login_response.get("success"):
    print(json.dumps({"success": False, "message": login_response.get("message", "Failed to connect to MT4")}))
    sys.exit(1)

# =====================================================
# Step 2: Get open trades
# =====================================================
trades_response = send_command({"action": "get_open_trades"})

if not trades_response.get("success"):
    print(json.dumps({"success": False, "message": trades_response.get("message", "Could not fetch trades")}))
    sys.exit(1)

# =====================================================
# Step 3: Format trades in MT5-like structure
# =====================================================
formatted_trades = []
for t in trades_response.get("data", []):
    formatted_trades.append({
        "ticket": t.get("ticket"),
        "symbol": t.get("symbol"),
        "type": t.get("type"),
        "volume": t.get("volume"),
        "open_price": t.get("open_price"),
        "current_price": t.get("current_price"),
        "sl": t.get("sl"),
        "tp": t.get("tp"),
        "profit": t.get("profit"),
        "time": t.get("time") or datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    })

print(json.dumps({"success": True, "data": formatted_trades}, indent=2))
