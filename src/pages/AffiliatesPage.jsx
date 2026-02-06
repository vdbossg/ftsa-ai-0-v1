// src/pages/AffiliatesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import NeonButton from "../components/NeonButton";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import currentUserData from "../data/currentWatcherUser.json"; // add this import at the top

const neon = {
  blue: "#00FFFF",
  green: "#00FF00",
  red: "#FF3B30",
  amber: "#FFC107",
};

const pad3 = (n) => String(Number(n || 0)).padStart(3, "0");

export default function AffiliatesPage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [affiliate, setAffiliate] = useState(null);
  const [stats, setStats] = useState(null);

  // modals
  const [showRegister, setShowRegister] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  // registration form
  const [regForm, setRegForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "",
    idType: "id",
    idNumber: "",
    username: "",
    docFront: null,
    docBack: null,
    agree: false,
  });

  // withdrawal form
  const [method, setMethod] = useState("");
  const [payout, setPayout] = useState({
    mpesaNumber: "",
    paypalEmail: "",
    bankIban: "",
    bankSwift: "",
    cardNumber: "",
    cardCvv: "",
    cardExpiry: "",
  });

  // helpers

const watcherUserId = currentUserData?.id; // get user id from JSON


  const ticketWithExtension = useMemo(() => {
  if (!affiliate?.ticketNumber) return "";
  const ext = pad3(affiliate?.newSubscribersCount || 0); // number of new subscribers since last withdrawal
  return `${affiliate.ticketNumber}=${ext}`;
}, [affiliate]);


  const nextWithdrawalDate = useMemo(() => {
    // biweekly rule: lastWithdrawalAt + 14 days
    const last = affiliate?.lastWithdrawalAt ? new Date(affiliate.lastWithdrawalAt) : null;
    if (!last) return null;
    const next = new Date(last.getTime() + 14 * 24 * 60 * 60 * 1000);
    return next;
  }, [affiliate]);

  const canWithdraw = useMemo(() => {
    if (!affiliate) return false;
    const today = new Date();
    const afterWindow = !nextWithdrawalDate || today >= nextWithdrawalDate;
    const hasBalance = Number(affiliate.withdrawableBalance || 0) > 0;
    return afterWindow && hasBalance && affiliate.status === "active";
  }, [affiliate, nextWithdrawalDate]);

  // fetch affiliate & stats
  const fetchEverything = async () => {
  try {
    setLoading(true);
    if (!watcherUserId) return;

// affiliate profile
let aData = null;
try {
  const res = await APIControl.fetchAffiliate(watcherUserId);
  aData = res.success ? res.data : null;
} catch (err) {
  aData = null; // user is not yet an affiliate
}

    setAffiliate(aData);

    // stats for cards
    let sData = null;
    try {
      sData = await APIControl.getAffiliateStats(watcherUserId);
    } catch {}
    setStats(
      sData || {
        downloaders: aData?.downloaders || 0,
        totalSubscriptions: aData?.totalSubscriptions || 0,
        newDownloaders: aData?.newDownloaders || 0,
        newSubscribers: aData?.newSubscribersCount || 0,
        balance: aData?.withdrawableBalance || 0,
      }
    );
  } catch (e) {
    console.error(e);
    alert("Failed to load affiliate data.");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (isAuthenticated) fetchEverything();
  }, [isAuthenticated]); // eslint-disable-line

  // registration submit
  const submitRegistration = async (e) => {
    e?.preventDefault?.();
    if (!regForm.agree) {
      alert("You must agree to the terms to proceed.");
      return;
    }
    if (!regForm.firstName || !regForm.lastName || !regForm.phone || !regForm.email || !regForm.country || !regForm.idNumber || !regForm.username) {
      alert("Please fill all required fields.");
      return;
    }
    if (!regForm.docFront || !regForm.docBack) {
      alert("Please upload front and back document images.");
      return;
    }

    const fd = new FormData();
    fd.append("userId", watcherUserId);
    fd.append("firstName", regForm.firstName);
    fd.append("middleName", regForm.middleName);
    fd.append("lastName", regForm.lastName);
    fd.append("phone", regForm.phone);
    fd.append("email", regForm.email);
    fd.append("country", regForm.country);
    fd.append("idType", regForm.idType);
    fd.append("idNumber", regForm.idNumber);
    fd.append("username", regForm.username);
    fd.append("docFront", regForm.docFront);
    fd.append("docBack", regForm.docBack);

    try {
      setSaving(true);
      const data = await APIControl.registerAffiliate(fd);
setAffiliate(data);

      alert("Thanks for submitting. You’ll receive an approval email shortly.");
      setShowRegister(false);
    } catch (e) {
      console.error(e);
      alert(e.message || "Registration failed.");
    } finally {
      setSaving(false);
    }
  };

  // withdraw submit (no amount field; backend computes from new subscribers)
  const submitWithdraw = async (e) => {
    e?.preventDefault?.();
    if (!method) {
      alert("Choose a payment method.");
      return;
    }

    // Build accountDetails by method
    let accountDetails = {};
    switch (method) {
      case "mpesa":
        if (!payout.mpesaNumber) return alert("Enter your M-PESA number.");
        accountDetails = { mpesaNumber: payout.mpesaNumber };
        break;
      case "paypal":
        if (!payout.paypalEmail) return alert("Enter your PayPal email.");
        accountDetails = { paypalEmail: payout.paypalEmail };
        break;
      case "bank":
        if (!payout.bankIban || !payout.bankSwift)
          return alert("Enter your Bank IBAN and SWIFT.");
        accountDetails = { bankIban: payout.bankIban, bankSwift: payout.bankSwift };
        break;
      case "card":
        if (!payout.cardNumber || !payout.cardCvv || !payout.cardExpiry)
          return alert("Enter full card details.");
        accountDetails = {
          cardNumber: payout.cardNumber,
          cardCvv: payout.cardCvv,
          cardExpiry: payout.cardExpiry,
        };
        break;
      default:
        return alert("Unsupported method.");
    }

    try {
      setWithdrawing(true);
      const data = await APIControl.requestWithdrawal({
  affiliateId: affiliate._id,
  method,
  accountDetails,
});
alert(data?.message || "Withdrawal request submitted.");


      // refresh
      await fetchEverything();
      setShowWithdraw(false);
      setMethod("");
      setPayout({
        mpesaNumber: "",
        paypalEmail: "",
        bankIban: "",
        bankSwift: "",
        cardNumber: "",
        cardCvv: "",
        cardExpiry: "",
      });
    } catch (e) {
      console.error(e);
      alert(e.message || "Withdrawal request failed.");
    } finally {
      setWithdrawing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ color: neon.red, padding: "2rem", fontFamily: "'Orbitron', sans-serif" }}>
        Please log in to access Affiliates.
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  const status =
    affiliate?.status === "active"
      ? "online"
      : affiliate?.status === "pending"
      ? "warning"
      : "offline";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: neon.blue,
        fontFamily: "'Orbitron', sans-serif",
        padding: "1.25rem",
      }}
    >
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h1 style={{ margin: 0, textShadow: `0 0 10px ${neon.blue}` }}>FTSA AI • Affiliate Center</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <StatusBadge
            status={status}
            label={
              affiliate?.status === "active"
                ? "Active"
                : affiliate?.status === "pending"
                ? "Pending approval"
                : "Not registered"
            }
          />
          <NeonButton onClick={fetchEverything}>Refresh</NeonButton>
        </div>
      </header>

      {/* Ticket */}
      <section
        style={{
          border: `2px solid ${neon.blue}`,
          borderRadius: 12,
          padding: 16,
          boxShadow: `0 0 10px ${neon.blue}`,
          marginBottom: 16,
          background: "#0b0b0b",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Your Ticket</h3>
        {affiliate?.ticketNumber ? (
  <div style={{ fontSize: 18, color: neon.green }}>
    {ticketWithExtension}
  </div>
) : (
  <div style={{ color: neon.red }}>No ticket yet.</div>
)}

        <div style={{ marginTop: 8, fontSize: 13, color: "#9ee" }}>
          The extension (=xxx) auto-increments with new subscribers from your link.
        </div>
      </section>
      <div style={{ marginTop: 8, fontSize: 14, color: neon.green }}>
  Your referral link:
  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
    <input
      type="text"
      readOnly
      value={`${process.env.REACT_APP_FRONTEND_URL}/register?ref=${affiliate?.ticketNumber}`}
      style={{
        flex: 1,
        padding: "6px 8px",
        borderRadius: 6,
        border: `1px solid ${neon.blue}`,
        background: "#000",
        color: neon.blue
      }}
      
      onClick={(e) => e.target.select()}
    />
    <NeonButton
      onClick={() => {
        navigator.clipboard.writeText(`${process.env.REACT_APP_FRONTEND_URL}/register?ref=${affiliate?.ticketNumber}`);
        alert("Referral link copied!");
      }}
      style={{ flexShrink: 0 }}
    >
      Copy
    </NeonButton>
  </div>
</div>
      {/* Cards */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Card title="Downloaders" value={stats?.downloaders ?? 0} />
        <Card title="Total Subscriptions" value={stats?.totalSubscriptions ?? 0} />
        <Card title="New Downloaders" value={stats?.newDownloaders ?? 0} />
        <Card title="New Subscribers" value={stats?.newSubscribers ?? 0} />
        <Card
          title="Balance (USD)"
          value={(stats?.balance ?? affiliate?.withdrawableBalance ?? 0).toFixed(2)}
        />
      </section>

      {/* Withdraw policy */}
      <section
        style={{
          border: `2px solid ${neon.blue}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          background: "#0b0b0b",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Withdrawal Policy (Biweekly)</h3>
        <ul style={{ marginTop: 8, lineHeight: 1.5 }}>
          <li>Withdrawals are available every 14 days.</li>
          <li>You are paid only for new subscribers since your last withdrawal.</li>
          <li>The payout amount is calculated automatically.</li>
        </ul>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          Last withdrawal:{" "}
          <span style={{ color: neon.green }}>
            {affiliate?.lastWithdrawalAt ? new Date(affiliate.lastWithdrawalAt).toLocaleString() : "—"}
          </span>
          {"  "} • Next available:{" "}
          <span style={{ color: neon.green }}>
            {nextWithdrawalDate ? nextWithdrawalDate.toLocaleString() : "Now"}
          </span>
        </div>
      </section>

      {/* Actions */}
      <section style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {!affiliate?.ticketBase && (
          <NeonButton onClick={() => setShowRegister(true)}>Register as Affiliate</NeonButton>
        )}
        {affiliate?.status === "pending" && (
          <div style={{ color: neon.amber }}>Your registration is awaiting approval.</div>
        )}
        {affiliate?.status === "active" && (
          <NeonButton
            onClick={() => setShowWithdraw(true)}
            disabled={!canWithdraw}
            title={!canWithdraw ? "Either window not open or balance is 0" : ""}
          >
            Request Withdrawal
          </NeonButton>
        )}
      </section>

      {/* Registration Modal */}
      {showRegister && (
        <Modal title="Affiliate Registration" onClose={() => setShowRegister(false)}>
          <form onSubmit={submitRegistration} style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Input label="First name" required value={regForm.firstName} onChange={(v) => setRegForm({ ...regForm, firstName: v })} />
              <Input label="Middle name" value={regForm.middleName} onChange={(v) => setRegForm({ ...regForm, middleName: v })} />
              <Input label="Last name" required value={regForm.lastName} onChange={(v) => setRegForm({ ...regForm, lastName: v })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Input label="Phone (+254...)" required value={regForm.phone} onChange={(v) => setRegForm({ ...regForm, phone: v })} />
              <Input label="Email" type="email" required value={regForm.email} onChange={(v) => setRegForm({ ...regForm, email: v })} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <Input label="Country" required value={regForm.country} onChange={(v) => setRegForm({ ...regForm, country: v })} />
              <Select
                label="ID Type"
                value={regForm.idType}
                onChange={(v) => setRegForm({ ...regForm, idType: v })}
                options={[
                  { value: "id", label: "National ID" },
                  { value: "passport", label: "Passport" },
                  { value: "dl", label: "Driver License" },
                ]}
              />
              <Input label="Document Number" required value={regForm.idNumber} onChange={(v) => setRegForm({ ...regForm, idNumber: v })} />
            </div>

            <Input label="Username" required value={regForm.username} onChange={(v) => setRegForm({ ...regForm, username: v })} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <FileInput label="Doc Front (image)" required onChange={(file) => setRegForm({ ...regForm, docFront: file })} />
              <FileInput label="Doc Back (image)" required onChange={(file) => setRegForm({ ...regForm, docBack: file })} />
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={regForm.agree}
                onChange={(e) => setRegForm({ ...regForm, agree: e.target.checked })}
              />
              I agree to the Affiliate Terms & Conditions
            </label>

            <NeonButton type="submit" disabled={saving}>{saving ? "Submitting..." : "Submit"}</NeonButton>
          </form>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <Modal title="Request Withdrawal" onClose={() => setShowWithdraw(false)}>
          <form onSubmit={submitWithdraw} style={{ display: "grid", gap: 10 }}>
            <div style={{ marginBottom: 6, color: neon.green }}>
              Withdrawable balance: ${(affiliate?.withdrawableBalance || 0).toFixed(2)}
            </div>

            <Select
              label="Payment Method"
              value={method}
              onChange={setMethod}
              options={[
                { value: "", label: "Select method..." },
                { value: "mpesa", label: "M-PESA" },
                { value: "paypal", label: "PayPal" },
                { value: "bank", label: "Bank Transfer" },
                { value: "card", label: "Visa / Card" },
              ]}
              required
            />

            {method === "mpesa" && (
              <Input label="M-PESA Number" required value={payout.mpesaNumber} onChange={(v) => setPayout({ ...payout, mpesaNumber: v })} />
            )}
            {method === "paypal" && (
              <Input label="PayPal Email" type="email" required value={payout.paypalEmail} onChange={(v) => setPayout({ ...payout, paypalEmail: v })} />
            )}
            {method === "bank" && (
              <>
                <Input label="Bank IBAN" required value={payout.bankIban} onChange={(v) => setPayout({ ...payout, bankIban: v })} />
                <Input label="Bank SWIFT" required value={payout.bankSwift} onChange={(v) => setPayout({ ...payout, bankSwift: v })} />
              </>
            )}
            {method === "card" && (
              <>
                <Input label="Card Number" required value={payout.cardNumber} onChange={(v) => setPayout({ ...payout, cardNumber: v })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Input label="CVV" required value={payout.cardCvv} onChange={(v) => setPayout({ ...payout, cardCvv: v })} />
                  <Input label="Expiry (MM/YY)" required value={payout.cardExpiry} onChange={(v) => setPayout({ ...payout, cardExpiry: v })} />
                </div>
              </>
            )}

            <NeonButton type="submit" disabled={withdrawing || !canWithdraw}>
              {withdrawing ? "Submitting..." : "Submit Withdrawal"}
            </NeonButton>
            {!canWithdraw && (
              <div style={{ fontSize: 12, color: neon.red }}>
                You can request withdrawal only when the window is open and your balance is greater than 0.
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Card({ title, value }) {
  return (
    <div
      style={{
        border: `2px solid ${neon.blue}`,
        borderRadius: 12,
        padding: 16,
        background: "#0b0b0b",
        boxShadow: `0 0 10px ${neon.blue}`,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.85 }}>{title}</div>
      <div style={{ fontSize: 24, color: neon.green, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12 }}>{label}{required ? " *" : ""}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${neon.blue}`,
          background: "#000",
          color: neon.blue,
          outline: "none",
        }}
      />
    </label>
  );
}

function Select({ label, value, onChange, options, required }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12 }}>{label}{required ? " *" : ""}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${neon.blue}`,
          background: "#000",
          color: neon.blue,
          outline: "none",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ color: "#000" }}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FileInput({ label, onChange, required }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12 }}>{label}{required ? " *" : ""}</span>
      <input
        type="file"
        accept="image/*"
        required={required}
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        style={{
          padding: "10px 12px",
          borderRadius: 8,
          border: `1px solid ${neon.blue}`,
          background: "#000",
          color: neon.blue,
          outline: "none",
        }}
      />
    </label>
  );
}
