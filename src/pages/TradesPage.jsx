// src/pages/TradesPage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl"; // Your API call to backend
import "../styles/TradesPage.css";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

const tabs = [
  { key: "active", label: "FTSA'S ACTIVE TRADES" },
  { key: "pending", label: "PENDING ORDERS" },
  { key: "nextTarget", label: "NEXT TARGET" },
];

const pairStrengthData = [
  { symbol: "GBP", percent: 15, color: "🟥" },
  { symbol: "JPY", percent: 32, color: "🟥" },
  { symbol: "EUR", percent: 58, color: "🟧" },
  { symbol: "CHF", percent: 62, color: "🟧" },
  { symbol: "AUD", percent: 75, color: "🟩" },
  { symbol: "CAD", percent: 81, color: "🟩" },
  { symbol: "NZD", percent: 86, color: "🟩" },
  { symbol: "USD", percent: 96, color: "🟩" },
];

export default function TradesPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTab, setSelectedTab] = useState("active");
  const [trades, setTrades] = useState({
    active: [],
    pending: [],
    nextTarget: [],
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    APIControl.fetchTradesData(selectedTab)
      .then((data) => {
        setTrades((prev) => ({ ...prev, [selectedTab]: data || [] }));
      })
      .catch(() => setError("Failed to load trade data."))
      .finally(() => setLoading(false));
  }, [isAuthenticated, selectedTab]);

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

  // Safely filter trades
  const filteredTrades = Array.isArray(trades[selectedTab])
    ? trades[selectedTab].filter((t) =>
        t.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getPLColor = (pl) => {
    if (pl > 0) return neonColors.neonGreen;
    if (pl === 0) return neonColors.neonOrange;
    return neonColors.neonRed;
  };

  const headers = {
    active: [
      "Symbol",
      "Type",
      "Lot",
      "Entry",
      "SL",
      "TP",
      "P/L",
      "Win %",
      "TIME (started/end)",
    ],
    pending: [
      "Symbol",
      "Type",
      "Lot",
      "Entry",
      "SL",
      "TP",
      "P/L",
      "Win %",
      "TIME",
    ],
    nextTarget: [
      "Symbol",
      "Type",
      "Lot",
      "Entry",
      "SL",
      "TP",
      "P/L",
      "Possible Win %",
    ],
  };

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
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
        FTSA AI - TRADES
      </header>

      {/* Tabs */}
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {tabs.map(({ key, label }) => (
          <NeonButton
            key={key}
            onClick={() => setSelectedTab(key)}
            style={{
              border:
                selectedTab === key
                  ? `2px solid ${neonColors.neonGreen}`
                  : `2px solid ${neonColors.neonBlue}`,
              backgroundColor: selectedTab === key ? "#002200" : "transparent",
              minWidth: 160,
            }}
          >
            {label}
          </NeonButton>
        ))}
      </nav>

      {/* Search */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          placeholder="🔍 Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: `2px solid ${neonColors.neonBlue}`,
            backgroundColor: "#111",
            color: neonColors.neonBlue,
            fontFamily: "'Orbitron', sans-serif",
            outline: "none",
            minWidth: 240,
          }}
        />
      </div>

      {/* Loading/Error */}
      {loading && (
        <div style={{ textAlign: "center", margin: "1rem" }}>
          <LoadingSpinner size={48} color={neonColors.neonBlue} />
        </div>
      )}
      {error && (
        <StatusBadge status="error" style={{ margin: "1rem auto", maxWidth: 400 }}>
          {error}
        </StatusBadge>
      )}

      {/* Trades Table */}
      <div
        style={{
          overflowX: "auto",
          flexGrow: 1,
          border: `2px solid ${neonColors.neonBlue}`,
          borderRadius: "12px",
          boxShadow: `0 0 15px ${neonColors.neonBlue}`,
          backgroundColor: "#111",
          marginBottom: "1rem",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            color: neonColors.neonBlue,
          }}
        >
          <thead>
            <tr>
              {headers[selectedTab].map((h) => (
                <th
                  key={h}
                  style={{
                    borderBottom: `1px solid ${neonColors.neonBlue}`,
                    padding: "0.5rem",
                    fontWeight: "bold",
                    whiteSpace: "nowrap",
                    textAlign: "center",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTrades.length > 0 ? (
              filteredTrades.map((trade) => (
                <tr
                  key={trade.id}
                  style={{ textAlign: "center", borderBottom: `1px solid ${neonColors.neonBlue}` }}
                >
                  <td>{trade.symbol || "-"}</td>
                  <td>{trade.type || "-"}</td>
                  <td>{trade.lot ?? "-"}</td>
                  <td>{trade.entry ?? "-"}</td>
                  <td>{trade.sl ?? "-"}</td>
                  <td>{trade.tp ?? "-"}</td>
                  <td style={{ color: getPLColor(trade.pl ?? 0), fontWeight: "bold" }}>
                    {(trade.pl ?? 0).toFixed(2)}
                  </td>
                  <td>
                    {selectedTab === "nextTarget"
                      ? trade.possibleWinPercent ?? "-"
                      : trade.winPercent ?? "-"}%
                  </td>
                  {selectedTab !== "nextTarget" ? (
                    <td>{trade.time || "-"}</td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers[selectedTab].length}
                  style={{ color: neonColors.neonOrange, padding: "1rem" }}
                >
                  No trades found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pair Strength Analysis */}
      <section
        style={{
          maxWidth: 400,
          margin: "0 auto 2rem",
          border: `2px solid ${neonColors.neonBlue}`,
          borderRadius: 12,
          padding: "1rem",
          backgroundColor: "#111",
          boxShadow: `0 0 15px ${neonColors.neonBlue}`,
          color: neonColors.neonBlue,
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
          PAIR STRENGTH ANALYSIS
        </h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
            fontFamily: "'Orbitron', sans-serif",
          }}
        >
          <thead>
            <tr>
              <th>Symbol</th>
              <th>%</th>
              <th>Color</th>
            </tr>
          </thead>
          <tbody>
            {pairStrengthData.map(({ symbol, percent, color }) => (
              <tr key={symbol}>
                <td>{symbol}</td>
                <td>{percent}%</td>
                <td>{color}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer
        style={{
          textAlign: "center",
          borderTop: `1px solid ${neonColors.neonBlue}`,
          paddingTop: "1rem",
          color: neonColors.neonBlue,
          fontSize: "0.9rem",
        }}
      >
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) © 2025
      </footer>
    </div>
  );
}
