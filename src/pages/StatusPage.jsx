import React, { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import NeonButton from "../components/NeonButton";
import Modal from "../components/Modal"; // We'll use a reusable Modal component
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";

const StatusPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const [mtLogin, setMtLogin] = useState({ Basic: "", Plus: "", Unlimited: "" });
  const [paymentMethod, setPaymentMethod] = useState(""); // M-PESA/PayPal/Visa/Bank Transfer
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [eaLoading, setEaLoading] = useState(false);
  const [eaError, setEaError] = useState(null);

  const [timeLeft, setTimeLeft] = useState(null);

  // Fetch subscription status
  useEffect(() => {
    if (!isAuthenticated) return;

    APIControl.fetchStatusData()
      .then((response) => {
        if (response.success) {
          setStatusData(response.data);
          setError(null);
          if (response.data.subscription?.expiryDate) {
            initializeCountdown(response.data.subscription.expiryDate);
          }
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

  // Countdown timer
  const initializeCountdown = (expiryDate) => {
    const calculateTimeLeft = () => {
      const difference = new Date(expiryDate) - new Date();
      if (difference <= 0) return null;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  };

  // Open subscription modal
  const openSubscriptionModal = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  // Handle subscription submission
  const handleSubscribe = async () => {
    if (!mtLogin[selectedPlan]) {
      alert("Please enter your MT4/5 Login ID.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const amountMap = { Basic: 25, Plus: 130, Unlimited: 499 };
      const resp = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: selectedPlan,
          mtLogin: mtLogin[selectedPlan],
          paymentMethod,
          amount: amountMap[selectedPlan],
        }),
      });
      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Subscription failed");
      }

      setStatusData((prev) => ({
        ...prev,
        subscription: {
          plan: selectedPlan,
          expiryDate: data.expiryDate,
          licenseKey: data.licenseKey,
          mtLogin: mtLogin[selectedPlan],
        },
      }));

      initializeCountdown(data.expiryDate);
      setModalOpen(false);
      alert(`Subscription successful for ${selectedPlan} plan!`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Subscription failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Handle EA download
  const handleDownloadEA = async (platform) => {
    setEaLoading(true);
    setEaError(null);

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`/api/ea/download?platform=${platform}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
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

  if (!isAuthenticated)
    return <div style={styles.notAuth}>Please log in to view system status.</div>;

  if (loading) return <LoadingSpinner />;
  if (error) return <StatusBadge status="error" label={error} />;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>FTSA AI System Status</h1>
        <StatusBadge
          status={statusData.subscription ? "online" : "offline"}
          label={
            statusData.subscription
              ? `Your ${statusData.subscription.plan} Subscription is ACTIVE`
              : "No Active Subscription"
          }
        />
        {statusData.subscription && timeLeft && (
          <p style={{ color: neonGreen }}>
            Expires in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        )}
      </header>

      {/* === Subscription Plans === */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Subscription Plans</h2>
        {["Basic", "Plus", "Unlimited"].map((plan) => (
          <div key={plan} style={styles.planCard}>
            <h3>
              {plan}{" "}
              {plan === "Basic" ? "(1 month)" : plan === "Plus" ? "(12 months)" : "(Lifetime)"}
            </h3>
            <p>
              ${plan === "Basic" ? 25 : plan === "Plus" ? 130 : 499}{" "}
              {plan !== "Unlimited" ? plan === "Basic" ? "/month" : "/year" : "/one-time"}
            </p>
            {!statusData.subscription && (
              <NeonButton onClick={() => openSubscriptionModal(plan)}>Subscribe Now</NeonButton>
            )}
            {statusData.subscription && statusData.subscription.plan === plan && (
              <span style={{ color: neonGreen }}>
                License active until:{" "}
                {new Date(statusData.subscription.expiryDate).toLocaleDateString()}
              </span>
            )}
          </div>
        ))}
      </section>

      {/* === EA Download === */}
      {statusData.subscription && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>EA Download</h2>
          <p style={{ marginBottom: "1rem", color: "#00FF00" }}>
            Download your personalized EA for MT4 or MT5:
          </p>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <NeonButton onClick={() => handleDownloadEA("mt4")}>Download EA for MT4</NeonButton>
            <NeonButton onClick={() => handleDownloadEA("mt5")}>Download EA for MT5</NeonButton>
            {eaLoading && <span style={{ color: "#00FFFF" }}>Generating EA...</span>}
            {eaError && <span style={{ color: "#FF0000" }}>{eaError}</span>}
          </div>
        </section>
      )}

      {/* === Subscription Modal === */}
      {modalOpen && (
        <Modal title={`Subscribe to ${selectedPlan}`} onClose={() => setModalOpen(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input
              type="text"
              placeholder="Enter your MT4/5 Login ID"
              value={mtLogin[selectedPlan]}
              onChange={(e) => setMtLogin({ ...mtLogin, [selectedPlan]: e.target.value })}
              style={styles.input}
            />
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={styles.input}
            >
              <option value="">Select Payment Method</option>
              <option value="mpesa">M-PESA</option>
              <option value="paypal">PayPal</option>
              <option value="visa">Visa</option>
              <option value="bank">Bank Transfer</option>
            </select>
            <button onClick={handleSubscribe} disabled={processing} style={styles.modalButton}>
              {processing ? "Processing..." : `Pay $${selectedPlan === "Basic" ? 25 : selectedPlan === "Plus" ? 130 : 499}`}
            </button>
          </div>
        </Modal>
      )}

      <footer style={styles.footer}>
        <p style={styles.footerText}>FTSA AI - Powered by KELVIN SPECTER (MBURU G) ©️ 2025</p>
      </footer>
    </div>
  );
};

// Neon Colors
const neonBlue = "#00FFFF";
const neonGreen = "#00FF00";
const neonRed = "#FF0000";

// Styles
const styles = {
  page: {
    backgroundColor: "#000000",
    color: neonBlue,
    fontFamily: "'Orbitron', sans-serif",
    height: "100%",
    overflowY: "auto",
    padding: "1rem",
  },
  header: { borderBottom: `2px solid ${neonBlue}`, paddingBottom: "1rem", marginBottom: "1rem" },
  title: { fontSize: "2rem", margin: 0, textShadow: `0 0 10px ${neonBlue}` },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.5rem", marginBottom: "1rem", color: neonBlue, textShadow: `0 0 10px ${neonBlue}` },
  planCard: {
    backgroundColor: "#111111",
    border: `2px solid ${neonBlue}`,
    borderRadius: "10px",
    padding: "1rem",
    marginBottom: "1rem",
    boxShadow: `0 0 10px ${neonBlue}`,
  },
  input: {
    padding: "0.5rem",
    borderRadius: "5px",
    border: `1px solid ${neonBlue}`,
    backgroundColor: "#000000",
    color: neonBlue,
    width: "100%",
  },
  modalButton: {
    padding: "0.5rem",
    borderRadius: "5px",
    border: "none",
    backgroundColor: neonBlue,
    color: "#000",
    fontWeight: "bold",
    cursor: "pointer",
  },
  footer: { borderTop: `2px solid ${neonBlue}`, paddingTop: "1rem", textAlign: "center" },
  footerText: { fontSize: "0.9rem", color: neonGreen },
  notAuth: { color: neonRed, padding: "2rem", fontFamily: "'Orbitron', sans-serif" },
};

export default StatusPage;
