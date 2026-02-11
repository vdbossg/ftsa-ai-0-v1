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
const [accountTotals, setAccountTotals] = useState({
  balance: 0,
  equity: 0,
  freeMargin: 0,
  profitLoss: 0,
});

  const impactColor = (impact) => {
    switch (impact) {
      case "🟨":
        return "yellow";
      case "🟧":
        return "orange";
      case "🟥":
        return "red";
      case "⬛":
        return "gray";
      default:
        return "#00FFFF"; // fallback neon cyan
    }
  };

  // Initial load (user info + news)
useEffect(() => {
  let isMounted = true;

  // Immediately stop loading if user is not authenticated
  if (!isAuthenticated) {
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  Promise.all([APIControl.fetchUserInfo(), APIControl.fetchNews()])
    .then(([userRes, newsRes]) => {
      if (!isMounted) return;

      if (userRes.success && newsRes.success) {
        const userData = { ...userRes.data, marketNews: newsRes.data || [] };
        setData(userData);
      } else {
        setError(userRes.error || newsRes.error || "Failed to load data");
      }

      setLoading(false); // ✅ ensure this always runs after fetch
    })
    .catch((err) => {
      if (isMounted) {
        setError(err?.message || "Failed to load data");
        setLoading(false); // ✅ ensure loading stops on error
      }
    });

  return () => {
    isMounted = false;
  };
}, [isAuthenticated]);

useEffect(() => {
  if (!isAuthenticated) return;

  const fetchAccounts = async () => {
    try {
      const [mtRes, propRes] = await Promise.all([
        fetch("http://localhost:5000/api/mtaccounts"),
        fetch("http://localhost:5000/api/propaccounts")
      ]);
      const mtData = await mtRes.json();
      const propData = await propRes.json();

      let balance = 0, equity = 0, freeMargin = 0, profitLoss = 0;

      if (mtData.success && Array.isArray(mtData.accounts)) {
        mtData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            const trades = acc.trades?.data || [];
            balance += summary.balance || 0;
            equity += summary.equity || 0;
            freeMargin += summary.freeMargin || 0;
            profitLoss += trades.reduce((sum, t) => sum + (t.profit || 0), 0);
          }
        });
      }

      if (propData.success && Array.isArray(propData.accounts)) {
        propData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            const trades = acc.account.trades?.data || [];
            balance += summary.balance || 0;
            equity += summary.equity || 0;
            freeMargin += summary.freeMargin || 0;
            profitLoss += trades.reduce((sum, t) => sum + (t.profit || 0), 0);
          }
        });
      }

      setAccountTotals({ balance, equity, freeMargin, profitLoss });
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  fetchAccounts(); // run immediately

  const interval = setInterval(fetchAccounts, 1000); // live update every second
  return () => clearInterval(interval); // cleanup
}, [isAuthenticated]);

  // Auto-refresh news every 1 min
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchNews = () => {
      APIControl.fetchNews()
        .then((res) => {
          if (res.success) {
            setData((prev) => ({ ...prev, marketNews: res.data || [] }));
          }
        })
        .catch((err) => console.error("Failed to refresh news:", err));
    };

    fetchNews(); // run immediately
    const interval = setInterval(fetchNews, 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div style={styles.notAuth}>Please log in to view the homepage.</div>;
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
    {loading ? (
      <LoadingSpinner size={32} color="#00FFFF" />
    ) : (
      (() => {
        const isRunning = accountTotals.balance !== accountTotals.equity || accountTotals.profitLoss !== 0;
        const equityColor =
          accountTotals.equity > accountTotals.balance
            ? "#00FF00" // green
            : accountTotals.equity < accountTotals.balance
            ? "#FF0000" // red
            : "#00FFFF"; // default neon cyan

        return (
          <>
            <p>Balance: ${accountTotals.balance.toFixed(2)}</p>
            <p style={{ color: equityColor }}>Equity: ${accountTotals.equity.toFixed(2)}</p>
            <p>Free Margin: ${accountTotals.freeMargin.toFixed(2)}</p>
            <p style={{ color: equityColor }}>P/L: ${isRunning ? accountTotals.profitLoss.toFixed(2) : "0.00"}</p>
          </>
        );
      })()
    )}
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
            <div style={styles.newsTableWrapper}>
              <table style={styles.newsTable}>
                <thead>
                  <tr>
                    {[
                      "Date",
                      "Time",
                      "Currency",
                      "Event",
                      "Impact",
                      "Actual",
                      "Previous",
                      "Forecast",
                    ].map((h, idx) => (
                      <th key={idx} style={styles.newsTableThTd}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.marketNews.map((news, idx) => (
                    <tr key={idx}>
                      <td style={styles.newsTableThTd}>
                        {news.date?.replace("\n", " ") || "—"}
                      </td>
                      <td style={styles.newsTableThTd}>{news.time}</td>
                      <td style={styles.newsTableThTd}>{news.currency}</td>
                      <td style={styles.newsTableThTd}>{news.event}</td>
                      <td
                        style={{
                          ...styles.newsTableThTd,
                          color: impactColor(news.impact),
                        }}
                      >
                        {news.impact}{" "}
                        <span style={{ fontSize: "0.75rem", color: "#00FFFF" }}>
                          {news.impact === "🟥" && "High"}
                          {news.impact === "🟧" && "Medium"}
                          {news.impact === "🟨" && "Low"}
                          {news.impact === "⬛" && "Holiday"}
                        </span>
                      </td>
                      <td style={styles.newsTableThTd}>
                        {news.actual ?? "—"}
                      </td>
                      <td style={styles.newsTableThTd}>
                        {news.previous ?? "—"}
                      </td>
                      <td style={styles.newsTableThTd}>
                        {news.forecast ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
  newsTableWrapper: {
    maxHeight: "400px",
    overflowY: "auto",
    border: "1px solid #00FFFF",
    borderRadius: "6px",
    marginTop: "1rem",
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
