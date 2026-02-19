//+------------------------------------------------------------------+
//|                                    FTSA_AI_FCS_EA_FINAL.0vi2.mq5 |
//|                                          KELVIN SPECTER EAs FIRM |
//|                                           kelvinmburug@gmail.com |
//+------------------------------------------------------------------+
#property copyright "KELVIN SPECTER EAs FIRM"
#property link      "kelvinmburug@gmail.com"
#property version   "1.00"
#include <Trade\Trade.mqh>
CTrade trade;

//----------------- USER CONFIG -----------------
string API_URL       = "http://127.0.0.1:5000/api/fcs/latestSignal";
int    HTTP_TIMEOUT  = 5000;  // milliseconds
//----------------- END USER CONFIG --------------

string lastSignalID     = ""; // Track last executed signal
string FRONTEND_UPDATE_URL = "http://127.0.0.1:5000/api/ftsacalculator/updateTrade"; // <-- Backend endpoint to notify frontend

//----------------- TRADE EXECUTOR -----------------
bool ExecuteTrade(
   string symbol,
   string type,
   string mode,
   double lots,
   double price,
   double sl,
   double tp
)
{
   trade.SetDeviationInPoints(20);

   // -------- MARKET ORDERS --------
   if(mode == "MARKET")
   {
      if(type == "BUY")
         return trade.Buy(lots, symbol, 0, sl, tp);

      if(type == "SELL")
         return trade.Sell(lots, symbol, 0, sl, tp);
   }

   // -------- PENDING ORDERS --------
   if(mode == "PENDING")
   {
      if(price <= 0)
      {
         Print("Invalid pending price");
         return false;
      }

      double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
      double bid = SymbolInfoDouble(symbol, SYMBOL_BID);

      if(type == "BUY")
      {
         if(price < ask)
            return trade.BuyLimit(lots, price, symbol, sl, tp);
         else
            return trade.BuyStop(lots, price, symbol, sl, tp);
      }

      if(type == "SELL")
      {
         if(price > bid)
            return trade.SellLimit(lots, price, symbol, sl, tp);
         else
            return trade.SellStop(lots, price, symbol, sl, tp);
      }
   }

   Print("Invalid trade parameters");
   return false;
}

string LICENSE_BROKER   = "{BROKER}";
string LICENSE_LOGIN    = "{LOGIN}";
string LICENSE_EXPIRY   = "{EXPIRY}";
string LICENSE_KEY      = "{LICENSE_KEY}";

//----------------- LICENSE CHECK ----------------
bool CheckLicense()
{
   string current_broker = AccountInfoString(ACCOUNT_COMPANY);
   long current_login    = AccountInfoInteger(ACCOUNT_LOGIN);
   datetime nowTime      = TimeCurrent();

   if(current_broker != LICENSE_BROKER)
   {
      Alert("INVALID LICENSE: Broker Not Allowed!");
      return false;
   }

   if(IntegerToString(current_login) != LICENSE_LOGIN)
   {
      Alert("INVALID LICENSE: Account Not Allowed!");
      return false;
   }

   datetime expiry = StringToTime(LICENSE_EXPIRY);
   if(nowTime > expiry)
   {
      Alert("LICENSE EXPIRED!");
      return false;
   }

   if(LICENSE_KEY == "")
   {
      Alert("Invalid License Key!");
      return false;
   }

   return true;
}

//----------------- JSON PARSER -----------------
string JsonValue(string json, string key)
{
   string pattern = "\"" + key + "\":";
   int pos = StringFind(json, pattern);
   if(pos < 0) return "";

   int start = pos + StringLen(pattern);
   while(StringGetCharacter(json,start) == ' ' || StringGetCharacter(json,start) == '"')
      start++;

   int end = start;
   while(end < StringLen(json) &&
        StringGetCharacter(json,end) != ',' &&
        StringGetCharacter(json,end) != '}' &&
        StringGetCharacter(json,end) != '"')
      end++;

   return StringSubstr(json,start,end-start);
}
bool PostUpdateToFrontend(string jsonPayload)
{
    char result[];
    string response_headers;
    uchar data[];
    
    // Convert string payload to uchar array
    StringToCharArray(jsonPayload, data);
    
    int res = WebRequest(
        "POST",
        FRONTEND_UPDATE_URL,
        "Content-Type: application/json\r\n",
        HTTP_TIMEOUT,
        data,
        result,
        response_headers
    );
    
    if(res != 200)
    {
        Print("Failed to POST update to frontend, code=", res);
        return false;
    }
    Print("Frontend updated with trade status.");
    return true;
}

//----------------- FETCH SIGNAL -----------------
bool FetchSignal()
{
   char result[];           // receive response
   string response_headers; // receive headers
   uchar data[];            // empty, because GET sends no data

   int res = WebRequest(
      "GET",           // method
      API_URL,         // url
      "",              // cookie (none)
      HTTP_TIMEOUT,    // timeout
      data,            // data to send (empty)
      result,          // response buffer
      response_headers // response headers
   );

   if(res != 200)
   {
      Print("WebRequest failed, code=",res);
      return false;
   }

   string json = CharArrayToString(result);

   string id     = JsonValue(json,"id");
   if(id == "" || id == lastSignalID)
      return false;

   string symbol = JsonValue(json,"symbol");
string type   = JsonValue(json,"type");
string mode   = JsonValue(json,"mode");
double price  = StringToDouble(JsonValue(json,"price"));
double lots   = StringToDouble(JsonValue(json,"lots"));
double sl     = StringToDouble(JsonValue(json,"sl"));
double tp     = StringToDouble(JsonValue(json,"tp"));


   lastSignalID = id;

   if(!ExecuteTrade(symbol, type, mode, lots, price, sl, tp))
{
   Print("Trade failed: ", GetLastError());
   return false;
}

Print("Trade executed: ", type, " ", mode, " ", symbol);

// --- Send trade status to frontend ---
string jsonUpdate = "{";
jsonUpdate += "\"id\":\"" + lastSignalID + "\",";
jsonUpdate += "\"symbol\":\"" + symbol + "\",";
jsonUpdate += "\"type\":\"" + type + "\",";
jsonUpdate += "\"mode\":\"" + mode + "\",";
jsonUpdate += "\"price\":" + DoubleToString(price, _Digits) + ",";
jsonUpdate += "\"lots\":" + DoubleToString(lots, 2) + ",";
jsonUpdate += "\"sl\":" + DoubleToString(sl, _Digits) + ",";
jsonUpdate += "\"tp\":" + DoubleToString(tp, _Digits) + ",";
jsonUpdate += "\"tradeActivated\":\"ACTIVE\"";
jsonUpdate += "}";

PostUpdateToFrontend(jsonUpdate); // send update immediately

return true;

}

//----------------- MT5 HOOKS -----------------
int OnInit()
{
   if(!CheckLicense())
   {
      ExpertRemove();
      return(INIT_FAILED);
   }
   Print("FTSA_AI_FCS_EA_FINAL.0v1 Initialized.");
   return(INIT_SUCCEEDED);
}

void OnTick()
{
    // --- Monitor open trades for TP/SL hits ---
    for(int i = PositionsTotal()-1; i >= 0; i--)
    {
        ulong ticket = PositionGetTicket(i);
        if(PositionSelectByTicket(ticket))
        {
            double posSL = PositionGetDouble(POSITION_SL);
            double posTP = PositionGetDouble(POSITION_TP);
            double posPrice = PositionGetDouble(POSITION_PRICE_OPEN);
            string posSymbol = PositionGetString(POSITION_SYMBOL);
            double posLots = PositionGetDouble(POSITION_VOLUME);
            string posType = PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY ? "BUY" : "SELL";

            // Check if price reached TP or SL
            double currentPrice = SymbolInfoDouble(posSymbol, posType=="BUY"?SYMBOL_BID:SYMBOL_ASK);
            bool closed = false;
            string status = "";

            if(posType=="BUY" && (currentPrice >= posTP || currentPrice <= posSL)) { closed=true; status="CLOSED"; }
            if(posType=="SELL" && (currentPrice <= posTP || currentPrice >= posSL)) { closed=true; status="CLOSED"; }

            if(closed)
            {
                string jsonUpdate = "{";
                jsonUpdate += "\"id\":\"" + lastSignalID + "\",";
                jsonUpdate += "\"symbol\":\"" + posSymbol + "\",";
                jsonUpdate += "\"type\":\"" + posType + "\",";
                jsonUpdate += "\"mode\":\"MARKET\",";
                jsonUpdate += "\"lots\":" + DoubleToString(posLots, 2) + ",";
                jsonUpdate += "\"tradeActivated\":\"" + status + "\"";
                jsonUpdate += "}";

                PostUpdateToFrontend(jsonUpdate); // notify frontend
            }
        }
    }

    // Fetch new signal from backend
    FetchSignal();
}

