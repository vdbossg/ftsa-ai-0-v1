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
  const [chochData, setChochData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
  pairs: [],    // array of selected pairs
  risk: 1,      // risk % (default 1%)
  dailyTP: 2,   // daily take profit %
  dailySL: 1,   // daily stop loss %
});

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
  borderBottom: "1px solid #00FFFF",
  borderRight: "1px solid #00FFFF",
  padding: "0.5rem",
};

const lastTdStyle = {
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem",
};

const tradeHistoryRef = useRef(tradeHistory);
const marketStrengthRef = useRef(marketStrength);


const saveSettings = async (newSettings) => {
  try {
    await APIControl.saveSettings(newSettings); // backend endpoint
  } catch (err) {
    console.error("Failed to save settings", err);
  }
};
const loadBrainData = async () => {
  setLoading(true);
  setError(null);
  try {
    // Fetch market strength
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



    // Fetch CHoCH direction
   const chochResp = await APIControl.fetchChochData();
if (!chochResp.success) throw new Error("Failed to fetch CHoCH data");
const chochJson = chochResp.data;

setChochData(
  Array.isArray(chochJson) ? chochJson : []
);


  } catch (err) {
    setError("Failed to load brain data");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
useEffect(() => { marketStrengthRef.current = marketStrength; }, [marketStrength]);

useEffect(() => {
  let ws;

  const initializeWebSocket = () => {
    ws = new WebSocket("ws://localhost:5000/brain"); // <-- replace with your actual WS URL

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

    if (data.type === "CHOCH_DATA") {
  // Ensure chochData is always an array
  const choch = Array.isArray(data.payload) ? data.payload : [];
  // Fill missing pairs with default invalid values
  const allPairsList = [
    "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
    "EURGBP","EURJPY","EURCHF","EURAUD","EURNZD",
    "GBPJPY","GBPCHF","GBPAUD","GBPNZD",
    "AUDJPY","AUDNZD","AUDCHF",
    "CADJPY","CADCHF",
    "CHFJPY","NZDJPY","NZDCHF"
  ];
  const filledChoch = allPairsList.map(p => {
    const found = choch.find(c => c.symbol === p);
    return found || { symbol: p, side: null, valid: false };
  });
  setChochData(filledChoch);
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
    loadBrainData();
  }, 5000); // 5000ms = 5 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, []);

useEffect(() => {
  const initialize = async () => {
    try {
      // Load saved settings
      const resp = await APIControl.fetchSettingsData();
      if (resp.success && resp.data?.tradingSettings) {
        const s = resp.data.tradingSettings;
        setSettings({
  pairs: s.pairs || [],
  risk: s.risk ?? 1,
  dailyTP: s.dailyTP ?? s.dailyTarget ?? 2,
  dailySL: s.dailySL ?? s.dailyStopLoss ?? 1,
});

      }

      // Load initial brain data once
      await loadBrainData();
    } catch (err) {
      console.error("Failed to initialize settings or brain data", err);
    }
  };

  initialize();
}, []);


// List of all major and minor currency pairs
const allPairs = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "NZDUSD", "USDCAD",
  "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURNZD",
  "GBPJPY", "GBPCHF", "GBPAUD", "GBPNZD",
  "AUDJPY", "AUDNZD", "AUDCHF",
  "CADJPY", "CADCHF",
  "CHFJPY", "NZDJPY", "NZDCHF"
];


useEffect(() => {
  if (!autoTradeStatus || !topPair) return;

  const today = new Date().toISOString().split("T")[0];
  const alreadyTraded = tradeHistoryRef.current.some(t => t.date === today);
  if (alreadyTraded) return;

  APIControl.executeTrade({
    pair: topPair,
    risk: settings.risk,
    dailyTP: settings.dailyTP,
    dailySL: settings.dailySL,
  }).then(() => {
    const now = new Date();
    const tradeData = {
      time: now.toLocaleTimeString(),
      date: today,
      pair: topPair,
      strength: marketStrengthRef.current.find(p => p.pair === topPair)?.strength || 0,
      trend: marketStrengthRef.current.find(p => p.pair === topPair)?.trend || "-",
      tradeActivated: true,
    };
    setTradeHistory(prev => [tradeData, ...prev]);
  }).catch(err => console.error("Trade execution failed", err));
}, [autoTradeStatus, topPair, settings]);

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

      {/* Strongest Pair / Trade History Table */}
      <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Trade History / Strongest Pair</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "700px" }}>
      <thead>
        <tr>
         <th style={{ ...thShadowStyle, textAlign: "left" }}>Time</th>
<th style={{ ...thShadowStyle, textAlign: "left" }}>Date</th>
<th style={{ ...thShadowStyle, textAlign: "left" }}>Pair</th>
<th style={{ ...thShadowStyle, textAlign: "right" }}>Strength</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trend</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trade Activated</th>
        </tr>
      </thead>
      <tbody>
        {tradeHistory.length > 0 ? (
          tradeHistory.map((t, idx) => (
            <tr key={idx} style={{ backgroundColor: t.tradeActivated ? "#002255" : "transparent" }}>
             <td style={tdVerticalLineStyle}>{t.time}</td>
<td style={tdVerticalLineStyle}>{t.date}</td>
<td style={tdVerticalLineStyle}>{t.pair}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "right" }}>{t.strength}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "center", color: t.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
  {t.trend}
</td>
<td style={lastTdStyle}>{t.tradeActivated ? "✅" : "❌"}</td>

            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} style={{ textAlign: "center" }}>No trades yet</td>
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
      {/* CHoCH Data */}
      <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>CHoCH (Lower TF)</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "400px" }}>
      <thead>
        <tr>
          <th style={{ ...thShadowStyle, textAlign: "left" }}>Pair</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Side</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Valid</th>
        </tr>
      </thead>
      <tbody>
        {chochData.map((item, idx) => (
          <tr
            key={idx}
            style={{
              backgroundColor: item.symbol === topPair ? "#002255" : "transparent",
              fontWeight: item.symbol === topPair ? "bold" : "normal",
            }}
          >
            <td style={tdVerticalLineStyle}>{item.symbol}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "center" }}>{item.side ? item.side : "-"}</td>
<td style={{ ...lastTdStyle, textAlign: "center" }}>{item.valid ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

      {/* Brain Settings */}
<section
  style={{
    marginBottom: "2rem",
    border: "1px solid #00FFFF",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 0 10px #00FFFF",
  }}
>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>EA Settings</h2>
{/* Risk % */}
<div style={{ marginBottom: "1rem" }}>
  <p>Risk %:</p>
  <select
    value={settings.risk}
    onChange={(e) => {
  const newRisk = parseFloat(e.target.value);
  setSettings(prev => {
    const updated = { ...prev, risk: newRisk };
    saveSettings(updated);
    return updated;
  });
}}

  >
    <option value={0.5}>0.5%</option>
    <option value={1}>1%</option>
    <option value={1.5}>1.5%</option>
    <option value={2}>2%</option>
  </select>
</div>

{/* Daily TP % */}
<div style={{ marginBottom: "1rem" }}>
  <p>Daily Take Profit %:</p>
  <select
    value={settings.dailyTP}
    onChange={(e) => {
  const newTP = parseFloat(e.target.value);
  setSettings(prev => {
    const updated = { ...prev, dailyTP: newTP };
    saveSettings(updated);
    return updated;
  });
}}
  >
    <option value={2}>2%</option>
    <option value={3}>3%</option>
    <option value={4}>4%</option>
    <option value={5}>5%</option>
  </select>
</div>

{/* Daily SL % */}
<div style={{ marginBottom: "1rem" }}>
  <p>Daily Stop Loss %:</p>
  <select
    value={settings.dailySL}
    onChange={(e) => {
  const newSL = parseFloat(e.target.value);
  setSettings(prev => {
    const updated = { ...prev, dailySL: newSL };
    saveSettings(updated);
    return updated;
  });
}}
  >
    <option value={0.5}>0.5%</option>
    <option value={1}>1%</option>
    <option value={2}>2%</option>
  </select>
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
