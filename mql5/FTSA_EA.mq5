//+------------------------------------------------------------------+
//|                                                FTSA_EA.mq5       |
//|                   Main Expert Advisor entry point                |
//+------------------------------------------------------------------+
#include <EAHelpers.mqh>
#include <NewsManager.mqh>

input int MagicNumber = 123456;

int OnInit()
  {
   // Initialization code here
   return(INIT_SUCCEEDED);
  }

void OnTick()
  {
   // Main trading logic here
  }

void OnDeinit(const int reason)
  {
   // Cleanup here
  }
