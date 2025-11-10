async function detectAndStoreClosedTrades() {
  const currentOpenTrades = await fetchOpenTrades();

  // Fetch all already stored closed trade tickets
  const storedTickets = await PropJournal.find({ status: "closed" }).distinct("ticket");

  // Flatten current open trade tickets
  const currentTickets = currentOpenTrades.flatMap(acc => acc.trades.map(t => t.ticket));

  // Closed trades = previously stored open trades that are not in current open trades
  const closedTrades = [];
  for (const account of currentOpenTrades) {
    for (const trade of account.trades) {
      if (!currentTickets.includes(trade.ticket) && !storedTickets.includes(trade.ticket)) {
        closedTrades.push({ ...trade, account });
      }
    }
  }

  const savedTrades = [];

  for (let trade of closedTrades) {
    const { account } = trade;
    const aiInsights = generateAIInsights(trade);

    const initialBalance = account.summary?.data?.balance || 0;
    const gainDrawdownPercent = initialBalance > 0 ? ((trade.profit || 0) / initialBalance) * 100 : 0;

    const journalEntry = new PropJournal({
      ticket: trade.ticket,
      date: new Date(trade.time),
      broker: account.broker || "Unknown",
      login: account.login || "Unknown",
      accountType: account.accountType || "demo",
      platform: account.platform || "PropFirm",
      pair: trade.symbol,
      profit: trade.profit,
      side: trade.type,
      lotSize: trade.volume,
      entry: trade.open_price,
      tp: trade.tp,
      sl: trade.sl,
      exit: trade.current_price,
      rr: trade.rr || 0,
      pips: trade.pips || 0,
      riskPercent: trade.riskPercent || 0,
      session: trade.session || "-",
      balanceHistory: [initialBalance, (initialBalance + trade.profit)],
      profitTarget: account.propSettings?.profitTarget || 0,
      initialProfit: trade.profit,
      gainDrawdownPercent: parseFloat(gainDrawdownPercent.toFixed(2)),
      aiStrategy: aiInsights.aiStrategy,
      executionNotes: aiInsights.executionNotes,
      conclusions: aiInsights.conclusions,
      status: "closed",
    });

    try {
      await journalEntry.save();
      console.log(`Stored closed trade: ${trade.ticket}`);
      savedTrades.push(journalEntry.toObject());
    } catch (err) {
      if (err.code === 11000) {
        console.log(`Trade ${trade.ticket} already exists.`);
        const existing = await PropJournal.findOne({ ticket: trade.ticket }).lean();
        if (existing) savedTrades.push(existing);
      } else {
        console.error(err);
      }
    }
  }

  return savedTrades; // RETURN all newly stored closed trades
}
