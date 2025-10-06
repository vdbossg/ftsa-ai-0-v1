# server/utils/mt5_get_trades.py
import sys
import json
import MetaTrader5 as mt5

# Parse login from args
login = int(sys.argv[1])

# Initialize MT5
if not mt5.initialize():
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    sys.exit(1)

# Optionally login if needed
if not mt5.login(login):
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    mt5.shutdown()
    sys.exit(1)

# Fetch open positions
trades = mt5.positions_get()
trade_list = []

if trades is None:
    print(json.dumps({"success": False, "message": mt5.last_error()}))
else:
    for t in trades:
        trade_list.append({
            "ticket": t.ticket,
            "symbol": t.symbol,
            "type": t.type,
            "volume": t.volume,
            "entry_price": t.price_open,
            "sl": t.sl,
            "tp": t.tp,
            "price": t.price_current,
            "profit": t.profit,
            "time": t.time  # you can convert: time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(t.time))
        })
    print(json.dumps(trade_list))

mt5.shutdown()
