// src/pages/BrainPage.jsx
import React, { useEffect, useState } from "react";
import { useBrainData } from "../contexts/BrainDataContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl"; // for fetching brain data, market strength, CHoCH

// WhatsApp-like color palette
const waColors = {
  background: "#121B22",
  primaryText: "#EDEDED",
  accent: "#25D366",
  danger: "#FF4C4C",
  boxBg: "#1F2C34",
  inputBg: "#1F2C34",
  inputBorder: "#25D366",
};

export default function BrainPage() {
  const { autoTradeStatus, toggleAutoTrade } = useBrainData();

  const [marketStrength, setMarketStrength] = useState([]);
  const [chochData, setChochData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    pairs: [],    // array of selected pairs
    risk: 1,      // risk % (default 1%)
    dailyTP: 2,   // daily take profit %
    dailySL: 1,   // daily stop loss %
  });

  const allPairs = [
    "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "NZDUSD", "USDCAD",
    "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURNZD",
    "GBPJPY", "GBPCHF", "GBPAUD", "GBPNZD",
    "AUDJPY", "AUDNZD", "AUDCHF",
    "CADJPY", "CADCHF",
    "CHFJPY", "NZDJPY", "NZDCHF"
  ];

  const loadBrainData = async () => {
    setLoading(true);
    setError(null);
    try {
      const strengthResp = await APIControl.fetchMarketStrength();
      if (!strengthResp.success) throw new Error("Failed to fetch market strength");
      const strengthJson = strengthResp.data;
      setMarketStrength(
        strengthJson.map((p) => ({
          pair: p.symbol,
          strength: p.percent,
          trend: p.percent >= 50 ? "Bullish" : "Bearish",
          color: p.color,
        }))
      );

      const chochResp = await APIControl.fetchChochData();
      if (!chochResp.success) throw new Error("Failed to fetch CHoCH data");
      const chochJson = chochResp.data;

      try {
        await APIControl.saveSettingsData({ eaSettings: settings });
      } catch (err) {
        console.error("Failed to send settings to brain:", err);
      }

      setChochData(chochJson);
    } catch (err) {
      setError("Failed to load brain data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrainData();
    const interval = setInterval(loadBrainData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        color: waColors.primaryText,
        fontFamily: "Orbitron, sans-serif",
        backgroundColor: waColors.background,
        padding: "1rem",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textShadow: `0 0 5px ${waColors.accent}` }}>
        FTSA AI Brain Control
      </h1>

      {loading && <p style={{ color: waColors.accent }}>Loading AI brain data...</p>}
      {error && <p style={{ color: waColors.danger }}>{error}</p>}

      {/* Market Strength Table */}
      <section style={sectionStyle()}>
        <h2 style={headerStyle()}>Market Strength</h2>
        <table style={tableStyle()}>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Strength %</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {marketStrength?.length > 0 ? (
              marketStrength.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.pair}</td>
                  <td>{row.strength}</td>
                  <td style={{ color: row.trend === "Bullish" ? waColors.accent : waColors.danger }}>
                    {row.trend}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* CHoCH Data */}
      <section style={sectionStyle()}>
        <h2 style={headerStyle()}>CHoCH (Lower TF)</h2>
        <table style={tableStyle()}>
          <thead>
            <tr>
              <th>Pair</th>
              <th>Side</th>
              <th>Valid</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(chochData).length > 0 ? (
              Object.entries(chochData).map(([symbol, data], idx) => (
                <tr key={idx}>
                  <td>{symbol}</td>
                  <td>{data.side || "-"}</td>
                  <td>{data.valid ? "✅" : "❌"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3}>No CHoCH data</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Brain Settings */}
      <section style={sectionStyle()}>
        <h2 style={headerStyle()}>EA Settings</h2>
        <div style={{ marginBottom: "1rem", display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ width: "100%" }}>Select Pairs:</p>
          {allPairs.map((pair) => (
            <label key={pair} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <input
                type="checkbox"
                value={pair}
                checked={settings.pairs.includes(pair)}
                onChange={(e) => {
                  const newPairs = e.target.checked
                    ? [...settings.pairs, e.target.value]
                    : settings.pairs.filter((p) => p !== e.target.value);
                  setSettings({ ...settings, pairs: newPairs });
                }}
                style={{
                  accentColor: waColors.accent,
                  cursor: "pointer",
                }}
              />
              {pair}
            </label>
          ))}
        </div>

        {/* Risk % */}
        <div style={{ marginBottom: "1rem" }}>
          <p>Risk %:</p>
          <select
            value={settings.risk}
            onChange={(e) => setSettings({ ...settings, risk: parseFloat(e.target.value) })}
            style={selectStyle()}
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
            onChange={(e) => setSettings({ ...settings, dailyTP: parseFloat(e.target.value) })}
            style={selectStyle()}
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
            onChange={(e) => setSettings({ ...settings, dailySL: parseFloat(e.target.value) })}
            style={selectStyle()}
          >
            <option value={0.5}>0.5%</option>
            <option value={1}>1%</option>
            <option value={2}>2%</option>
          </select>
        </div>
      </section>

      {/* Auto Trade Control */}
      <section style={sectionStyle()}>
        <h2 style={headerStyle()}>Auto-Trade Control</h2>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
          <NeonButton style={waButton()} onClick={() => toggleAutoTrade(true)}>Start</NeonButton>
          <NeonButton style={waButton()} onClick={() => toggleAutoTrade(false)}>Stop</NeonButton>
        </div>
        <p>Status: {autoTradeStatus || "Unknown"}</p>
      </section>

      {/* Chats with FTSA AI + Voice Chat */}
      <section style={sectionStyle()}>
        <h2 style={headerStyle()}>Chats with FTSA AI</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <textarea
            placeholder="Type your message..."
            style={chatInputStyle()}
          />
          <NeonButton style={waButton()}>Send</NeonButton>
          <NeonButton style={waButton()}>Voice Chat</NeonButton>
        </div>
      </section>
    </div>
  );
}

// -----------------------------
// Styles
// -----------------------------
function sectionStyle() {
  return {
    marginBottom: "2rem",
    border: "1px solid #25D366",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 0 10px #25D366",
    backgroundColor: "#1F2C34",
  };
}

function headerStyle() {
  return { textShadow: "0 0 5px #25D366" };
}

function tableStyle() {
  return { width: "100%", borderCollapse: "collapse", color: "#EDEDED" };
}

function selectStyle() {
  return {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #25D366",
    backgroundColor: "#1F2C34",
    color: "#EDEDED",
    cursor: "pointer",
  };
}

function chatInputStyle() {
  return {
    backgroundColor: "#1F2C34",
    color: "#EDEDED",
    border: "1px solid #25D366",
    borderRadius: "8px",
    padding: "0.5rem",
    fontFamily: "Orbitron",
    boxShadow: "0 0 5px #25D366",
  };
}

function waButton() {
  return {
    backgroundColor: "#25D366",
    color: "#121B22",
    fontWeight: "bold",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  };
}
