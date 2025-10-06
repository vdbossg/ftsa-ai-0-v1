# server/utils/mt5_connector.py
import sys
import json
import MetaTrader5 as mt5

login = int(sys.argv[1])
password = sys.argv[2]
server = sys.argv[3]

# Initialize MT5
if not mt5.initialize():
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    sys.exit(1)

# Login to account
if not mt5.login(login, password, server):
    print(json.dumps({"success": False, "message": mt5.last_error()}))
    mt5.shutdown()
    sys.exit(1)

# Get account info
account_info = mt5.account_info()
if account_info is None:
    print(json.dumps({"success": False, "message": mt5.last_error()}))
else:
    output = {
        "success": True,
        "currency": account_info.currency,
        "login": account_info.login,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "freeMargin": account_info.margin_free,
        "marginLevel": account_info.margin_level
    }
    print(json.dumps(output))

mt5.shutdown()
