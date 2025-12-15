//+------------------------------------------------------------------+
//|                   EA TEMPLATE WITH PLACEHOLDERS                 |
//+------------------------------------------------------------------+

string LICENSE_BROKER   = "{BROKER}";
string LICENSE_LOGIN    = "{LOGIN}";
string LICENSE_EXPIRY   = "{EXPIRY}";
string LICENSE_KEY      = "{LICENSE_KEY}";

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

int OnInit()
{
   if(!CheckLicense())
   {
      ExpertRemove();
      return(INIT_FAILED);
   }
   return(INIT_SUCCEEDED);
}

void OnTick()
{
   // EA LOGIC WILL BE ADDED LATER
}
