import React, { useEffect, useState } from "react";
import { useBrainData } from "../contexts/BrainDataContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl"; // for fetching brain data, market strength, CHoCH

export default function BrainPage() {
  const { autoTradeStatus, toggleAutoTrade } = useBrainData();

  const [marketStrength, setMarketStrength] = useState([]);
  const [chochData, setChochData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBrainData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch market strength
      const strengthResp = await fetch(`${APIControl.BASE_URL}/api/strength`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      const strengthJson = await strengthResp.json();
      setMarketStrength(
        strengthJson.map((p) => ({
          pair: p.symbol,
          strength: p.percent,
          trend: p.percent >= 50 ? "Bullish" : "Bearish",
          color: p.color,
        }))
      );

      // Fetch CHoCH direction
      const chochResp = await fetch(`${APIControl.BASE_URL}/api/choch`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
      });
      const chochJson = await chochResp.json();
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

      {/* Market Strength Table */}
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #00FFFF",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px #00FFFF",
        }}
      >
        <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Market Strength</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                  <td style={{ color: row.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
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
      <section
        style={{
          marginBottom: "2rem",
          border: "1px solid #00FFFF",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px #00FFFF",
        }}
      >
        <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>CHoCH (Lower TF)</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
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

      {/* Chats with FTSA AI + Voice Chat */}
      <section
        style={{
          border: "1px solid #00FFFF",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 0 10px #00FFFF",
        }}
      >
        <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Chats with FTSA AI</h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <textarea
            placeholder="Type your message..."
            style={{
              backgroundColor: "#000000",
              color: "#00FFFF",
              border: "1px solid #00FFFF",
              borderRadius: "8px",
              padding: "0.5rem",
              fontFamily: "Orbitron",
              boxShadow: "0 0 5px #00FFFF",
            }}
          />
          <NeonButton>Send</NeonButton>
          <NeonButton>Voice Chat</NeonButton>
        </div>
      </section>
    </div>
  );
}
