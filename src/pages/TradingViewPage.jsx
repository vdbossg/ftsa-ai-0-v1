// src/pages/TradingViewPage.jsx
import React, { useState } from "react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

const TradingViewDashboard = () => {
  const [theme, setTheme] = useState("Dark");

  // Feature flag to enable Advanced Charts in the future
  const ADVANCED_CHARTS_ENABLED = false;

  const chartRefs = [null, null]; // placeholders for layout

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme === "Dark" ? "#000" : "#fff",
        padding: "1rem",
      }}
    >
      <h2
        style={{
          color: theme === "Dark" ? "#00FFFF" : "#000",
          marginBottom: "1rem",
        }}
      >
        TradingView Dashboard
      </h2>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label
            style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}
          >
            Symbol:
          </label>
          <input
            type="text"
            placeholder="Search symbol..."
            disabled
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
          <label
            style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}
          >
            Timeframe:
          </label>
          <select disabled>
            <option>60</option>
          </select>
        </div>

        <div>
          <label
            style={{ color: theme === "Dark" ? "#00FFFF" : "#000", marginRight: "0.5rem" }}
          >
            Theme:
          </label>
          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="Dark">Dark</option>
            <option value="Light">Light</option>
          </select>
        </div>
      </div>

      {/* Charts Layout / Coming Soon */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {ADVANCED_CHARTS_ENABLED ? (
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {chartRefs.map((ref, index) => (
              <ResizableBox
                key={index}
                width={800}
                height={600}
                minConstraints={[400, 300]}
                maxConstraints={[1600, 1200]}
              >
                <div
                  id={`chart_${index}`}
                  ref={ref}
                  style={{ width: "100%", height: "100%", border: "2px solid #00FFFF" }}
                />
              </ResizableBox>
            ))}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              height: "600px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px dashed #00FFFF",
              color: theme === "Dark" ? "#00FFFF" : "#000",
              fontSize: "1.5rem",
              textAlign: "center",
            }}
          >
            🚧 TradingView — Coming Soon
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewDashboard;
