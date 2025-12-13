// src/pages/TradingViewPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import { createChart } from "lightweight-charts";

// Timeframes
const TIMEFRAMES = ["1", "3", "5", "15", "30", "45", "60", "120", "240", "1D", "1W", "1M"];

// Dummy candle data for now
const dummyData = [
  { time: 1672444800, open: 170, high: 175, low: 168, close: 172 },
  { time: 1672531200, open: 172, high: 176, low: 171, close: 175 },
  { time: 1672617600, open: 175, high: 180, low: 174, close: 178 },
  { time: 1672704000, open: 178, high: 182, low: 177, close: 180 },
];

const TradingViewDashboard = () => {
  const chartRefs = [useRef(), useRef()]; // two charts
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("60");
  const [theme, setTheme] = useState("Dark");

  useEffect(() => {
    chartRefs.forEach((ref) => {
      if (!ref.current) return;

      // Clear previous chart
      ref.current.innerHTML = "";

      // Create chart
      const chart = createChart(ref.current, {
        layout: {
          background: { color: theme === "Dark" ? "#000" : "#fff" },
          textColor: theme === "Dark" ? "#00FFFF" : "#000",
        },
        width: ref.current.clientWidth,
        height: 500,
      });

      const candleSeries = chart.addCandlestickSeries();
      candleSeries.setData(dummyData);

      // Optional: resize on window
      const handleResize = () => chart.applyOptions({ width: ref.current.clientWidth });
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        chart.remove();
      };
    });
  }, [symbol, timeframe, theme]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme === "Dark" ? "#000" : "#fff", padding: "1rem" }}>
      <h2 style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginBottom: "1rem" }}>TradingView Dashboard</h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}>Symbol:</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="Search symbol..."
            style={{
              padding: "4px 6px",
              backgroundColor: theme === "Dark" ? "#000" : "#fff",
              color: theme === "Dark" ? "#00FFFF" : "#000",
              border: "1px solid #00FFFF",
              borderRadius: "2px",
            }}
          />
        </div>

        <div>
          <label style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}>Timeframe:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="Dark">Dark</option>
            <option value="Light">Light</option>
          </select>
        </div>
      </div>

      {/* Charts Layout */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {chartRefs.map((ref, index) => (
            <ResizableBox key={index} width={800} height={500} minConstraints={[400, 300]} maxConstraints={[1600, 1200]}>
              <div ref={ref} style={{ width: "100%", height: "100%", border: "2px solid #00FFFF" }} />
            </ResizableBox>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingViewDashboard;
