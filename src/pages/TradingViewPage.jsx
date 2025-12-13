//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\src\pages\TradingViewPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Ensure charting_library folder is in public/
// Example: public/charting_library/

const TIMEFRAMES = ["1", "3", "5", "15", "30", "45", "60", "120", "240", "1D", "1W", "1M"];

const TradingViewDashboard = ({ datafeed }) => {
  const chartRefs = [useRef(), useRef()]; // Two charts side by side
  const [charts, setCharts] = useState([]);
  const [symbol, setSymbol] = useState("AAPL");
  const [timeframe, setTimeframe] = useState("60");
  const [theme, setTheme] = useState("Dark");

  useEffect(() => {
    if (!window.TradingView) return;

    // Remove old charts
    charts.forEach((w) => w.remove());

    const newCharts = chartRefs.map((ref, index) => {
      const widget = new window.TradingView.widget({
        container_id: `chart_${index}`,
        library_path: "/charting_library/",
        autosize: true,
        symbol,
        interval: timeframe,
        timezone: "Etc/UTC",
        theme,
        style: "1",
        locale: "en",
        toolbar_bg: theme === "Dark" ? "#000" : "#fff",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        studies: [],
        overrides: {
          "paneProperties.background": theme === "Dark" ? "#000" : "#fff",
          "paneProperties.vertGridProperties.color": theme === "Dark" ? "#333" : "#ccc",
          "paneProperties.horzGridProperties.color": theme === "Dark" ? "#333" : "#ccc",
          "scalesProperties.textColor": theme === "Dark" ? "#00FFFF" : "#000",
        },
        fullscreen: false,
        datafeed, // <-- connect your real datafeed here
      });

      // Restore previous state if available
      const stateKey = `chart_${symbol}_${timeframe}_${index}`;
      const savedState = localStorage.getItem(stateKey);
      if (savedState) {
        try {
          widget.load(JSON.parse(savedState));
        } catch (e) {
          console.warn("Failed to restore chart state", e);
        }
      }

      widget.onChartReady(() => {
        const saveState = () => {
          try {
            const state = widget.save();
            localStorage.setItem(stateKey, JSON.stringify(state));
          } catch {}
        };
        widget.onIntervalChanged(saveState);
        widget.onSymbolChanged(saveState);
        widget.onStudyAdded(saveState);
        widget.onStudyRemoved(saveState);
        widget.onDrawingCreated(saveState);
        widget.onDrawingRemoved(saveState);
      });

      return widget;
    });

    setCharts(newCharts);

    return () => newCharts.forEach((w) => w.remove());
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
            <ResizableBox key={index} width={800} height={600} minConstraints={[400, 300]} maxConstraints={[1600, 1200]}>
              <div id={`chart_${index}`} ref={ref} style={{ width: "100%", height: "100%", border: "2px solid #00FFFF" }} />
            </ResizableBox>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingViewDashboard;
