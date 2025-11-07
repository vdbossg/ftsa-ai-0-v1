# server/utils/prop_mt5_get_summary.py
import sys
import json
import MetaTrader5 as mt5

def respond(success, message_or_data):
    if success:
        print(json.dumps({"success": True, "data": message_or_data}))
    else:
        print(json.dumps({"success": False, "message": message_or_data}))

if len(sys.argv) < 4:
    respond(False, "Usage: prop_mt5_get_summary.py <login> <password> <server>")
    sys.exit(0)

login_arg = sys.argv[1]
password = sys.argv[2]
server = sys.argv[3]

try:
    login = int(login_arg)
except ValueError:
    respond(False, f"Invalid login: {login_arg}")
    sys.exit(0)

# Initialize MT5
if not mt5.initialize():
    respond(False, mt5.last_error())
    sys.exit(0)

# Login to PropFirm account
if not mt5.login(login=login, password=password, server=server):
    respond(False, mt5.last_error())
    mt5.shutdown()
    sys.exit(0)

# Fetch account info
account_info = mt5.account_info()
if account_info is None:
    respond(False, mt5.last_error())
else:
    summary = {
        "login": account_info.login,
        "currency": account_info.currency,
        "balance": account_info.balance,
        "equity": account_info.equity,
        "margin": account_info.margin,
        "freeMargin": account_info.margin_free,
        "marginLevel": account_info.margin_level,
    }
    respond(True, summary)

mt5.shutdown()
