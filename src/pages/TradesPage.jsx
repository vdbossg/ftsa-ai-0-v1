// src/pages/TradesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/TradesPage.css";
import LoadingSpinner from "../components/LoadingSpinner";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function TradesPage() {
  const { isAuthenticated } = useAuth();
  const [propAccount, setPropAccount] = useState(null);
  const [mtAccount, setMTAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-refresh every second
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [propData, mtData] = await Promise.all([
          APIControl.fetchConnectedPropAccount(),
          APIControl.fetchConnectedMTAccount(),
        ]);
        setPropAccount(propData?.account || null);
        setMTAccount(mtData?.account || null);
      } catch (err) {
        console.error("Failed to fetch account data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const formatCurrency = (num) =>
    typeof num === "number" ? `$${num.toFixed(2)}` : "-";

  const getPLColor = (pl) => {
    if (pl > 0) return neonColors.neonGreen;
    if (pl < 0) return neonColors.neonRed;
    return neonColors.neonOrange;
  };

  const calculateStats = (account, isProp = false) => {
    if (!account) return null;
    const trades = account.trades?.data || [];
    const balance = account.summary?.data?.balance || 0;
    const initialBalance = isProp ? account.propSettings?.initialBalance || balance : balance;
    const profitLoss = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const gainDrawdown = initialBalance > 0 ? ((balance - initialBalance) / initialBalance) * 100 : 0;

    return isProp
      ? {
          initialBalance,
          dailyLossLimit: account.propSettings?.dailyLossLimit || 0,
          overallLossLimit: account.propSettings?.overallLossLimit || 0,
          profitTarget: account.propSettings?.profitTarget || 0,
          profitLoss,
          gainDrawdown,
        }
      : { profitLoss, gainDrawdown };
  };

  const propStats = calculateStats(propAccount, true);
  const mtStats = calculateStats(mtAccount, false);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: neonColors.neonRed,
          padding: "4rem",
          textAlign: "center",
        }}
      >
        Please login to view trades.
      </div>
    );
  }

  const renderTable = (account) => (
    <div
      style={{
        overflowX: "auto",
        border: `2px solid ${neonColors.neonBlue}`,
        borderRadius: "12px",
        boxShadow: `0 0 15px ${neonColors.neonBlue}`,
        backgroundColor: "#111",
        marginBottom: "1rem",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          color: neonColors.neonBlue,
        }}
      >
        <thead style={{ borderBottom: `2px solid ${neonColors.neonBlue}` }}> {/* <--- adds dividing line */}
  <tr>
    <th>Broker</th>
    <th>Login ID</th>
    <th>Balance</th>
    <th>Equity</th>
    <th>Margin</th>
    <th>Free Margin</th>
    <th>Symbol</th>
    <th>Ticket</th>
    <th>Time</th>
    <th>Type</th>
    <th>Volume</th>
    <th>Entry/Open Price</th>
    <th>Current Price</th>
    <th>SL</th>
    <th>TP</th>
    <th>Profit</th>
  </tr>
</thead>

        <tbody>
          {account?.trades?.success && account.trades.data.length > 0 ? (
            account.trades.data.map((trade) => (
              <tr
                key={trade.ticket}
                style={{
                  textAlign: "center",
                  borderBottom: `1px solid ${neonColors.neonBlue}`,
                }}
              >
                <td>{account.broker}</td>
                <td>{account.login}</td>
                <td>{formatCurrency(account.summary.data.balance)}</td>
                <td>{formatCurrency(account.summary.data.equity)}</td>
                <td>{formatCurrency(account.summary.data.margin)}</td>
                <td>{formatCurrency(account.summary.data.freeMargin)}</td>
                <td>{trade.symbol}</td>
                <td>{trade.ticket}</td>
                <td>{trade.time}</td>
                <td>{trade.type}</td>
                <td>{trade.volume}</td>
                <td>{trade.open_price}</td>
                <td>{trade.current_price}</td>
                <td>{trade.sl}</td>
                <td>{trade.tp}</td>
                <td style={{ color: getPLColor(trade.profit), fontWeight: "bold" }}>
                  {formatCurrency(trade.profit)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={16} style={{ textAlign: "center", color: neonColors.neonOrange, padding: "1rem" }}>
                No trades found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCards = (stats, isProp = false) => {
    if (!stats) return null;
    const cardsData = isProp
      ? [
          { title: "Initial Balance", value: formatCurrency(stats.initialBalance) },
          { title: "Daily Loss Limit ± $", value: formatCurrency(stats.dailyLossLimit) },
          { title: "Overall Loss Limit ± $", value: formatCurrency(stats.overallLossLimit) },
          { title: "Profit Target ± $", value: formatCurrency(stats.profitTarget) },
          { title: "Profit / Loss ± $", value: formatCurrency(stats.profitLoss), color: getPLColor(stats.profitLoss) },
          { title: "Gain / Drawdown %", value: `${stats.gainDrawdown.toFixed(2)}%`, color: stats.gainDrawdown >= 0 ? neonColors.neonGreen : neonColors.neonRed },
        ]
      : [
          { title: "Profit / Loss ± $", value: formatCurrency(stats.profitLoss), color: getPLColor(stats.profitLoss) },
          { title: "Gain / Drawdown %", value: `${stats.gainDrawdown.toFixed(2)}%`, color: stats.gainDrawdown >= 0 ? neonColors.neonGreen : neonColors.neonRed },
        ];

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        {cardsData.map((card) => (
          <div
            key={card.title}
            style={{
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: 12,
              padding: "1rem",
              backgroundColor: "#111",
              textAlign: "center",
              color: card.color || neonColors.neonBlue,
            }}
          >
            <h4>{card.title}</h4>
            <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{card.value}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderGraph = (account, isProp = false) => {
  if (!account || !account.trades?.data || account.trades.data.length === 0) return null;

  // Prepare chart data for last N trades (e.g., 20) for clarity
  const lastN = 20;
  const tradesData = account.trades.data.slice(-lastN);
  const chartData = tradesData.map((trade, index) => ({
    name: `#${trade.ticket}`, // can use ticket for label
    profit: trade.profit || 0,
  }));

  return (
    <div
      style={{
        border: `2px solid ${neonColors.neonBlue}`,
        borderRadius: 12,
        padding: "1rem",
        backgroundColor: "#111",
        textAlign: "center",
        color: neonColors.neonBlue,
        marginBottom: "2rem",
        height: 220,
      }}
    >
      <h4>{isProp ? "📈 Prop Trades Graph" : "📈 MTAccounts Trades Graph"}</h4>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={chartData}>
          <CartesianGrid stroke="#00FFFF33" strokeDasharray="5 5" />
          <XAxis dataKey="name" stroke={neonColors.neonBlue} />
          <YAxis stroke={neonColors.neonBlue} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Line
  type="monotone"
  dataKey="profit"
  stroke={chartData[chartData.length-1]?.profit >= 0 ? neonColors.neonGreen : neonColors.neonRed}
  strokeWidth={2}
  dot={{ r: 3 }}
  isAnimationActive={false}
/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "1rem",
      }}
    >
      <header
        style={{
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: `2px solid ${neonColors.neonBlue}`,
          paddingBottom: "0.5rem",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        FTSA AI-TRADES
      </header>

      {loading && (
        <div style={{ textAlign: "center", margin: "1rem" }}>
          <LoadingSpinner size={48} color={neonColors.neonBlue} />
        </div>
      )}

      <div
  style={{
    display: "flex",
    flexDirection: "column", // stack vertically
    gap: "2rem",
    width: "100%",
  }}
>
  {/* Prop Trades Section */}
  <div style={{ flex: 1, width: "100%" }}>
    <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Prop Trades</h3>
    {renderTable(propAccount)}
    {renderCards(propStats, true)}
    {renderGraph(propAccount, true)}
  </div>

  {/* MTAccounts Trades Section */}
  <div style={{ flex: 1, width: "100%" }}>
    <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>MTAccounts Trades</h3>
    {renderTable(mtAccount)}
    {renderCards(mtStats, false)}
    {renderGraph(mtAccount, false)}
  </div>
</div>


      <footer
        style={{
          textAlign: "center",
          borderTop: `1px solid ${neonColors.neonBlue}`,
          paddingTop: "1rem",
          color: neonColors.neonBlue,
          fontSize: "0.9rem",
          marginTop: "2rem",
        }}
      >
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) © 2025
      </footer>
    </div>
  );
}
