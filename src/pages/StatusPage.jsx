import React, { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import NeonButton from "../components/NeonButton";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";

const StatusPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);
  const [eaLoading, setEaLoading] = useState(false);
const [eaError, setEaError] = useState(null);


  useEffect(() => {
    if (!isAuthenticated) return;

    APIControl.fetchStatusData()
      .then((response) => {
        if (response.success) {
          setStatusData(response.data);
          setError(null);
        } else {
          setError(response.error || "Failed to load system status");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load system status");
        setLoading(false);
      });
  }, [isAuthenticated]);
const handleDownloadEA = async (platform) => {
  setEaLoading(true);
setEaError(null);
  
  try {
    // Fetch personalized EA from backend with license & account injection
    const token = localStorage.getItem("token");
    const resp = await fetch(`/api/ea/download?platform=${platform}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!resp.ok) throw new Error("Failed to generate EA");
    // Receive EA as blob (compiled EX4/5)
    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FTSA_EA_${platform.toUpperCase()}.ex${platform === "mt4" ? "4" : "5"}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error(err);
    setEaError("Failed to download EA. Try again later.");
  } finally {
    setEaLoading(false);
  }
};
const handleSubscribe = (plan) => {
  alert(`Subscribe clicked for plan: ${plan}`);
  // Later you can replace this alert with real subscription logic
};


  if (!isAuthenticated) {
    return (
      <div style={styles.notAuth}>
        Please log in to view system status.
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) return <StatusBadge status="error" label={error} />;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>FTSA AI System Status</h1>
        <StatusBadge
          status={statusData.subscriptionActive ? "online" : "offline"}
          label={
            statusData.subscriptionActive
              ? "Your Subscription is ACTIVE"
              : "No Active Subscription"
          }
        />
      </header>

      {/* === EA Download Section === */}
      {statusData.subscriptionActive && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>EA Download</h2>
          <p style={{ marginBottom: "1rem", color: "#00FF00" }}>
            Download your personalized EA for MT4 or MT5 below:
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
  <NeonButton onClick={() => handleDownloadEA("mt4")}>
    Download EA for MT4
  </NeonButton>
  <NeonButton onClick={() => handleDownloadEA("mt5")}>
    Download EA for MT5
  </NeonButton>
  {eaLoading && <span style={{ color: "#00FFFF" }}>Generating EA...</span>}
{eaError && <span style={{ color: "#FF0000" }}>{eaError}</span>}
</div>

        </section>
      )}

      {/* === Subscription Plans === */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Subscription Plans</h2>
        <div style={styles.planCard}>
          <h3>Basic (Monthly)</h3>
          <p>$20/month</p>
          <NeonButton onClick={() => handleSubscribe("Basic")}>Subscribe Now</NeonButton>
        </div>
        <div style={styles.planCard}>
          <h3>Plus (12 months)</h3>
          <p>$130/year</p>
          <NeonButton onClick={() => handleSubscribe("Plus")}>Subscribe Now</NeonButton>
        </div>
        <div style={styles.planCard}>
          <h3>Unlimited</h3>
          <p>$499/one-time</p>
          <NeonButton onClick={() => handleSubscribe("Unlimited")}>Subscribe Now</NeonButton>
        </div>
      </section>

      {/* === Billing Info === */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Billing Information</h2>
        <p style={styles.billingInfo}>
          Next billing date: {statusData.nextBillingDate ? new Date(statusData.nextBillingDate).toLocaleDateString() : "N/A"}
        </p>
      </section>

      {/* === Transaction History === */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Transaction History</h2>
        <table style={styles.transactionTable}>
          <thead>
  <tr>
    <th style={styles.transactionTableThTd}>Date</th>
    <th style={styles.transactionTableThTd}>Plan</th>
    <th style={styles.transactionTableThTd}>Amount</th>
    <th style={styles.transactionTableThTd}>Status</th>
  </tr>
</thead>
<tbody>
  {(statusData.transactions || []).map((tx, i) => (
    <tr key={i}>
      <td style={styles.transactionTableThTd}>{tx.date}</td>
      <td style={styles.transactionTableThTd}>{tx.plan}</td>
      <td style={styles.transactionTableThTd}>${tx.amount}</td>
      <td style={styles.transactionTableThTd}>{tx.paid ? "Paid" : "Pending"}</td>
    </tr>
  ))}
              {statusData.transactions?.length === 0 && (
              <tr>
                <td colSpan="4" style={{ color: "#FFA500" }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          FTSA AI - Powered by KELVIN SPECTER (MBURU G) ©️ 2025
        </p>
      </footer>
    </div>
  );
};

const neonBlue = "#00FFFF";
const neonGreen = "#00FF00";
const neonOrange = "#FFA500";
const neonRed = "#FF0000";

const styles = {
  page: {
    backgroundColor: "#000000",
    color: neonBlue,
    fontFamily: "'Orbitron', sans-serif",
    height: "100%",
    overflowY: "auto",
    padding: "1rem",
  },
  header: {
    borderBottom: `2px solid ${neonBlue}`,
    paddingBottom: "1rem",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "2rem",
    margin: 0,
    textShadow: `0 0 10px ${neonBlue}`,
  },
  section: {
    marginBottom: "2rem",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: neonBlue,
    textShadow: `0 0 10px ${neonBlue}`,
  },
  planCard: {
    backgroundColor: "#111111",
    border: `2px solid ${neonBlue}`,
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: `0 0 10px ${neonBlue}`,
  },
  billingInfo: {
    fontSize: "1.2rem",
    color: neonGreen,
    textShadow: `0 0 8px ${neonGreen}`,
  },
  transactionTable: {
    width: "100%",
    borderCollapse: "collapse",
    color: neonBlue,
    fontSize: "1rem",
  },
  transactionTableThTd: {
    border: `1px solid ${neonBlue}`,
    padding: "0.5rem",
  },
  footer: {
    borderTop: `2px solid ${neonBlue}`,
    paddingTop: "1rem",
    textAlign: "center",
  },
  footerText: {
    fontSize: "0.9rem",
    color: neonGreen,
  },
  notAuth: {
    color: neonRed,
    padding: "2rem",
    fontFamily: "'Orbitron', sans-serif",
  },
};

export default StatusPage;
