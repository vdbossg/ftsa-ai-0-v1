// FTSA_AI_0.v1/server/services/servicesRiskStateCenter.js

const RiskStateCenter = require("../models/modelsRiskStateCenter");
const Rms = require("../models/Rms");
const Trade = require("../models/Trade");

const getRiskState = async (userId) => {

  const todayDate = new Date().toISOString().slice(0,10);

  let state = await RiskStateCenter.findOne({ userId });

  if(!state){
    state = new RiskStateCenter({
      userId,
      date: todayDate
    });
  }

  // DAILY RESET
  if(state.date !== todayDate){
    state.date = todayDate;

    state.today = {
      tradesTaken: 0,
      remainingTrades: state.limits.maxTrades,
      totalLossPercent: 0
    };

    state.todayTrades = {
      pending:0,
      active:0,
      closed:0
    };

    state.permissions = {
      canTrade:true,
      blockedReason:null
    };
  }

  // GET RMS
  const rms = await Rms.findOne({ userId });

  if(rms){
    state.limits.maxTrades = rms.maxTrades;
    state.limits.dailyMaxLoss = rms.dailyMaxLoss;
  }

  // GET TRADES
  const trades = await Trade.find({ userId });

  const pending = trades.filter(t=>t.status==="PENDING").length;
  const active = trades.filter(t=>t.status==="OPEN").length;
  const closed = trades.filter(t=>t.status==="CLOSED").length;

  state.todayTrades = { pending, active, closed };

  const tradesTaken = active + closed;

  state.today.tradesTaken = tradesTaken;
  state.today.remainingTrades = Math.max(0, state.limits.maxTrades - tradesTaken);

  // MAX TRADE RULE
  if(tradesTaken >= state.limits.maxTrades){
    state.permissions.canTrade = false;
    state.permissions.blockedReason = "MAX_TRADES_REACHED";
  }

  await state.save();

  return state;

};

module.exports = { getRiskState };