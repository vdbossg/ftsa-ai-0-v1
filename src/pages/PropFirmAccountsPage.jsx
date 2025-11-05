import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal"; // Create a simple Modal component if not present
import { useAuth } from "../contexts/AuthContext";
import APIControl from "/src/brain/APIControl.js";
import "../styles/MTAccountsPage.css";


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonRed: "#FF0000",
};

export default function PropFirmAccountsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
  broker: "",
  login: "",
  password: "",
  server: "",
  platform: "MT5",
  accountType: "demo",
  currency: "",
  profitTarget: "",
  dailyDrawdown: "",
  maxDrawdown: "",
  phase: "1",
});

  const [accounts, setAccounts] = useState([]); // store all saved accounts


  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAccounts();
  }, [isAuthenticated]);
  const fetchAccounts = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${BACKEND_URL}/api/propsetting`);


    const data = await res.json();

    if (data.success && Array.isArray(data.accounts)) {
  setAccounts(
    data.accounts.map((item) => ({
      broker: item.account?.broker || "-",
      login: item.account?.login || "-",
      password: item.account?.password || "",
      server: item.account?.server || "-",
      platform: item.account?.platform || "MT5",
      accountType: item.account?.accountType || "demo",
      currency: item.account?.currency || "USD",
      currentProfit: item.summary?.data?.balance ?? 0,
      status: "active",
      isConnected: true,
    }))
  );
} else {
  setAccounts([]); // ensures no accounts if data is empty
  setStatus({ type: "error", text: data.message || "Failed to load accounts." });
}

  } catch (err) {
    console.error(err);
    setStatus({ type: "error", text: "Failed to load accounts." });
  } finally {
    setLoading(false);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddAccount = async () => {
    if (!formData.login || !formData.password || !formData.server) {
      setStatus({ type: "error", text: "Please fill all fields." });
      return;
    }
    try {
      setLoading(true);
      const res = await APIControl.connectAccount(formData);
      if (res.success && res.account) {
        console.log("connectAccount result:", res);

  const newAccount = {
    broker: formData.broker || "-",
    login: res.account.login || formData.login || "-",
    password: formData.password || "",
    server: formData.server || "-",
    platform: formData.platform,
    accountType: formData.accountType,
    currency: res.account.currency || "USD",
    isConnected: true,
  };

  setAccounts(prev => {
  const updatedPrev = prev.map(acc => ({ ...acc, isConnected: false }));
  return [...updatedPrev, newAccount];
});



  // 🔹 Save prop firm settings after successful account creation
  try {
    console.log("Saving prop settings with accountLogin =", res?.account?.login, "and formData.login =", formData.login);
   const response = await fetch(`${BACKEND_URL}/api/propsetting`, {

  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accountLogin: res.account.login || formData.login,
    profitTarget: Number(formData.profitTarget),
    dailyDrawdown: Number(formData.dailyDrawdown),
    maxDrawdown: Number(formData.maxDrawdown),
    phase: Number(formData.phase),
  }),
});

     
     

  const data = await response.json();

  if (!response.ok || !data) {
    throw new Error(data?.message || "Failed to save prop settings.");
  }

  console.log("✅ Prop firm settings saved:", data);

} catch (propErr) {
  console.error("❌ Failed to save prop settings:", propErr);
  setStatus({ type: "error", text: propErr.message });
  setLoading(false);
  return; // stop the function if saving fails
}



  setStatus({ type: "success", text: "Account added successfully!" });
  setModalOpen(false);
  setFormData({
  broker: "",
  login: "",
  password: "",
  server: "",
  platform: "MT5",
  accountType: "demo",
  currency: "",
  profitTarget: "",
  dailyDrawdown: "",
  maxDrawdown: "",
  phase: "1",
});

} else {
  setStatus({ type: "error", text: res.message || "Failed to add account." });
}


    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: err.message || "Unexpected error." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (acc) => {
  try {
    setLoading(true);
    const res = await APIControl.deleteAccount(acc.login); // or acc.accountId if available

    if (res.success) {
      const remaining = accounts.filter(a => a.login !== acc.login || a.platform !== acc.platform);
      if (remaining.length > 0) remaining[0].isConnected = true;
      setAccounts(remaining);
      setStatus({ type: "success", text: "Account deleted successfully!" });
    } else {
      setStatus({ type: "error", text: res.message || "Failed to delete account." });
    }
  } catch (err) {
    console.error(err);
    setStatus({ type: "error", text: err.message || "Unexpected error." });
  } finally {
    setLoading(false);
  }
};


  const handleReconnect = async (acc) => {
  try {
    setLoading(true);
    const res = await APIControl.connectAccount({
      login: acc.login,
      password: acc.password || prompt(`Enter password for ${acc.login}`),
      server: acc.server,
      broker: acc.broker,
      platform: acc.platform,
      accountType: acc.accountType,
    });

    if (res.success) {
      // Persist the connected account in backend
await APIControl.setConnectedAccount(acc.login, acc.platform);

setAccounts((prev) =>
  prev.map((a) =>
    a.login === acc.login ? { ...a, isConnected: true } : { ...a, isConnected: false }
  )
);




      setStatus({ type: "success", text: `Reconnected to account ${acc.login}` });
    } else {
      setStatus({ type: "error", text: res.message || "Failed to reconnect account." });
    }
  } catch (err) {
    console.error(err);
    setStatus({ type: "error", text: err.message || "Unexpected error." });
  } finally {
    setLoading(false);
  }
};


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
        Please login to manage your Prop Firm account.
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>FTSA AI Prop Firm Account</h1>


      {/* Status */}
      {status.text && (
        <StatusBadge
          status={status.type}
          style={{ marginBottom: "1rem", display: "block", textAlign: "center" }}
        >
          {status.text}
        </StatusBadge>
      )}

      {/* Accounts Table */}
      <div
        style={{
          maxHeight: "250px",
          overflowY: "auto",
          marginBottom: "2rem",
          border: `2px solid ${neonColors.neonBlue}`,
          borderRadius: "8px",
          padding: "0.5rem",
        }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "1rem" }}>
            <LoadingSpinner size={40} color={neonColors.neonBlue} />
          </div>
        ) : accounts.length === 0 ? (
          <p style={{ textAlign: "center", color: neonColors.neonGreen }}>No saved accounts.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Broker", "Login ID", "Server", "Platform", "Account Type", "Currency", "Status", "Actions"].map(
                  (col) => (
                    <th
                      key={col}
                      style={{
                        borderBottom: `1px solid ${neonColors.neonBlue}`,
                        padding: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {accounts.filter(acc => acc && acc.login).map((acc) => (
                <tr key={acc.platform + "-" + acc.login}>
    <td style={{ textAlign: "center" }}>{acc.broker || "-"}</td>
    <td style={{ textAlign: "center" }}>{acc.login || "-"}</td>
    <td style={{ textAlign: "center" }}>{acc.server || "-"}</td>
    <td style={{ textAlign: "center" }}>{acc.platform || "-"}</td>
    <td style={{ textAlign: "center" }}>{acc.accountType || "-"}</td>
    <td style={{ textAlign: "center" }}>{acc.currency || "-"}</td>
    <td style={{ textAlign: "center" }}>
      <StatusBadge 
  status={acc.isConnected ? "success" : "error"} 
  label={acc.isConnected ? "Connected" : "Disconnected"} 
/>
    </td>
    <td style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
  {!acc.isConnected && (
    <NeonButton
      onClick={() => handleReconnect(acc)}
      style={{ backgroundColor: neonColors.neonGreen }}
    >
      Login
    </NeonButton>
  )}
  <NeonButton
  onClick={() => handleDelete(acc)} // ✅ pass full account
  style={{ backgroundColor: neonColors.neonRed }}
>
  Delete
</NeonButton>
</td>

  </tr>
))}

            </tbody>
          </table>
        )}
      </div>

      {/* Add Account Button */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <NeonButton onClick={() => setModalOpen(true)}>Add Account</NeonButton>
      </div>

      {/* Modal for Adding Account */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)} title="Add Prop Firm Account">

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddAccount();
            }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <label>
              Broker
              <input
                name="broker"
                value={formData.broker}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </label>
            <label>
              Login
              <input
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </label>
            <label>
              Server
              <input
                name="server"
                value={formData.server}
                onChange={handleInputChange}
                style={inputStyle}
                required
              />
            </label>
            <label>
  Platform
  <input
    type="text"
    name="platform"
    value="MT5"
    readOnly
    style={{ ...inputStyle, color: "#00FF00", cursor: "not-allowed" }}
  />
</label>

            <label>
              Account Type
              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="demo">Demo</option>
                <option value="live">Live</option>
              </select>
            </label>
<hr style={{ borderColor: neonColors.neonBlue }} />

<h3 style={{ color: neonColors.neonGreen, textAlign: "center" }}>Prop Firm Settings</h3>

<label>
  Profit Target (%)
  <input
    type="number"
    name="profitTarget"
    value={formData.profitTarget}
    onChange={handleInputChange}
    style={inputStyle}
    required
  />
</label>

<label>
  Daily Drawdown (%)
  <input
    type="number"
    name="dailyDrawdown"
    value={formData.dailyDrawdown}
    onChange={handleInputChange}
    style={inputStyle}
    required
  />
</label>

<label>
  Max Drawdown (%)
  <input
    type="number"
    name="maxDrawdown"
    value={formData.maxDrawdown}
    onChange={handleInputChange}
    style={inputStyle}
    required
  />
</label>

<label>
  Phase
  <select
    name="phase"
    value={formData.phase}
    onChange={handleInputChange}
    style={inputStyle}
  >
    <option value="1">Phase 1</option>
    <option value="2">Phase 2</option>
  </select>
</label>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              <NeonButton type="submit">➕ Add</NeonButton>
              <NeonButton type="button" style={{ backgroundColor: neonColors.neonRed }} onClick={() => setModalOpen(false)}>
                Cancel
              </NeonButton>
            </div>
          </form>
        </Modal>
      )}

      {/* Footer */}
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
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: "2px solid #00FFFF",
  backgroundColor: "#111",
  color: "#00FFFF",
  fontFamily: "'Orbitron', sans-serif",
  outline: "none",
};
