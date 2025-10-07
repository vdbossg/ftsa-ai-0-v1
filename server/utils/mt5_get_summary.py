import sys
import json
import MetaTrader5 as mt5

if len(sys.argv) < 4:
    print(json.dumps({"success": False, "message": "Usage: mt5_get_summary.py <login> <password> <server>"}))
    sys.exit(1)

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

# Initialize MetaTrader 5
if not mt5.initialize():
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    sys.exit(1)

# Attempt login
if not mt5.login(login=login, password=password, server=server):
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    mt5.shutdown()
    sys.exit(1)

# Fetch account info
account_info = mt5.account_info()
if account_info is None:
    print(json.dumps({"success": False, "message": mt5.last_error()}))
else:
    summary = {
        "success": True,
        "login": account_info.login,
        "currency": account_info.currency,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "freeMargin": account_info.margin_free,
        "marginLevel": account_info.margin_level,
    }
    print(json.dumps(summary))

mt5.shutdown()
