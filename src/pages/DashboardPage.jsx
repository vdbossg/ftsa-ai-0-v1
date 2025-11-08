import React, { useEffect, useState, useContext } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from '/src/contexts/AuthContext.jsx';
import APIControl from "../brain/APIControl";
import "../styles/DashboardPage.css";


const DashboardPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Local state for live clock
  const [digitalClock, setDigitalClock] = useState(new Date());
  const [marketSession, setMarketSession] = useState([]);
  const [overallStatus, setOverallStatus] = useState("Closed");

  // Redirect unauthenticated users handled by router or higher context
  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await APIControl.fetchDashboardData();
        console.log("Dashboard Data:", response); // ✅ Debug line
        if (response.success) {
          setDashboardData(response.data);
          setError(null);
        } else {
          setError("Failed to load dashboard data.");
        }


        
      } catch (err) {
        setError("Failed to load dashboard data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [isAuthenticated]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDigitalClock(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update market sessions every second with weekday awareness
  useEffect(() => {
    const MARKET_SESSIONS = [
      { name: "London", open: 8, close: 16 },   // UTC
      { name: "New York", open: 13, close: 21 },
      { name: "Sydney", open: 22, close: 6 },   // overnight
      { name: "Asian", open: 0, close: 8 },
    ];

    function updateSessions() {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay(); // 0=Sunday, 5=Friday

      let anyOpen = false;

      const updated = MARKET_SESSIONS.map((s) => {
        let open = s.open;
        let close = s.close;
        if (close <= open) close += 24; // handle overnight session

        let currentHour = utcHour + (utcHour < open && close > 24 ? 24 : 0);

        const isOpen = currentHour >= open && currentHour < close;
        if (isOpen) anyOpen = true;

        let target = new Date(now);
        if (isOpen) {
          target.setUTCHours(close % 24, 0, 0, 0);
        } else {
          if (currentHour < open) {
            target.setUTCHours(open % 24, 0, 0, 0);
          } else {
            target.setUTCDate(target.getUTCDate() + 1);
            target.setUTCHours(open % 24, 0, 0, 0);
          }
        }

        const diff = target - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const countdown = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        return { name: s.name, isOpen, countdown };
      });

      // Overall market status
      let statusText = anyOpen ? "OPENED" : "CLOSED";

      // Handle weekend: if Sunday (0) -> closed till Monday
      if (utcDay === 0) statusText = "CLOSED (Opens Monday)";
      // Handle Friday after last session closes
      if (utcDay === 5 && !anyOpen) statusText = "CLOSED (Opens Monday)";

      setMarketSession(updated);
      setOverallStatus(statusText);
    }

    updateSessions();
    const interval = setInterval(updateSessions, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page" style={{ color: "#FF0000", fontFamily: "Orbitron" }}>
        <h2>Please login to access the dashboard.</h2>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) return <div className="error-msg neon-glow-border">{error}</div>;

  const { userInfo, trades, news, accounts, tradeAlerts, reminders } = dashboardData || {};

  return (
    <div
      className="dashboard-page"
      style={{
        backgroundColor: "#000000",
        color: "#00FFFF",
        fontFamily: "Orbitron, sans-serif",
        minHeight: "100vh",
        padding: "1rem 2rem",
        overflowY: "auto",
      }}
    >
      <header className="appbar" style={{ marginBottom: "1.5rem" }}>
        <h1>FTSA AI</h1>
        <p style={{ fontSize: "1rem", color: "#00FFFF", cursor: "pointer" }}>
          [New App adjust. Tap for more info]
        </p>
      </header>

      {/* Digital Clock & Market Session */}
      <section className="top-info neon-glow-border" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div className="digital-clock" style={{ fontSize: "1.5rem", color: "#00FFFF" }}>
            {digitalClock.toLocaleTimeString()}
          </div>
          <div
            className="market-session"
            style={{ fontSize: "1rem", color: "#00FF00", display: "flex", flexDirection: "column" }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
              MARKET SESSION: {overallStatus}
            </div>
            {marketSession && marketSession.map((s) => (
              <div key={s.name} style={{ marginBottom: "0.25rem" }}>
                {s.name}: {s.isOpen ? "Open" : "Closed"} <br />
                <span style={{ fontSize: "0.9rem", color: "#FFA500" }}>
                  {s.isOpen ? "Closes in " : "Opens in "} {s.countdown}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Market Strength Table */}
<section className="market-strength neon-glow-border" style={{ marginBottom: "2rem", padding: "1rem" }}>
  <h2 style={{ color: "#00FFFF" }}>Market Strength</h2>
  <table style={{
    width: "100%",
    borderCollapse: "collapse",
    color: "#00FFFF",
    fontFamily: "Orbitron",
  }}>
    <thead>
      <tr>
        {["Pair", "Strength", "Trend"].map((header) => (
          <th key={header} style={{
            borderBottom: "2px solid #00FFFF",
            padding: "0.5rem",
            textAlign: "left",
          }}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {dashboardData?.marketStrength?.length > 0 ? (
  dashboardData.marketStrength.map(({ symbol, strength, bias }, idx) => (
    <tr key={idx} style={{
      borderBottom: "1px solid #00FFFF",
      backgroundColor: idx % 2 === 0 ? "#001111" : "#000000",
    }}>
      <td style={{ padding: "0.5rem" }}>{symbol}</td> {/* changed pair → symbol */}
      <td style={{ padding: "0.5rem" }}>{strength}</td>
      <td style={{ padding: "0.5rem", color: bias === "Bullish" ? "#00FF00" : bias === "Bearish" ? "#FF0000" : "#AAAAAA" }}>
        {bias || "Unknown"} {/* changed trend → bias and handle Unknown */}
      </td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>No market strength data.</td>
  </tr>
)}

    </tbody>
  </table>
</section>
      {/* Alerts & Notifications */}
      <section className="alerts-notifications neon-glow-border" style={{ marginBottom: "2rem", padding: "1rem" }}>
        <h2 style={{ color: "#FFA500" }}>Alerts & Notifications</h2>
        <ul>
          {tradeAlerts && tradeAlerts.length > 0 ? (
            tradeAlerts.map((alert, idx) => (
              <li
                key={idx}
                style={{
                  marginBottom: "0.5rem",
                  color: alert.type === "error" ? "#FF0000" : alert.type === "warning" ? "#FFA500" : "#00FF00",
                  fontWeight: "bold",
                  textShadow: "0 0 8px currentColor",
                }}
              >
                {alert.message}
              </li>
            ))
          ) : (
            <li>No alerts at this time.</li>
          )}
        </ul>
      </section>

      {/* Adds/Reminders */}
      <section className="adds-reminders neon-glow-border" style={{ marginBottom: "2rem", padding: "1rem" }}>
        <h2 style={{ color: "#00FFFF" }}>Adds / Reminders</h2>
        <ul>
          {reminders && reminders.length > 0 ? (
            reminders.map((reminder, idx) => <li key={idx} style={{ marginBottom: "0.5rem" }}>{reminder}</li>)
          ) : (
            <li>No reminders.</li>
          )}
        </ul>
      </section>
    
      <footer style={{ textAlign: "center", padding: "1rem", color: "#00FFFF", borderTop: "1px solid #00FFFF" }}>
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
    </div>
  );
};

export default DashboardPage;
