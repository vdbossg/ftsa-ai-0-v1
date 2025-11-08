const { PropAccount, PropSettings } = require("../models/PropTradesAccount");

async function getPropTableTrades() {
  // fetch accounts & settings
  const accounts = await PropAccount.find({});
  const settings = await PropSettings.find({});

  const result = accounts.map((acc) => {
    const propSetting = settings.find((s) => s.accountLogin === acc.login) || {};

    // initial balance = first summary balance (or fixed)
    const initialBalance = propSetting.initialBalance || acc.summary?.data?.balance || 0;


    // profit/loss calculation
    const profitLoss = acc.trades?.data?.reduce((sum, t) => sum + (t.profit || 0), 0) || 0;

    // gain/drawdown %
    const gainDrawdownPercent = initialBalance > 0 ? ((acc.summary?.data?.balance - initialBalance) / initialBalance) * 100 : 0;

    // chartData
    const chartData = acc.trades?.data?.map((t) => ({ name: t.symbol, profit: t.profit })) || [];

    return {
      broker: acc.broker,
      login: acc.login,
      summary: acc.summary?.data || {},
      trades: acc.trades?.data || [],
      propSettings: {
        profitTarget: propSetting.profitTarget || 0,
        dailyDrawdown: propSetting.dailyDrawdown || 0,
        maxDrawdown: propSetting.maxDrawdown || 0,
        phase: propSetting.phase || 0,
      },
      stats: {
        initialBalance,
        profitLossDollar: profitLoss,
        gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
        profitTargetDollar: ((propSetting.profitTarget || 0) / 100) * initialBalance,
        dailyLossLimitDollar: ((propSetting.dailyDrawdown || 0) / 100) * initialBalance,
        overallLossLimitDollar: ((propSetting.maxDrawdown || 0) / 100) * initialBalance,
        status: propSetting.status || "inactive",
      },
      chartData,
    };
  });

  return { success: true, data: result };
}

module.exports = { getPropTableTrades };
