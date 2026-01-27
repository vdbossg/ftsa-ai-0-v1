//+------------------------------------------------------------------+
//|                                     FTSA_AI_FCS_EA_FINAL.0v1.mq5 |
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

string LICENSE_BROKER   = "ICM";
string LICENSE_LOGIN    = "1234567";
string LICENSE_EXPIRY   = "2026.02.26";
string LICENSE_KEY      = "LIC_TEST_STEP_05";

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
   FetchSignal();
}
