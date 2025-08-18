export async function autoTrade() {
  try {
    const strengthRes = await fetch('/api/bias');
    const strengthData = await strengthRes.json();
    const strongest = strengthData.sort((a, b) => b.percent - a.percent)[0];

    const chochRes = await fetch('/api/choch');
    const chochData = await chochRes.json();

    const htfDirection = chochData.htfDirection;
    const ltfChoch = chochData.ltfChoch;

    if (htfDirection && ltfChoch && strongest) {
      const tradeType = htfDirection === 'bearish' && ltfChoch === 'bearish' ? 'SELL' :
                        htfDirection === 'bullish' && ltfChoch === 'bullish' ? 'BUY' : null;

      if (tradeType) {
        await fetch('/api/ea/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: strongest.symbol, tradeType })
        });
        console.log(`EA commanded to ${tradeType} ${strongest.symbol}`);
      }
    }
  } catch (err) {
    console.error('AutoTrade error:', err);
  }
}
