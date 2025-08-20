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
  const [mtLogin, setMtLogin] = useState({
    Basic: "",
    Plus: "",
    Unlimited: "",
  });
  const [mpesaNumber, setMpesaNumber] = useState(""); // User enters MPESA number
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

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
      const token = localStorage.getItem("token");
      const resp = await fetch(`/api/ea/download?platform=${platform}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) throw new Error("Failed to generate EA");
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

  const handleSubscribe = async (plan) => {
    const loginID = mtLogin[plan];
    if (!loginID) {
      alert("Please enter your MT4/5 Login ID.");
      return;
    }

    setEaLoading(true);
    setEaError(null);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`/api/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, mtLogin: loginID }),
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
      }

      // Update local statusData to reflect subscription
      setStatusData((prev) => ({
        ...prev,
        subscriptionActive: true,
        currentPlan: plan,
        nextBillingDate: data.nextBillingDate,
      }));

      alert(`Subscription successful for ${plan} plan!`);
    } catch (err) {
      console.error(err);
      setEaError(err.message || "Subscription failed. Try again.");
    } finally {
      setEaLoading(false);
    }
  };

  const handleMpesaPayment = async (plan) => {
    const loginID = mtLogin[plan];
    if (!loginID) {
      alert("Please enter your MT4/5 Login ID.");
      return;
    }
    if (!mpesaNumber) {
      alert("Please enter your M-PESA number.");
      return;
    }

    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const token = localStorage.getItem("token");

      // Convert USD to KES
      let amountUSD = 0;
      if (plan === "Basic") amountUSD = 20;
      if (plan === "Plus") amountUSD = 130;
      if (plan === "Unlimited") amountUSD = 499;
      const amountKES = amountUSD * 130; // 1 USD = 130 KES

      const resp = await fetch(`/api/payment/mpesa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, mtLogin: loginID, mpesaNumber, amountKES }),
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Payment failed");
      }

      alert(`M-PESA payment request sent. Enter your PIN on your phone to complete KES ${amountKES} payment.`);

      setStatusData((prev) => ({
        ...prev,
        subscriptionActive: true,
        currentPlan: plan,
        nextBillingDate: data.nextBillingDate,
      }));
    } catch (err) {
      console.error(err);
      setPaymentError(err.message || "M-PESA payment failed. Try again.");
    } finally {
      setPaymentLoading(false);
    }
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
        {/* Plan cards remain unchanged */}
        {/* ... all other JSX untouched ... */}
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
  title: { fontSize: "2rem", margin: 0 },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.5rem", marginBottom: "0.5rem", color: neonGreen },
  billingInfo: { fontSize: "1.1rem", color: neonGreen },
  transactionTable: { width: "100%", borderCollapse: "collapse" },
  transactionTableThTd: { border: `1px solid ${neonBlue}`, padding: "0.5rem" },
  footer: { borderTop: `2px solid ${neonBlue}`, paddingTop: "1rem", marginTop: "2rem", textAlign: "center" },
  footerText: { color: neonOrange },
  notAuth: { color: neonRed, fontSize: "1.2rem", textAlign: "center", marginTop: "2rem" },
};

export default StatusPage;
