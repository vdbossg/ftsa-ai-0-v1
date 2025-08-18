//+------------------------------------------------------------------+
//|                                               EAHelpers.mqh      |
//|                   Helper classes and functions for EA           |
//+------------------------------------------------------------------+

#ifndef __EAHELPERS_MQH__
#define __EAHELPERS_MQH__

class CTradeHelper
  {
public:
   CTradeHelper() {}
   ~CTradeHelper() {}

   void PrintHello()
     {
      Print("EAHelpers loaded and ready.");
     }

   // Add your trade helper functions here
  };

#endif
