// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from '/src/brain/APIControl.js';


const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return; // Optionally redirect handled in App.jsx routing

    APIControl.fetchUserInfo()

      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load data");
        setLoading(false);
      });
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div style={styles.notAuth}>Please log in to view the homepage.</div>;
  }

  if (loading) return <LoadingSpinner />;

  if (error) return <StatusBadge status="error" label={error} />;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Welcome back, {user?.name || "Trader"}</h1>
        <StatusBadge status="online" label="FTSA AI Brain Online" />
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Account Overview</h2>
        <div style={styles.card}>
          <p>Balance: ${data?.accountBalance ?? "0.00"}</p>
          <p>Open Positions: {data?.openPositions ?? 0}</p>
          <p>Profit/Loss: ${data?.profitLoss ?? "0.00"}</p>
          <NeonButton>Go to Dashboard</NeonButton>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Global Market News</h2>
        <div style={styles.card}>
          {/* Simple news items */}
          {(data?.marketNews ?? []).map((news, idx) => (
            <p key={idx} style={styles.newsItem}>
              {news}
            </p>
          ))}
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
};

export default HomePage;
