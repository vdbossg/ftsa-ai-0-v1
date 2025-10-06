# server/utils/mt5_get_summary.py
import sys
import json
import MetaTrader5 as mt5

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

# Fetch account info
account_info = mt5.account_info()
if account_info is None:
    print(json.dumps({"success": False, "message": mt5.last_error()}))
else:
    summary = {
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "freeMargin": account_info.margin_free,
        "marginLevel": account_info.margin_level,
        "currency": account_info.currency
    }
    print(json.dumps(summary))

mt5.shutdown()
