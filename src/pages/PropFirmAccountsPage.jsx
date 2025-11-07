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
  // ✅ FIXED fetchAccounts: pull all saved Prop Firm accounts from backend
// Replace the entire fetchAccounts function with this
const fetchAccounts = async () => {
  try {
    setLoading(true);

    // fetch prop settings and prop accounts in parallel
    const [propsettingRes, propaccountsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/propsetting`),
      fetch(`${BACKEND_URL}/api/propaccounts`)
    ]);

    const [propsettingJson, propaccountsJson] = await Promise.all([
      (async () => {
        try { return await propsettingRes.json(); } catch { return null; }
      })(),
      (async () => {
        try { return await propaccountsRes.json(); } catch { return null; }
      })()
    ]);

    // Normalize arrays (handle different shapes)
    const propSettingsArray = (propsettingJson && (Array.isArray(propsettingJson.data) ? propsettingJson.data : Array.isArray(propsettingJson.accounts) ? propsettingJson.accounts : [])) || [];
    const propAccountsArray = (propaccountsJson && (Array.isArray(propaccountsJson.data) ? propaccountsJson.data : Array.isArray(propaccountsJson) ? propaccountsJson : [])) || [];

    // Build a map of propAccount by login from propAccounts endpoint (so we get isConnected, password, server etc.)
    const accountByLogin = {};
    propAccountsArray.forEach(item => {
      // controller returns { account: {...}, summary: {...} } in some cases
      const a = item?.account || item;
      if (!a || !a.login) return;
      accountByLogin[String(a.login)] = {
        broker: a.broker || "",
        login: String(a.login),
        password: a.password || "",
        server: a.server || "",
        platform: a.platform || "MT5",
        accountType: a.accountType || "demo",
        currency: a.currency || "USD",
        isConnected: !!a.isConnected
      };
    });

    // Merge propSettings with accounts: propsettings may reference accountLogin
    const merged = propSettingsArray.map((ps, idx) => {
      const setting = ps || {};
      // setting may contain account (or accountLogin)
      const accRef = setting.account || {};
      const accountLogin = setting.accountLogin || accRef.accountLogin || accRef.login || accRef?.login;
      const acct = accountByLogin[String(accountLogin)] || accRef || {};
      const accountObj = acct || {};

      return {
        broker: accountObj.broker || accountObj.broker || "-",
        login: accountLogin || accountObj.login || "-",
        server: accountObj.server || accountObj.server || "-",
        platform: accountObj.platform || "MT5",
        accountType: accountObj.accountType || "demo",
        currency: accountObj.currency || "USD",
        currentProfit: setting.currentProfit ?? accountObj.currentProfit ?? 0,
        status: setting.status ?? "active",
        profitTarget: setting.profitTarget ?? 0,
        dailyDrawdown: setting.dailyDrawdown ?? 0,
        maxDrawdown: setting.maxDrawdown ?? 0,
        phase: setting.phase ?? "1",
        isConnected: !!(accountObj.isConnected) // prefer backend isConnected flag
      };
    });

    // If there were no prop settings but there are raw prop accounts, show them too
    const onlyAccounts = Object.values(accountByLogin).map(a => ({
      broker: a.broker && a.broker !== "-" ? a.broker : "",
      login: a.login || "-",
      server: a.server && a.server !== "-" ? a.server : "",
      platform: a.platform || "MT5",
      accountType: a.accountType || "demo",
      currency: a.currency || "USD",
      currentProfit: 0,
      status: "active",
      profitTarget: 0,
      dailyDrawdown: 0,
      maxDrawdown: 0,
      phase: "1",
      isConnected: !!a.isConnected
    }));

    // Prefer merged (propsettings) when present, else fallback to accounts-only
    const finalAccounts = merged.length > 0 ? merged : onlyAccounts;

    setAccounts(finalAccounts);
  } catch (err) {
    console.error("Fetch Accounts Error:", err);
    setStatus({ type: "error", text: "Failed to load accounts." });
    setAccounts([]); // ensure state cleared on error
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
      const res = await APIControl.connectPropFirmAccount(formData);

      if (res.success && res.account) {
        console.log("connectAccount result:", res);

  const newAccount = {
    broker: formData.broker?.trim() || "Unknown Broker",
    login: res.account.login || formData.login || "-",
    password: formData.password || "",
    server: formData.server?.trim() || "Unknown Server",
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
  // ✅ Save the full Prop Firm account itself (so it persists)
try {
  await fetch(`${BACKEND_URL}/api/propaccounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      broker: formData.broker,
      login: res.account.login || formData.login,
      password: formData.password,
      server: formData.server,
      platform: formData.platform,
      accountType: formData.accountType,
      currency: res.account.currency || formData.currency || "USD",
    }),
  });
  console.log("✅ Prop firm account saved to backend");
} catch (saveErr) {
  console.error("❌ Failed to persist prop account:", saveErr);
}


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
    const res = await fetch(`${BACKEND_URL}/api/propaccounts/${acc.login}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (result.success) {
      const remaining = accounts.filter(a => a.login !== acc.login);
      // Make sure one stays connected
      if (remaining.length > 0) remaining[0].isConnected = true;
      setAccounts(remaining);
      setStatus({ type: "success", text: "Account deleted successfully!" });
    } else {
      setStatus({ type: "error", text: result.message || "Failed to delete account." });
    }
  } catch (err) {
    console.error(err);
    setStatus({ type: "error", text: err.message || "Unexpected error" });
  } finally {
    setLoading(false);
  }
};


  // Replace the entire handleReconnect function with this
const handleReconnect = async (acc) => {
  try {
    setLoading(true);

    let password = acc.password;
    if (!password) {
      const userPassword = window.prompt(`Please enter password for account ${acc.login}`);
      if (!userPassword) {
        setStatus({ type: "error", text: "Password is required to reconnect." });
        return;
      }
      password = userPassword;
    }

    const res = await APIControl.connectPropFirmAccount({
      login: acc.login,
      password,
      server: acc.server,
      broker: acc.broker,
      platform: acc.platform,
      accountType: acc.accountType,
    });

    if (!res.success) {
      setStatus({ type: "error", text: res.message || "Failed to reconnect account." });
      return;
    }

    await fetchAccounts();
    setStatus({ type: "success", text: `Reconnected to account ${acc.login}` });
  } catch (err) {
    console.error("Reconnect error:", err);
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
