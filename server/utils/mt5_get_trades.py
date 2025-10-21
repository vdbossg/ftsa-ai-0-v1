# server/utils/mt5_get_trades.py
import sys
import json
import MetaTrader5 as mt5
from datetime import datetime

def respond(success, message_or_data):
    if success:
        print(json.dumps({"success": True, "data": message_or_data}, indent=2))
    else:
        print(json.dumps({"success": False, "message": message_or_data}))
    sys.exit(0)  # graceful exit

if len(sys.argv) < 4:
    respond(False, "Usage: mt5_get_trades.py <login> <password> <server>")

login_arg = sys.argv[1]
password = sys.argv[2]
server = sys.argv[3]

try:
    login = int(login_arg)
except ValueError:
    respond(False, f"Invalid login: {login_arg}")

# Initialize MetaTrader 5
if not mt5.initialize():
    respond(False, f"Initialization failed: {mt5.last_error()}")

# Attempt login
if not mt5.login(login, password, server):
    respond(False, f"Login failed: {mt5.last_error()}")
    mt5.shutdown()

# Fetch open positions
positions = mt5.positions_get()
if positions is None or len(positions) == 0:
    respond(False, f"No positions found or error: {mt5.last_error()}")

# Format positions into JSON-friendly output
trade_list = []
for p in positions:
    trade_list.append({
        "ticket": p.ticket,
        "symbol": p.symbol,
        "type": "BUY" if p.type == 0 else "SELL",
        "volume": p.volume,
        "open_price": p.price_open,
        "current_price": p.price_current,
        "sl": p.sl,
        "tp": p.tp,
        "profit": p.profit,
        "time": datetime.fromtimestamp(p.time).strftime("%Y-%m-%d %H:%M:%S")
    })

respond(True, trade_list)
mt5.shutdown()
