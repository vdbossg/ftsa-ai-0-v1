//FTSA_AI_0.v1\src\pages\BrainPage.jsx
import React, { useEffect, useState } from "react";
import { useBrainData } from "../contexts/BrainDataContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl"; // for fetching brain data, market strength, CHoCH
import { useRef } from "react"; // at top of file

export default function BrainPage() {
  const { autoTradeStatus, toggleAutoTrade } = useBrainData();

  const [tradeHistory, setTradeHistory] = useState([]);
  const [topPair, setTopPair] = useState(null);
  const [marketStrength, setMarketStrength] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
  maxTrades: 1,
  risk: 1,
  dailyMaxLoss: 1,
  tpTargets: "tp1",
});

const [saveMessage, setSaveMessage] = useState(""); // for showing save confirmation
const [pendingTrade, setPendingTrade] = useState(null); // for a single valid trade from TV + Top3
const [eaUpdatedTrades, setEaUpdatedTrades] = useState([]);
const [accountTotals, setAccountTotals] = useState({ balance: 1000 }); 
// default 1000 or whatever you want as initial balance
// Fetch live account balances from MT and Prop accounts
useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const [mtRes, propRes] = await Promise.all([
        fetch("https://ftsa-ai-backend.onrender.com/api/mtaccounts"),
        fetch("https://ftsa-ai-backend.onrender.com/api/propaccounts")
      ]);
      const mtData = await mtRes.json();
      const propData = await propRes.json();

      let balance = 0;

      if (mtData.success && Array.isArray(mtData.accounts)) {
        mtData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            balance += summary.balance || 0;
          }
        });
      }

      if (propData.success && Array.isArray(propData.accounts)) {
        propData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            balance += summary.balance || 0;
          }
        });
      }

      setAccountTotals(prev => ({ ...prev, balance }));
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  fetchAccounts();
  const interval = setInterval(fetchAccounts, 1000); // live update every second
  return () => clearInterval(interval);
}, []);

const scrollableTableContainer = {
  marginBottom: "2rem",
  border: "1px solid #00FFFF",
  padding: "1rem",
  borderRadius: "12px",
  boxShadow: "0 0 10px #00FFFF",
  maxHeight: "300px",      // sets max height
  overflowY: "auto",       // enables vertical scroll
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  borderBottom: "2px solid #00FFFF",
  padding: "0.5rem",
  textAlign: "left",
};

const tdStyle = {
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem",
};
const thShadowStyle = {
  borderBottom: "3px double #00FFFF",
  boxShadow: "0 2px 2px rgba(0,255,255,0.5)",
  padding: "0.5rem",
};

const tdVerticalLineStyle = {
  borderBottom: "1px solid #252e2eff",
  borderRight: "1px solid #00FFFF",
  padding: "0.5rem",
};

const lastTdStyle = {
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem",
};

const tradeHistoryRef = useRef(tradeHistory);
const marketStrengthRef = useRef(marketStrength);



const loadBrainData = async (showLoader = false) => {
  if (showLoader) setLoading(true); // only show loader on first load
  setError(null);
  try {
    const strengthResp = await APIControl.fetchMarketStrength();
    if (!strengthResp.success) throw new Error("Failed to fetch market strength");

    const strengthJson = strengthResp.data;

    setMarketStrength(
      strengthJson.map((p) => ({
        pair: p.symbol,
        strength: p.strength,
        trend: p.bias ? p.bias : "Unknown",
        color: p.signal || "neutral",
      }))
    );
  } catch (err) {
    setError("Failed to load brain data");
    console.error(err);
  } finally {
    if (showLoader) setLoading(false); // only hide loader if we showed it
  }
};
const fetchEaUpdates = async () => {
  try {
    const resp = await fetch("https://ftsa-ai-backend.onrender.com/api/ftsacalculator"); // GET latest trade with tradeActivated
    if (!resp.ok) throw new Error("Failed to fetch EA trade updates");

    const data = await resp.json();

    if (data?.trendJson) {
      setEaUpdatedTrades([data.trendJson]);
    }
  } catch (err) {
    console.error("Error fetching EA updates:", err);
  }
};

const updatePendingTrade = () => {
  if (!filteredSignals.length || !marketStrength.length) return;

  // Get top 3 strongest pairs
  const top3Pairs = [...marketStrength]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map(p => p.pair);

  // Find first valid signal that is in top 3
  const validTrade = filteredSignals.find(signal =>
    top3Pairs.includes(signal.symbol)
  );

  if (!validTrade) {
    // No valid trade, remove pending
    setPendingTrade(null);
    return;
  }

  // If the current pending trade is already the same, do nothing
  if (pendingTrade?.symbol === validTrade.symbol) return;

  // Otherwise, set new pending trade
  setPendingTrade({
    symbol: validTrade.symbol,
    type: validTrade.type,
    mode: validTrade.mode || "-",
    trend: validTrade.type === "BUY" ? "bullish" : "bearish",
    entry: validTrade.entry ?? "-",
    sl: validTrade.sl ?? "-",
    tp: validTrade.tp3 ?? "-",
    time: new Date().toLocaleTimeString(),
    tradeActivated: "PENDING",
  });
};

useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
useEffect(() => { marketStrengthRef.current = marketStrength; }, [marketStrength]);
useEffect(() => {
  updatePendingTrade();
}, [filteredSignals, marketStrength]);

useEffect(() => {
  let ws;

  const initializeWebSocket = () => {
    ws = new WebSocket("wss://ftsa-ai-backend.onrender.com/brain");// <-- replace with your actual WS URL

    ws.onopen = () => console.log("Brain WebSocket connected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "MARKET_STRENGTH") {
  setMarketStrength(
    data.payload.map(p => ({
      pair: p.symbol,
      strength: p.strength,
      trend: p.bias ? p.bias : "Unknown",
      color: p.signal || "neutral",
    }))
  );
}



      if (data.type === "TOP_PAIR") setTopPair(data.payload);
    };

    ws.onclose = () => console.log("Brain WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error", err);
  };

  initializeWebSocket();

  return () => {
    if (ws) ws.close();
  };
}, []);
// Auto-refresh brain data every 5 seconds
useEffect(() => {
  const interval = setInterval(() => {
    loadBrainData(false); // refresh in background silently
  }, 5000); // 5000ms = 5 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, []);
useEffect(() => {
  fetchEaUpdates(); // initial fetch
  const interval = setInterval(fetchEaUpdates, 2000); // fetch every 2 seconds
  return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (eaUpdatedTrades[0]?.tradeActivated === "CLOSED") {
    const timer = setTimeout(() => setEaUpdatedTrades([]), 5000); // remove after 5s
    return () => clearTimeout(timer);
  }
}, [eaUpdatedTrades]);

// Auto-refresh filtered signals every 5 seconds
useEffect(() => {
  const fetchFilteredSignals = async () => {
    try {
      const resp = await APIControl.fetchFilteredSignals();
      if (resp.success) {
        // Make sure it's a new array reference to force re-render
        setFilteredSignals([...resp.data]);
        console.log("Filtered signals updated:", resp.data);
      }
    } catch (err) {
      console.error("Failed to fetch filtered signals:", err);
    }
  };

  fetchFilteredSignals(); // initial fetch
  const interval = setInterval(fetchFilteredSignals, 5000); // refresh every 5 seconds
  return () => clearInterval(interval); // cleanup on unmount
}, []);

useEffect(() => {
  const initialize = async () => {
    try {
      // Load saved RMS settings
      const resp = await APIControl.fetchRmsSettings();
      if (resp.success && resp.data) {
        const s = resp.data;
        setSettings({
          maxTrades: s.maxTrades ?? 1,
          risk: s.risk ?? 1,
          dailyMaxLoss: s.dailyMaxLoss ?? 1,
          tpTargets: s.tpTargets ?? "tp1",
        });
      }

     // Load initial brain data once, show loader only for first load
await loadBrainData(true);

    } catch (err) {
      console.error("Failed to initialize RMS settings or brain data", err);
    }
  };

  initialize();
}, []);
// Send pendingTrade to backend for calculation whenever it changes
useEffect(() => {
  if (!pendingTrade) return;

  const sendTradeToBackend = async () => {
    try {
      // Prepare a clean trade object with live balance and numeric values
      const tradeToSend = {
        ...pendingTrade,
        initialBalance: accountTotals.balance, // live balance from MT + Prop
        risk: settings.risk,
        tpTargets: settings.tpTargets,
        dailyMaxLoss: settings.dailyMaxLoss,
        entry: Number(pendingTrade.entry) || 0,
        sl: Number(pendingTrade.sl) || 0,
        tp: Number(pendingTrade.tp) || 0
      };

      const resp = await fetch('https://ftsa-ai-backend.onrender.com/api/ftsacalculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingTrade: tradeToSend }),
      });

      if (!resp.ok) throw new Error('Failed to send trade to backend');
      const data = await resp.json();

      if (data?.data) {
        const { signalJson, trendJson } = data.data;

        // Update EA trades with backend-calculated results
        setEaUpdatedTrades([{
          tradeActivated: trendJson.tradeActivated,
          lots: signalJson.lots,
          tp: signalJson.tp,
          sl: signalJson.sl
        }]);

        // Also update pendingTrade with calculated TP/SL if needed
        setPendingTrade(prev => ({
          ...prev,
          tp: signalJson.tp,
          sl: signalJson.sl,
          lots: signalJson.lots,
          tradeActivated: trendJson.tradeActivated
        }));
      }
    } catch (err) {
      console.error('Error sending trade to backend:', err);
    }
  };

  sendTradeToBackend();
}, [pendingTrade, accountTotals.balance, settings.risk, settings.tpTargets, settings.dailyMaxLoss]);

// List of all major and minor currency pairs
const allPairs =  [
  // Forex
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURCAD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPCAD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF","AUDCAD",
  "CADJPY","CADCHF","CHFJPY",
  "NZDJPY","NZDCHF","NZDCAD",

  // Indices
  "US30","NAS100",

  // Metals
  "XAUUSD",

  // Crypto
  "BTCUSD","ETHUSD"
];


  return (
    <div
      style={{
        color: "#00FFFF",
        fontFamily: "Orbitron",
        backgroundColor: "#000000",
        padding: "1rem",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textShadow: "0 0 8px #00FFFF" }}>FTSA AI Brain Control</h1>

      {loading && <p style={{ color: "#00FFFF" }}>Loading AI brain data...</p>}
      {error && <p style={{ color: "#FF0000" }}>{error}</p>}
      {/* Today's Trade */}
<section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Today's Trade</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "700px" }}>
      <thead>
        <tr>
          <th style={thShadowStyle}>Time</th>
          <th style={thShadowStyle}>Type</th>
          <th style={thShadowStyle}>Mode</th>
          <th style={thShadowStyle}>Pair</th>
          <th style={thShadowStyle}>Trend</th>
          <th style={thShadowStyle}>Entry</th>
          <th style={thShadowStyle}>SL</th>
          <th style={thShadowStyle}>TP</th>
          <th style={thShadowStyle}>Trade Activated</th>
        </tr>
      </thead>
     <tbody>
  {pendingTrade ? (
    <tr key="pending" style={{ backgroundColor: "#000000" }}>
      <td style={tdVerticalLineStyle}>{pendingTrade.time}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.type}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.mode}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.symbol}</td>
      <td style={{ ...tdVerticalLineStyle, textAlign: "center", color: pendingTrade.trend === "bullish" ? "#00FF00" : "#FF0000" }}>
        {pendingTrade.trend}
      </td>
      <td style={tdVerticalLineStyle}>{pendingTrade.entry}</td>
<td style={tdVerticalLineStyle}>{pendingTrade.sl}</td>
<td style={tdVerticalLineStyle}>{pendingTrade.tp}</td>

<td style={lastTdStyle}>
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "8px",
    backgroundColor: eaUpdatedTrades[0]?.tradeActivated === "ACTIVE" ? "#00FF00" :
                     eaUpdatedTrades[0]?.tradeActivated === "CLOSED" ? "#FF0000" : "#FFA500",
    color: "#000",
    fontWeight: "bold"
  }}>
    {eaUpdatedTrades[0]?.tradeActivated || "Pending"}
  </span>
</td>

    </tr>
  ) : (
    <tr>
      <td colSpan={9} style={{ textAlign: "center" }}>No trades yet</td>
    </tr>
  )}
</tbody>

    </table>
  </div>
</section>
      {/* Market Strength Table */}
      <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Market Strength</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "400px" }}>
      <thead>
        <tr>
          <th style={{ ...thShadowStyle, textAlign: "left" }}>Pair</th>
<th style={{ ...thShadowStyle, textAlign: "right" }}>Strength %</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trend</th>
        </tr>
      </thead>
      <tbody>
        {marketStrength?.length > 0 ? (
          marketStrength.map((row, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: row.pair === topPair ? "#002255" : "transparent",
                fontWeight: row.pair === topPair ? "bold" : "normal",
              }}
            >
              <td style={tdVerticalLineStyle}>{row.pair}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "right" }}>{row.strength}</td>
<td style={{ ...lastTdStyle, textAlign: "center", color: row.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
  {row.trend}
</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} style={{ textAlign: "center" }}>No data</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
   {/* Trading View Signals */}
<section style={{ ...scrollableTableContainer, maxHeight: "300px", overflowY: "auto" }}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Trading View Signals</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "750px" }}>
      <thead>
  <tr>
    <th style={thShadowStyle}>Symbol</th>
    <th style={thShadowStyle}>Type</th>
    <th style={thShadowStyle}>Status</th>
    <th style={thShadowStyle}>Choch</th>
    <th style={thShadowStyle}>Entry</th>
    <th style={thShadowStyle}>SL</th>
    <th style={thShadowStyle}>TP</th>
    <th style={thShadowStyle}>Timeframe</th>
  </tr>
</thead>

      <tbody>
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal, idx) => (
           <tr
  key={idx}
  style={{
    backgroundColor: signal.type === "BUY" ? "#003300" :
                     signal.type === "SELL" ? "#330000" : "transparent",
    color: signal.type === "BUY" ? "#00FF00" :
           signal.type === "SELL" ? "#FF0000" : "#00FFFF"
  }}
>
  <td style={tdVerticalLineStyle}>{signal.symbol}</td>
  <td style={tdVerticalLineStyle}>
    {signal.type === "BUY" && <span style={{ color: "#00FF00" }}>↑ BUY</span>}
    {signal.type === "SELL" && <span style={{ color: "#FF0000" }}>↓ SELL</span>}
    {!["BUY","SELL"].includes(signal.type) && signal.type}
  </td>
  <td style={tdVerticalLineStyle}>{signal.status || "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.choch ? `${signal.choch} (${signal.chochType})` : "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.entry ?? "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.sl ?? "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.tp3 ?? "-"}</td>
  <td style={lastTdStyle}>{signal.timeframe || "-"}</td>
</tr>

          ))
        ) : (
          <tr>
            <td colSpan={10} style={{ textAlign: "center" }}>No signals available</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
{/* Risk Management Settings */}
<section
  style={{
    marginBottom: "2rem",
    border: "1px solid #00FFFF",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 0 10px #00FFFF",
  }}
>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Risk Management Settings</h2>

  {/* Max Trades / Day */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Max Trades / Day:</p>
    <select
      value={settings.maxTrades || 1}
      onChange={(e) => {
        const maxTrades = parseInt(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, maxTrades };
          APIControl.saveRmsSettings(updated);
          return updated;
        });
      }}
    >
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={3}>3</option>
    </select>
  </div>

  {/* Risk % per Trade */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Risk % per Trade:</p>
    <select
      value={settings.risk || 1}
      onChange={(e) => {
        const risk = parseFloat(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, risk };
          APIControl.saveRmsSettings(updated);
          return updated;
        });
      }}
    >
      <option value={0.25}>0.25%</option>
      <option value={0.5}>0.5%</option>
      <option value={0.75}>0.75%</option>
      <option value={1}>1%</option>
      <option value={1.25}>1.25%</option>
      <option value={1.5}>1.5%</option>
      <option value={1.75}>1.75%</option>
      <option value={2}>2%</option>
    </select>
  </div>

  {/* Daily Max Loss % */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Daily Max Loss %:</p>
    <select
      value={settings.dailyMaxLoss || 1}
      onChange={(e) => {
        const dailyMaxLoss = parseFloat(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, dailyMaxLoss };
          APIControl.saveRmsSettings(updated)
          return updated;
        });
      }}
    >
      <option value={0.25}>0.25%</option>
      <option value={0.5}>0.5%</option>
      <option value={0.75}>0.75%</option>
      <option value={1}>1%</option>
      <option value={1.25}>1.25%</option>
      <option value={1.5}>1.5%</option>
      <option value={1.75}>1.75%</option>
      <option value={2}>2%</option>
    </select>
  </div>

  {/* TP Targets */}
  <div style={{ marginBottom: "1rem" }}>
    <p>TP Targets:</p>
    <select
      value={settings.tpTargets || "tp1"}
      onChange={(e) => {
  const tpTargets = e.target.value;
  setSettings(prev => {
    const updated = { ...prev, tpTargets };
    APIControl.saveRmsSettings(updated); // ✅ Fixed
    return updated;
  });
}}

    >
      <option value="tp1">TP1</option>
      <option value="tp2">TP2</option>
      <option value="tp3">TP3</option>
    </select>
  </div>

  <div>
    <NeonButton
  onClick={async () => {
    try {
      await APIControl.saveRmsSettings(settings);
      setSaveMessage("✅ Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000); // hide after 3s
    } catch (err) {
      console.error(err);
      setSaveMessage("❌ Failed to save settings.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }}
>
  Save Risk Management Settings
</NeonButton>
{saveMessage && <p style={{ color: "#00FF00", marginTop: "0.5rem" }}>{saveMessage}</p>}
  </div>
</section>


      {/* Auto Trade Control */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #00FFFF",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px #00FFFF",
        }}
      >
        <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Auto-Trade Control</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
          <NeonButton onClick={() => toggleAutoTrade(true)}>Start</NeonButton>
          <NeonButton onClick={() => toggleAutoTrade(false)}>Stop</NeonButton>
        </div>
        <p>Status: {autoTradeStatus || "Unknown"}</p>
      </section>
{/* Top 3 Pairs */}
   <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Top 3 Pairs</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "400px" }}>
      <thead>
        <tr>
         <th style={{ ...thShadowStyle, textAlign: "left" }}>Selected Pair</th>
<th style={{ ...thShadowStyle, textAlign: "right" }}>Strength %</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trend</th>
        </tr>
      </thead>
      <tbody>
        {[...marketStrength]
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 3)
          .map((row, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: row.pair === topPair ? "#002255" : "transparent",
                fontWeight: row.pair === topPair ? "bold" : "normal",
              }}
            >
              <td style={tdVerticalLineStyle}>{row.pair}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "right" }}>{row.strength}</td>
<td style={{ ...lastTdStyle, textAlign: "center", color: row.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
  {row.trend}
</td>

            </tr>
          ))}
      </tbody>
    </table>
  </div>
</section>
 
    </div>
  );
}
