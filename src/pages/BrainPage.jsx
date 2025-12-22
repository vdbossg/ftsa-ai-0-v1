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
useEffect(() => {
  const fetchTodaysTrade = async () => {
    try {
      const resp = await fetch('http://localhost:5000/api/ftsacalculator');
      if (!resp.ok) throw new Error('Failed to fetch latest trade');

      const data = await resp.json();

      // Use only trendJson for today's trade
      if (data.trendJson) {
        setTradeHistory([data.trendJson]);
      }
    } catch (err) {
      console.error('Error fetching today\'s trade:', err);
    }
  };

  // Initial fetch
  fetchTodaysTrade();

  // Refresh every 5 seconds
  const interval = setInterval(fetchTodaysTrade, 5000);

  return () => clearInterval(interval);
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
        {tradeHistory.length > 0 ? (
          tradeHistory.map((t, idx) => (
            <tr key={idx} style={{ backgroundColor: "#000000" }}>
              <td style={tdVerticalLineStyle}>{t.time}</td>
              <td style={tdVerticalLineStyle}>{t.type}</td>
              <td style={tdVerticalLineStyle}>{t.mode}</td>
              <td style={tdVerticalLineStyle}>{t.pair}</td>
              <td style={{ ...tdVerticalLineStyle, textAlign: "center", color: t.trend === "bullish" ? "#00FF00" : "#FF0000" }}>
                {t.trend}
              </td>
              <td style={tdVerticalLineStyle}>{t.entry}</td>
              <td style={tdVerticalLineStyle}>{t.sl}</td>
              <td style={tdVerticalLineStyle}>{t.tp}</td>
              <td style={lastTdStyle}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "8px",
                  backgroundColor: t.tradeActivated === "PENDING" ? "#FFA500" : "#00FF00",
                  color: "#000",
                  fontWeight: "bold"
                }}>
                  {t.tradeActivated === "PENDING" ? "Pending" : "Active"}
                </span>
              </td>
            </tr>
          ))
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
          <th style={thShadowStyle}>Mode</th>
          <th style={thShadowStyle}>Choch</th>
          <th style={thShadowStyle}>Resistance</th>
          <th style={thShadowStyle}>Support</th>
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
              <td style={tdVerticalLineStyle}>{signal.mode || "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.choch || "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.resistance ?? "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.support ?? "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.entry ?? "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.sl ?? "-"}</td>
              <td style={tdVerticalLineStyle}>{signal.tp ?? "-"}</td>
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
