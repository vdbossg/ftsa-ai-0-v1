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
  const [mtTableData, setMTTableData] = useState(null); // for /api/mttabletrades
  const [loading, setLoading] = useState(true);
  const [propTableData, setPropTableData] = useState(null); // for /api/proptabletrades
  const [mtConnectedAccount, setMTConnectedAccount] = useState(null);
  const [propConnectedAccount, setPropConnectedAccount] = useState(null);



  // Auto-refresh every second
useEffect(() => {
  if (!isAuthenticated || !propConnectedAccount) return;

  const fetchPropTrades = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/proptabletrades");
    const data = await res.json();
    setPropTableData(data?.data?.[0] || null); // take first account from JSON
  } catch (err) {
    console.error("Failed to fetch prop table trades:", err);
  } finally {
    setLoading(false);
  }
};


  fetchPropTrades();
  const interval = setInterval(fetchPropTrades, 1000);
  return () => clearInterval(interval);
}, [isAuthenticated, propConnectedAccount]);


useEffect(() => {
  if (!isAuthenticated || !mtConnectedAccount) return;

  const fetchMTTrades = async () => {
  try {
    const res = await fetch("http://localhost:5000/api/mttabletrades");
    const data = await res.json();
    setMTTableData(data?.[0] || null); // take first account from JSON array
  } catch (err) {
    console.error("Failed to fetch MT table trades:", err);
  } finally {
    setLoading(false);
  }
};


  fetchMTTrades();
  const interval = setInterval(fetchMTTrades, 1000);
  return () => clearInterval(interval);
}, [isAuthenticated, mtConnectedAccount]);

// Fetch connected accounts for MT and Prop from updated JSON endpoints
useEffect(() => {
  if (!isAuthenticated) return;

  const fetchConnectedAccounts = async () => {
    try {
      // MT connected account
      const mtRes = await fetch("http://localhost:5000/api/mtaccounts");
      const mtData = await mtRes.json();
      if (mtData.success && Array.isArray(mtData.accounts)) {
        const connectedMT = mtData.accounts.find(acc => acc.account?.isConnected);
if (connectedMT) {
  // Merge account + summary + trades into one object for convenience
  setMTConnectedAccount({
    ...connectedMT.account,
    summary: connectedMT.summary,
    trades: connectedMT.trades?.data || [],
  });
} else {
  setMTConnectedAccount(null);
}

      }

      // Prop connected account
      const propRes = await fetch("http://localhost:5000/api/propaccounts");
      const propData = await propRes.json();
      if (propData.success && Array.isArray(propData.accounts)) {
        const connectedProp = propData.accounts.find(acc => acc.account?.isConnected);
if (connectedProp) {
  setPropConnectedAccount({
    ...connectedProp.account,
    summary: connectedProp.summary,
    trades: connectedProp.account.trades?.data || [],
    propSettings: connectedProp.account.propSettings || {},
    chartData: connectedProp.account.trades?.data.map(t => ({
      name: t.symbol,
      profit: t.profit || 0
    })) || []
  });
} else {
  setPropConnectedAccount(null);
}

      }

    } catch (err) {
      console.error("Failed to fetch connected accounts:", err);
    }
  };

  fetchConnectedAccounts();
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

  // Extract trades array
  const trades = Array.isArray(account.trades) ? account.trades : [];

  // For Prop, get summary and propSettings from new JSON
  if (isProp) {
    const balance = account.summary?.data?.balance || 0;
    const initialBalance = account.propSettings?.initialBalance || balance;
    const profitLoss = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
    const gainDrawdown = initialBalance > 0 ? ((balance - initialBalance) / initialBalance) * 100 : 0;

    return {
      initialBalance,
      dailyLossLimit: account.propSettings?.dailyLossLimit || 0,
      overallLossLimit: account.propSettings?.overallLossLimit || 0,
      profitTarget: account.propSettings?.profitTarget || 0,
      profitLoss,
      gainDrawdown,
    };
  }

  // MT trades (unchanged)
  const balance = account.summary?.data?.balance || 0;
  const profitLoss = trades.reduce((sum, t) => sum + (t.profit || 0), 0);
  const gainDrawdown = balance > 0 ? 0 : 0; // fallback for MT if needed
  return { profitLoss, gainDrawdown };
};

  const propStats = calculateStats(propTableData, true);

  const mtStats = calculateStats(mtTableData, false);


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

  const renderTable = (account) => {
  if (!account) return null;
  const part = account.tablePart || "all";

  const renderHeaders = () => {
    if (part === "basic") return <tr><th>Broker</th><th>Login ID</th></tr>;
    if (part === "summary")
      return (
        <tr>
          <th>Balance</th>
          <th>Equity</th>
          <th>Margin</th>
          <th>Free Margin</th>
        </tr>
      );
    return (
      <tr>
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
    );
  };

  const renderRows = () => {
    if (!Array.isArray(account.trades) || account.trades.length === 0)
      return (
        <tr>
          <td colSpan="10" style={{ textAlign: "center", padding: "1rem" }}>
            No trades found.
          </td>
        </tr>
      );

    return account.trades.map((trade) => {
      if (part === "basic")
        return (
          <tr key={trade.ticket}>
            <td>{account.broker}</td>
            <td>{account.login}</td>
          </tr>
        );
      if (part === "summary")
        return (
          <tr key={trade.ticket}>
            <td>{formatCurrency(account.summary?.data?.balance)}</td>
            <td>{formatCurrency(account.summary?.data?.equity)}</td>
            <td>{formatCurrency(account.summary?.data?.margin)}</td>
            <td>{formatCurrency(account.summary?.data?.freeMargin)}</td>
          </tr>
        );
      return (
        <tr key={trade.ticket}>
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
      );
    });
  };

  return (
    <div
      style={{
        overflowX: "auto",
        border: `2px solid ${neonColors.neonBlue}`,
        borderRadius: "12px",
        boxShadow: `0 0 10px ${neonColors.neonBlue}`,
        backgroundColor: "#111",
      }}
    >
      <table
  style={{
    width: "100%",
    borderCollapse: "collapse",
    color: neonColors.neonBlue,
    textAlign: "center",
  }}
>

      
        <thead style={{ borderBottom: `2px solid ${neonColors.neonBlue}` }}>
          {renderHeaders()}
        </thead>
        <tbody>{renderRows()}</tbody>
      </table>
    </div>
  );
};

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
  if (!account) return null;

  const chartData = isProp
    ? account.chartData || []
    : (account.trades || []).slice(-20).map(trade => ({
        name: `#${trade.ticket}`,
        profit: trade.profit || 0,
      }));

  if (chartData.length === 0) return null;

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
            stroke={chartData[chartData.length - 1]?.profit >= 0 ? neonColors.neonGreen : neonColors.neonRed}
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
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    width: "100%",
  }}

>
  {/* Prop Trades Section */}
<div
  style={{
    flex: 1,
    width: "90%",
    maxWidth: "1200px",
    border: `2px solid ${neonColors.neonBlue}`,
    borderRadius: 12,
    backgroundColor: "#111",
    padding: "1rem",
    overflowY: "auto",
    maxHeight: "650px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    boxShadow: `0 0 15px ${neonColors.neonBlue}`,
  }}
>

  <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Prop Trades</h3>

  {propConnectedAccount ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* 3 mini-tables stacked */}
      <div>{renderTable({ ...propTableData, tablePart: "basic" })}</div>
      <div>{renderTable({ ...propTableData, tablePart: "summary" })}</div>
      <div>{renderTable({ ...propTableData, tablePart: "trades" })}</div>

      {/* Cards and Graph below, same scroll */}
      <div>{renderCards(propStats, true)}</div>
      <div>{renderGraph(propTableData, true)}</div>
    </div>
  ) : (
    <p style={{ textAlign: "center", color: neonColors.neonOrange }}>
      No connected Prop Firm account.
    </p>
  )}
</div>
{/* MTAccounts Trades Section */}
<div
  style={{
    flex: 1,
    width: "90%",
    maxWidth: "1200px",
    border: `2px solid ${neonColors.neonBlue}`,
    borderRadius: 12,
    backgroundColor: "#111",
    padding: "1rem",
    overflowY: "auto",
    maxHeight: "650px",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    boxShadow: `0 0 15px ${neonColors.neonBlue}`,
  }}
>

  <h3 style={{ textAlign: "center", marginBottom: "0.5rem" }}>MTAccounts Trades</h3>

  {mtConnectedAccount ? (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
      }}
    >
      {/* 3 mini-tables stacked */}
      <div>{renderTable({ ...mtTableData, tablePart: "basic" })}</div>
      <div>{renderTable({ ...mtTableData, tablePart: "summary" })}</div>
      <div>{renderTable({ ...mtTableData, tablePart: "trades" })}</div>

      {/* Cards and Graph below */}
      <div>{renderCards(mtStats, false)}</div>
      <div>{renderGraph(mtTableData, false)}</div>
    </div>
  ) : (
    <p style={{ textAlign: "center", color: neonColors.neonOrange }}>
      No connected MT account.
    </p>
  )}
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
