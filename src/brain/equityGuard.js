export function checkEquity(balanceStart, currentBalance, currentEquity, targetPct) {
  const targetMoney = balanceStart * (targetPct / 100);
  if (currentEquity >= balanceStart + targetMoney) {
    return true; // trigger closeAll
  }
  return false;
}
