// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    Promise.all([
  APIControl.fetchUserInfo(),
  fetch("/api/news/today").then(res => res.json())
])
  .then(([userRes, newsRes]) => {
    if (!isMounted) return;

    if (userRes.success) {
      const userData = { ...userRes.data, marketNews: newsRes || [] };
      setData(userData);
    } else {
      setError(userRes.error || "Failed to load data");
    }
    setLoading(false);
  })
  .catch(err => {
    if (isMounted) {
      setError(err?.message || "Failed to load data");
      setLoading(false);
    }
  }); 

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={styles.notAuth}>
        Please log in to view the homepage.
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <StatusBadge status="error" label={error} />;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>
          Welcome back, {user?.name || user?.email || "—"}
        </h1>
        <StatusBadge status="online" label="FTSA AI Brain Online" />
      </header>

      {/* Account Overview */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Account Overview</h2>
        <div style={styles.card}>
          <p>
            Balance:{" "}
            {data?.accountBalance != null ? `$${data.accountBalance}` : "—"}
          </p>
          <p>
            Open Positions:{" "}
            {data?.openPositions != null ? data.openPositions : "—"}
          </p>
          <p>
            Profit/Loss:{" "}
            {data?.profitLoss != null ? `$${data.profitLoss}` : "—"}
          </p>
          <NeonButton>Go to Dashboard</NeonButton>
        </div>
      </section>

      {/* Prop Firm Accounts */}
      {data?.propFirmAccounts && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Prop Firm Accounts</h2>
          <div style={styles.card}>
            {data.propFirmAccounts.length > 0 ? (
              data.propFirmAccounts.map((acc, idx) => (
                <div key={idx} style={{ marginBottom: "0.5rem" }}>
                  <strong>{acc.broker}</strong> ({acc.type?.toUpperCase()}) –{" "}
                  Balance: ${acc.balance}
                </div>
              ))
            ) : (
              <p>No prop firm accounts connected.</p>
            )}
          </div>
        </section>
      )}
      {/* Market News */}
<section style={styles.section}>
  <h2 style={styles.sectionTitle}>Global Market News</h2>
  <div style={styles.card}>
    {data?.marketNews?.length ? (
      <table style={styles.newsTable}>
        <thead>
          <tr>
            {["Date","Time","Currency","Event","Impact","Actual","Previous","Forecast"].map((h, idx) => (
              <th key={idx} style={styles.newsTableThTd}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.marketNews.map((news, idx) => (
            <tr key={idx}>
              <td style={styles.newsTableThTd}>{news.date}</td>
              <td style={styles.newsTableThTd}>{news.time}</td>
              <td style={styles.newsTableThTd}>{news.currency}</td>
              <td style={styles.newsTableThTd}>{news.event}</td>
              <td style={styles.newsTableThTd}>{news.impact}</td>
              <td style={styles.newsTableThTd}>{news.actual ?? "—"}</td>
              <td style={styles.newsTableThTd}>{news.previous ?? "—"}</td>
              <td style={styles.newsTableThTd}>{news.forecast ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p style={styles.newsItem}>No market news available</p>
    )}
  </div>
</section>
 <footer style={styles.footer}>
        <p style={styles.footerText}>
          FTSA AI - Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
        </p>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#000000",
    color: "#00FFFF",
    fontFamily: "'Orbitron', sans-serif",
    height: "100%",
    overflowY: "auto",
    padding: "1rem",
  },
  header: {
    borderBottom: "2px solid #00FFFF",
    paddingBottom: "1rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    color: "#00FFFF",
    textShadow: "0 0 10px #00FFFF",
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
  },
  card: {
    backgroundColor: "#111111",
    border: "2px solid #00FFFF",
    borderRadius: "10px",
    padding: "1rem",
    boxShadow: "0 0 10px #00FFFF",
  },
  newsItem: {
    marginBottom: "0.5rem",
  },
  footer: {
    borderTop: "2px solid #00FFFF",
    paddingTop: "1rem",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.9rem",
    color: "#00FF00",
  },
  notAuth: {
    color: "#FF0000",
    padding: "2rem",
    fontFamily: "'Orbitron', sans-serif",
  },
  newsTable: {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "1rem",
  color: "#00FFFF",
  fontSize: "0.9rem",
},
newsTableThTd: {
  border: "1px solid #00FFFF",
  padding: "0.5rem",
  textAlign: "center",
},

};

export default HomePage;
