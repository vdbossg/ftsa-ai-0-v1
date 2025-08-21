#property strict

// Inputs (placeholders for injection)
input string LicenseKey     = "%%LICENSE_KEY%%";
input string AllowedAccount = "%%ACCOUNT_NUMBER%%";
input string ExpiryDate     = "%%EXPIRY_DATE%%"; // format: YYYY.MM.DD HH:MI:SS

// JSON file path (shared folder)
string TradeFile = "trade_commands.json";

// TradeManager class
class TradeManager
{
public:
   string symbol;
   double entry;
   double sl;
   double tp;
   double lot;
   string trade_id;
   bool executed;

   TradeManager() { executed = false; }

   // Read JSON trade command
   bool ReadTradeCommand()
   {
      int fileHandle = FileOpen(TradeFile, FILE_READ|FILE_TXT);
      if(fileHandle < 0)
      {
         Print("TradeManager: No trade command found.");
         return(false);
      }

      string json = FileReadString(fileHandle);
      FileClose(fileHandle);

      if(StringFind(json, "symbol") >= 0)
      {
         symbol   = GetJsonValue(json, "symbol");
         entry    = StrToDouble(GetJsonValue(json, "entry"));
         sl       = StrToDouble(GetJsonValue(json, "sl"));
         tp       = StrToDouble(GetJsonValue(json, "tp"));
         lot      = StrToDouble(GetJsonValue(json, "lot"));
         trade_id = GetJsonValue(json, "trade_id");
         executed = false;
         return(true);
      }
      return(false);
   }

   // Execute trade placeholder
   void ExecuteTrade()
   {
      if(!executed)
      {
         // TODO: Replace with actual OrderSend() logic
         PrintFormat("Executing trade %s: %s Entry=%.5f SL=%.5f TP=%.5f Lot=%.2f", 
                     trade_id, symbol, entry, sl, tp, lot);
         executed = true;
      }
   }

private:
   // Simple JSON value extractor
   string GetJsonValue(string json, string key)
   {
      int pos = StringFind(json, key);
      if(pos < 0) return("");
      int start = StringFind(json, ":", pos) + 1;
      int end   = StringFind(json, ",", start);
      if(end < 0) end = StringFind(json, "}", start);
      string val = StringTrim(StringSubstr(json, start, end-start));
      if(StringGetCharacter(val,0) == '"') val = StringSubstr(val,1,StringLen(val)-2);
      return(val);
   }
};

// Global TradeManager instance
TradeManager TM;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Validate account
   if(AccountNumber() != StrToInteger(AllowedAccount))
   {
      Print("FTSA AI: License Invalid - Wrong Account");
      return(INIT_FAILED);
   }

   // Validate expiry
   datetime expiry = StringToTime(ExpiryDate);
   if(TimeCurrent() > expiry)
   {
      Print("FTSA AI: License Expired - Access Denied");
      return(INIT_FAILED);
   }

   Print("FTSA AI: License OK for account ", AllowedAccount, " until ", ExpiryDate);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   Print("FTSA AI is running...");

   if(TM.ReadTradeCommand())
   {
      TM.ExecuteTrade();
   }
}
