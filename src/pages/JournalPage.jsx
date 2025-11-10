// src/pages/JournalPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import Modal from "../components/Modal";
import BalanceGraph from "../components/BalanceGraph"; // a component to render graph
import "../styles/JournalPage.css";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function JournalPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [propJournal, setPropJournal] = useState([]);
  const [mtJournal, setMtJournal] = useState([]);

  const [selectedTrade, setSelectedTrade] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    winLoss: "",
    symbolSearch: "",
  });


  useEffect(() => {
  if (!isAuthenticated) return;

  let isMounted = true;

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const [propData, mtData] = await Promise.all([
        APIControl.fetchPropAIJournal(filters),
        APIControl.fetchMTAIJournal(filters),
      ]);

      if (!isMounted) return;

      setPropJournal(propData.data || []);
      setMtJournal(mtData.data || []);
      setError(null);
    } catch (err) {
      if (!isMounted) return;
      setError("Failed to load journal data.");
      setPropJournal([]);
      setMtJournal([]);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  // Initial fetch
  fetchJournals();

  // Auto-refresh interval (15s)
  const interval = setInterval(fetchJournals, 15000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [isAuthenticated, filters]);


  if (!isAuthenticated)
    return (
      <div
        style={{
          color: neonColors.neonRed,
          fontFamily: "'Orbitron', sans-serif",
          textAlign: "center",
          marginTop: "5rem",
        }}
      >
        Please login to view your trading journal.
      </div>
    );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const openModal = (trade) => {
    setSelectedTrade(trade);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedTrade(null);
    setModalOpen(false);
  };

  const renderTable = (trades, type) => (
    <div
      style={{
        overflowX: "auto",
        maxHeight: 350,
        marginBottom: "2rem",
        border: `2px solid ${neonColors.neonBlue}`,
        borderRadius: "12px",
        boxShadow: `0 0 15px ${neonColors.neonBlue}`,
        backgroundColor: "#111",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: "'Orbitron', sans-serif",
          color: neonColors.neonBlue,
        }}
      >
        <thead>
          <tr>
            {(type === "prop"
  ? [
      "Date",
      "Broker",
      "Login ID",
      "Ticket",
      "Pair",
      "Profit/Loss ($)",
      "Profit Target",
      "Initial Profit",
      "Gain/Drawdown %",
      "Action",
    ]
  : [
      "Date",
      "Broker",
      "Login ID",
      "Ticket",
      "Pair",
      "Profit/Loss ($)",
      "Action",
    ]
).map((header) => (
  <th
    key={header}
    style={{
      borderBottom: `1px solid ${neonColors.neonBlue}`,
      padding: "0.5rem",
      whiteSpace: "nowrap",
      fontWeight: "bold",
    }}
  >
    {header}
  </th>
))}


          </tr>
        </thead>
        <tbody>
          {trades.length > 0 ? (
            trades.map((trade) => (
              <tr key={trade.ticket} style={{ textAlign: "center" }}>
                <td>{format(new Date(trade.date), "dd/MM/yyyy")}</td>
                <td>{trade.broker}</td>
                <td>{trade.login}</td>
                <td>{trade.ticket}</td>
                <td>{trade.pair}</td>
                <td
                  style={{
                    color: trade.profit >= 0 ? neonColors.neonGreen : neonColors.neonRed,
                  }}
                >
                  {trade.profit != null ? trade.profit.toFixed(2) : "-"}

                </td>
                {type === "prop" && (
                  <>
                    <td>{trade.profitTarget?.toFixed(2) || "-"}</td>
                    <td>{trade.initialProfit?.toFixed(2) || "-"}</td>
                    <td>{trade.gainDrawdownPercent?.toFixed(2) || "-"}%</td>
                  </>
                )}
                <td>
                  <NeonButton
                    onClick={() => openModal(trade)}
                    style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                  >
                    View
                  </NeonButton>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={type === "prop" ? 10 : 7}
                style={{ color: neonColors.neonOrange, padding: "1rem" }}
              >
                No journal entries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderModalContent = () => {
    if (!selectedTrade) return null;

    const isProp = selectedTrade.accountType?.includes("prop");

    return (
      <div style={{ color: neonColors.neonBlue }}>
        {/* Part 1 */}
        <h3>Trade Info</h3>
        <table style={{ width: "100%", marginBottom: "1rem", color: neonColors.neonBlue }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Broker</th>
              <th>Login ID</th>
              <th>Pair</th>
              <th>Type</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{new Date(selectedTrade.date).toLocaleDateString()}</td>
              <td>{selectedTrade.broker}</td>
              <td>{selectedTrade.login}</td>
              <td>{selectedTrade.pair}</td>
              <td>{selectedTrade.side}</td>
              <td>{selectedTrade.lotSize}</td>
            </tr>
          </tbody>
        </table>

        {/* Part 2 */}
        <h3>Trade Details</h3>
        <table style={{ width: "100%", marginBottom: "1rem", color: neonColors.neonBlue }}>
          <thead>
            <tr>
              <th>Entry Price</th>
              <th>TP</th>
              <th>SL</th>
              <th>Exit Price</th>
              <th>Profit ($)</th>
              <th>R:R:R</th>
              <th>Pips</th>
              <th>Risk %</th>
              <th>Session</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{selectedTrade.entry}</td>
              <td>{selectedTrade.tp}</td>
              <td>{selectedTrade.sl}</td>
              <td>{selectedTrade.exit}</td>
              <td>{selectedTrade.profit}</td>
              <td>{selectedTrade.rr}</td>
              <td>{selectedTrade.pips}</td>
              <td>{selectedTrade.riskPercent}</td>
              <td>{selectedTrade.session}</td>
            </tr>
          </tbody>
        </table>

        {/* Part 3 for Prop only */}
        {isProp && (
          <>
            <h3>Prop Metrics</h3>
            <table style={{ width: "100%", marginBottom: "1rem", color: neonColors.neonBlue }}>
              <thead>
                <tr>
                  <th>Profit Target</th>
                  <th>Initial Profit</th>
                  <th>Gain/Drawdown %</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{selectedTrade.profitTarget}</td>
                  <td>{selectedTrade.initialProfit}</td>
                  <td>{selectedTrade.gainDrawdownPercent}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Cards */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
          <div className="trade-card">AI Strategy: {selectedTrade.aiStrategy || "-"}</div>
<div className="trade-card">Execution Notes: {selectedTrade.executionNotes || "-"}</div>
<div className="trade-card">Conclusions: {selectedTrade.conclusions || "-"}</div>
        </div>

        {/* Graph */}
        <h3>Balance Evolution</h3>
        <BalanceGraph
  data={(selectedTrade.balanceHistory || []).map((balance, index) => ({
    date: index + 1, // or you can use actual timestamps if you have them
    balance,
  }))}
/>
      </div>
    );
  };

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        padding: "1rem",
        minHeight: "100vh",
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
        FTSA AI - JOURNAL
      </header>

      {/* Filters */}
      <form
        onSubmit={(e) => e.preventDefault()}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1rem",
        }}
      >
        <label>
          Date From
          <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
        </label>
        <label>
          Date To
          <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
        </label>
        <label>
          Win/Loss
          <select name="winLoss" value={filters.winLoss} onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </label>
        <label>
          Symbol
          <input
            type="text"
            name="symbolSearch"
            placeholder="Search symbol"
            value={filters.symbolSearch}
            onChange={handleFilterChange}
          />
        </label>
      </form>

      {loading && <LoadingSpinner size={50} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error">{error}</StatusBadge>}

      {/* Prop Trades */}
      <h2 style={{ marginTop: "2rem" }}>Prop AI-Journal</h2>
      {renderTable(propJournal, "prop")}

      {/* MT Accounts Trades */}
      <h2 style={{ marginTop: "2rem" }}>MTAccounts AI-Journal</h2>
      {renderTable(mtJournal, "mt")}

      <Modal isOpen={modalOpen} onClose={closeModal}>
        {renderModalContent()}
      </Modal>

      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${neonColors.neonBlue}`,
          fontSize: "0.9rem",
          textAlign: "center",
        }}
      >
        FTSA AI - Powered by KELVIN SPECTER (MBURU G) © 2025
      </footer>
    </div>
  );
}
