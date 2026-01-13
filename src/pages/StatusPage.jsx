import React, { useEffect, useState } from "react";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import NeonButton from "../components/NeonButton";
import Modal from "../components/Modal";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";

const PLAN_CONFIG = {
  Basic: {
    price: 60,
    paymentLink: "https://paystack.shop/pay/6h5y7ngolw", // Paystack page for Basic
  },
  Plus: {
    price: 630,
    paymentLink: "https://paystack.shop/pay/pgbeplac6u", // Paystack page for Plus
  },
  Unlimited: {
    price: 2400,
    paymentLink: "https://paystack.com/buy/ftsa-unlimited-vfczvf", // One-time Payment Link
  },
};



const StatusPage = () => {
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [broker, setBroker] = useState("");
  const [mtLogin, setMtLogin] = useState("");
  const [timeLeft, setTimeLeft] = useState(null);

  // ---------------- FETCH STATUS ----------------
  useEffect(() => {
    if (!isAuthenticated) return;

    APIControl.fetchStatusData()
      .then((res) => {
        if (res.success) {
          setStatusData(res.data);
          if (
  res.data.subscription?.status === "active" &&
  res.data.subscription.expiryDate
) {
  startCountdown(res.data.subscription.expiryDate);
}
        } else {
          setError(res.error || "Failed to load status");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load status");
        setLoading(false);
      });
  }, [isAuthenticated]);

  // ---------------- COUNTDOWN ----------------
const startCountdown = (expiry) => {
  const interval = setInterval(() => {
    const diff = new Date(expiry) - new Date();
    if (diff <= 0) {
      setTimeLeft(null);
      clearInterval(interval);
      return;
    }

    setTimeLeft({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / 1000 / 60) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    });
  }, 1000);
};

  // ---------------- SELAR REDIRECT ----------------
  const redirectToPaystack = () => {
  if (!broker || !mtLogin) {
    alert("Broker and MT Login are required");
    return;
  }

  const plan = PLAN_CONFIG[selectedPlan];
  if (!plan.paymentLink) {
    alert("Invalid plan selected");
    return;
  }

  const url = `${plan.paymentLink}?metadata[user_id]=${user.id}&metadata[plan]=${selectedPlan}&metadata[broker]=${encodeURIComponent(broker)}&metadata[mt_login]=${encodeURIComponent(mtLogin)}`;

  window.location.href = url;
};


  if (!isAuthenticated) return <div style={styles.notAuth}>Please log in</div>;
  if (loading) return <LoadingSpinner />;
  if (error) return <StatusBadge status="error" label={error} />;

  const hasActive =
  statusData?.subscription?.status === "active" &&
  new Date(statusData.subscription.expiryDate) > new Date();

const isPending =
  statusData?.subscription?.status === "pending";

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>FTSA AI Subscription Status</h1>
        <StatusBadge
  status={hasActive ? "online" : isPending ? "pending" : "offline"}
  label={
    hasActive
      ? `${statusData.subscription.plan} Subscription ACTIVE`
      : isPending
      ? `${statusData.subscription.plan} Subscription PENDING`
      : "No Active Subscription"
  }
/>

        {hasActive && timeLeft && (
          <p style={{ color: neonGreen }}>
            Expires in {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
          </p>
        )}
      </header>

      {/* -------- PLANS -------- */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Subscription Plans</h2>
        {Object.keys(PLAN_CONFIG).map((plan) => (
          <div key={plan} style={styles.planCard}>
            <h3>{plan}</h3>
            <p>${PLAN_CONFIG[plan].price}</p>

            {!hasActive && (
              <NeonButton
  onClick={() => {
    setSelectedPlan(plan);
    setModalOpen(true);
  }}
>
  Pay via Paystack
</NeonButton>

            )}

            {hasActive && statusData.subscription.plan === plan && (
  <span style={{ color: neonGreen }}>
    {plan === "Unlimited"
      ? "Lifetime Access"
      : `Active until ${new Date(statusData.subscription.expiryDate).toLocaleDateString()}`}
  </span>
)}

          </div>
        ))}
      </section>

      {/* -------- MODAL -------- */}
      {modalOpen && (
        <Modal title={`Subscribe: ${selectedPlan}`} onClose={() => setModalOpen(false)}>
          <input
            style={styles.input}
            placeholder="Broker name"
            value={broker}
            onChange={(e) => setBroker(e.target.value)}
          />
          <input
            style={styles.input}
            placeholder="MT4/MT5 Login ID"
            value={mtLogin}
            onChange={(e) => setMtLogin(e.target.value)}
          />
          <p style={{ color: neonGreen }}>Payment Method: Selar Secure Checkout</p>

          <button
  style={styles.modalButton}
  onClick={redirectToPaystack}
  disabled={!broker || !mtLogin}
>
  Pay ${PLAN_CONFIG[selectedPlan].price} via Paystack
</button>

        </Modal>
      )}

      <footer style={styles.footer}>
        <p style={styles.footerText}>FTSA AI © 2025</p>
      </footer>
    </div>
  );
};

// -------- STYLES --------
const neonBlue = "#00FFFF";
const neonGreen = "#00FF00";
const neonRed = "#FF0000";

const styles = {
  page: { backgroundColor: "#000", color: neonBlue, padding: "1rem" },
  header: { borderBottom: `2px solid ${neonBlue}`, marginBottom: "1rem" },
  title: { fontSize: "2rem", textShadow: `0 0 10px ${neonBlue}` },
  section: { marginBottom: "2rem" },
  sectionTitle: { fontSize: "1.5rem" },
  planCard: { border: `2px solid ${neonBlue}`, padding: "1rem", marginBottom: "1rem" },
  input: { width: "100%", marginBottom: "1rem", padding: "0.5rem" },
  modalButton: { background: neonBlue, color: "#000", padding: "0.6rem", border: "none", cursor: "pointer" },
  footer: { textAlign: "center", borderTop: `2px solid ${neonBlue}` },
  footerText: { color: neonGreen },
  notAuth: { color: neonRed, padding: "2rem" },
};

export default StatusPage;