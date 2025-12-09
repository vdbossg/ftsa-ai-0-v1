import React, { useRef, useEffect, useState } from "react";
import { createChart } from "lightweight-charts";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"];
const ASSETS = ["Forex", "Stocks", "Crypto"];
const SYMBOLS = {
  Forex: ["EURUSD", "USDJPY", "GBPUSD"],
  Stocks: ["AAPL", "GOOG", "TSLA"],
  Crypto: ["BTCUSD", "ETHUSD", "DOGEUSD"],
};

const TradingViewPage = () => {
  const chartContainerRef = useRef();
  const [timeframe, setTimeframe] = useState("1h");
  const [asset, setAsset] = useState("Forex");
  const [symbol, setSymbol] = useState("EURUSD");
  const [chart, setChart] = useState(null);
  const [series, setSeries] = useState(null);

  // Initialize chart
  useEffect(() => {
    const newChart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { backgroundColor: "#000", textColor: "#00FFFF" },
      grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: "#555" },
      timeScale: { borderColor: "#555" },
    });

    const candlestickSeries = newChart.addCandlestickSeries({
      upColor: "#00FF00",
      downColor: "#FF0000",
      borderVisible: false,
      wickUpColor: "#00FF00",
      wickDownColor: "#FF0000",
    });

    setChart(newChart);
    setSeries(candlestickSeries);

    const handleResize = () => {
      newChart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      newChart.remove();
    };
  }, []);

  // Update chart data when symbol changes (dummy data for now)
  useEffect(() => {
    if (!series) return;

    // Dummy data example, replace with real API data later
    const exampleData = [
      { time: "2025-12-01", open: 1.12, high: 1.15, low: 1.10, close: 1.14 },
      { time: "2025-12-02", open: 1.14, high: 1.18, low: 1.13, close: 1.16 },
      { time: "2025-12-03", open: 1.16, high: 1.17, low: 1.12, close: 1.13 },
      { time: "2025-12-04", open: 1.13, high: 1.16, low: 1.11, close: 1.15 },
      { time: "2025-12-05", open: 1.15, high: 1.19, low: 1.14, close: 1.18 },
    ];

    series.setData(exampleData);
  }, [symbol, series]);

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "1rem" }}>
      <h2 style={{ color: "#00FFFF", marginBottom: "1rem" }}>Trading Chart</h2>

      {/* Controls */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <div>
          <label style={{ color: "#00FFFF", marginRight: "0.5rem" }}>Asset:</label>
          <select
            value={asset}
            onChange={(e) => {
              setAsset(e.target.value);
              setSymbol(SYMBOLS[e.target.value][0]);
            }}
          >
            {ASSETS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: "#00FFFF", marginRight: "0.5rem" }}>Symbol:</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
            {SYMBOLS[asset].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ color: "#00FFFF", marginRight: "0.5rem" }}>Timeframe:</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            {TIMEFRAMES.map((tf) => (
              <option key={tf} value={tf}>
                {tf}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={chartContainerRef}
        style={{
          width: "100%",
          height: "80vh",
          border: "2px solid #00FFFF",
          boxShadow: "0 0 20px #00FFFF",
        }}
      />
    </div>
  );
};

export default TradingViewPage;
