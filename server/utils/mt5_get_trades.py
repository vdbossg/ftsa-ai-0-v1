# server/utils/mt5_get_trades.py
import sys
import json
import MetaTrader5 as mt5
from datetime import datetime

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt5_get_trades.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

# Initialize MetaTrader 5
if not mt5.initialize():
    print(json.dumps({"success": False, "message": f"Initialization failed: {mt5.last_error()}"}))
    sys.exit(1)

# Attempt login
if not mt5.login(login, password, server):
    print(json.dumps({"success": False, "message": f"Login failed: {mt5.last_error()}"}))
    mt5.shutdown()
    sys.exit(1)

# Fetch open positions
positions = mt5.positions_get()
if positions is None:
    print(json.dumps({"success": False, "message": f"No positions found or error: {mt5.last_error()}"}))
    mt5.shutdown()
    sys.exit(0)

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

print(json.dumps({"success": True, "data": trade_list}, indent=2))
mt5.shutdown()
