// src/pages/JournalPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from '../brain/APIControl'; // to implement API calls
import "../styles/JournalPage.css"; // optional CSS file for styles

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

const accountTypes = [
  { key: "mt4", label: "MT4" },
  { key: "mt5", label: "MT5" },
  { key: "mt4prop", label: "MT4 PROP" },
  { key: "mt5prop", label: "MT5 PROP" },
];

export default function JournalPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Current account filter (MT4, MT5, etc)
  const [selectedAccountType, setSelectedAccountType] = useState("mt4");

  // Journal entries and filters
  const [journalEntries, setJournalEntries] = useState([]);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    winLoss: "", // "win" | "loss" | ""
    symbolSearch: "",
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    APIControl.fetchJournalData(selectedAccountType, filters)
      .then((data) => {
        setJournalEntries(data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load journal data.");
        setJournalEntries([]);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, selectedAccountType, filters]);

  if (!isAuthenticated) {
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
  }

  const handleAccountTypeClick = (key) => setSelectedAccountType(key);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSymbol = (e) => {
    e.preventDefault();
    // Trigger fetch via filters change, no extra action needed
  };

  // Placeholder action handlers
  const handleEdit = (ticket) => alert(`Edit entry #${ticket} - To implement`);
  const handleDelete = (ticket) => alert(`Delete entry #${ticket} - To implement`);
  const handleHistory = (ticket) => alert(`History of entry #${ticket} - To implement`);
  const handleAddManual = () => alert("Add manual journal entry - To implement");

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        height: "100%",
        padding: "1rem",
        overflowY: "auto",
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
        FTSA AI - JOURNAL
      </header>

      {/* Account Type Buttons */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {accountTypes.map(({ key, label }) => (
          <NeonButton
            key={key}
            onClick={() => handleAccountTypeClick(key)}
            style={{
              border:
                selectedAccountType === key
                  ? `2px solid ${neonColors.neonGreen}`
                  : `2px solid ${neonColors.neonBlue}`,
              backgroundColor:
                selectedAccountType === key ? "#002200" : "transparent",
              minWidth: 90,
            }}
          >
            {label}
          </NeonButton>
        ))}
      </div>

      {/* Filters */}
      <form
        onSubmit={handleSearchSymbol}
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
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            style={inputStyle}
          />
        </label>
        <label>
          Date To
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            style={inputStyle}
          />
        </label>
        <label>
          Win/Loss
          <select
            name="winLoss"
            value={filters.winLoss}
            onChange={handleFilterChange}
            style={inputStyle}
          >
            <option value="">All</option>
            <option value="win">Win</option>
            <option value="loss">Loss</option>
          </select>
        </label>
        <label>
          Symbol Search
          <input
            type="text"
            name="symbolSearch"
            placeholder="Search symbol"
            value={filters.symbolSearch}
            onChange={handleFilterChange}
            style={inputStyle}
          />
        </label>
        <NeonButton type="submit" style={{ alignSelf: "flex-end", height: 40 }}>
          🔍 Search
        </NeonButton>
      </form>

      {loading && (
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner size={50} color={neonColors.neonBlue} />
        </div>
      )}

      {error && (
        <StatusBadge
          status="error"
          style={{ margin: "1rem auto", maxWidth: 400 }}
          className="glow-red"
        >
          {error}
        </StatusBadge>
      )}

      {/* Journal Table */}
      <div
        style={{
          overflowX: "auto",
          flexGrow: 1,
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
              {[
                "Trade (#ticket)",
                "Date",
                "Account",
                "Pair",
                "Buy/Sell",
                "Lot Size",
                "Entry",
                "TP",
                "SL",
                "Exit",
                "Comments",
                "Edit",
                "Delete",
                "History",
              ].map((header) => (
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
            {journalEntries.length > 0 ? (
              journalEntries.map((entry) => (
                <tr key={entry.ticket} style={{ textAlign: "center" }}>
                  <td>{entry.ticket}</td>
                  <td>{entry.date}</td>
                  <td>{entry.accountType.toUpperCase()}</td>
                  <td>{entry.pair}</td>
                  <td>{entry.side}</td>
                  <td>{entry.lotSize}</td>
                  <td>{entry.entry}</td>
                  <td>{entry.tp}</td>
                  <td>{entry.sl}</td>
                  <td>{entry.exit}</td>
                  <td
                    style={{
                      color:
                        entry.performance === "win"
                          ? neonColors.neonGreen
                          : entry.performance === "loss"
                          ? neonColors.neonRed
                          : neonColors.neonOrange,
                      maxWidth: 150,
                      whiteSpace: "normal",
                    }}
                    title={entry.comments}
                  >
                    {entry.comments}
                  </td>
                  <td>
                    <NeonButton
                      onClick={() => handleEdit(entry.ticket)}
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                    >
                      Edit
                    </NeonButton>
                  </td>
                  <td>
                    <NeonButton
                      onClick={() => handleDelete(entry.ticket)}
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                    >
                      Delete
                    </NeonButton>
                  </td>
                  <td>
                    <NeonButton
                      onClick={() => handleHistory(entry.ticket)}
                      style={{ padding: "0.2rem 0.4rem", fontSize: "0.8rem" }}
                    >
                      History
                    </NeonButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={14}
                  style={{ color: neonColors.neonOrange, padding: "1rem" }}
                >
                  No journal entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <NeonButton onClick={handleAddManual}>Add Manual Journal Entry</NeonButton>
      </div>

      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1rem",
          borderTop: `1px solid ${neonColors.neonBlue}`,
          fontSize: "0.9rem",
          color: neonColors.neonBlue,
          textAlign: "center",
        }}
      >
        FTSA AI - Powered by KELVIN SPECTER (MBURU G) © 2025
      </footer>
    </div>
  );
}

const inputStyle = {
  padding: "0.4rem 0.6rem",
  borderRadius: "6px",
  border: "2px solid #00FFFF",
  backgroundColor: "#111",
  color: "#00FFFF",
  fontFamily: "'Orbitron', sans-serif",
  outline: "none",
  minWidth: 120,
};
