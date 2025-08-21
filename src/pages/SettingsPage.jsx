// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/SettingsPage.css";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

const accentColors = ["Blue", "Green", "Red", "Aqua"];
const languages = [
  "ENGLISH",
  "SWAHILI",
  "SPANISH",
  "FRENCH",
  "CHINESE",
  "ARABIC",
  "INDIA",
];

export default function SettingsPage() {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Settings state
  const [profile, setProfile] = useState({
    profitPhoto: "",
    firstName: "",
    middleName: "",
    sirName: "",
    phoneNumber: "",
    email: "",
    county: "",
  });

  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    twoFactorEnabled: false,
  });

  const [notifications, setNotifications] = useState({
    appUpdate: true,
    tradesUpdate: true,
    newsHeadlines: true,
    marketOffers: false,
  });

  const [theme, setTheme] = useState({
    darkMode: true,
    neonAccentColor: "Blue",
  });

  const [apiIntegrations, setApiIntegrations] = useState({
    mt4: false,
    mt5: false,
    propFirm: false,
    binance: false,
    firebase: false,
  });

  const [dataPrivacy, setDataPrivacy] = useState({
    exportData: false,
    deleteAccount: false,
  });

  const [language, setLanguage] = useState("ENGLISH");

  const [eaSettings, setEaSettings] = useState({
  pairs: [],
  risk: 1,
  dailyTP: 2,
  dailySL: 1,
});


  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    APIControl.fetchSettingsData()
      .then((data) => {
        setProfile(data.profile ?? {
  profitPhoto: "",
  firstName: "",
  middleName: "",
  sirName: "",
  phoneNumber: "",
  email: "",
  county: "",
});
        setSecurity((s) => ({ ...s, twoFactorEnabled: data.security?.twoFactorEnabled ?? false }));
        setNotifications(data.notifications);
        setTheme({
  darkMode: data.theme?.darkMode ?? true,
  neonAccentColor: data.theme?.neonAccentColor ?? "Blue",
});

        setApiIntegrations(data.apiIntegrations);
        setLanguage(data.language);
setEaSettings(data.eaSettings ?? {
  pairs: [],
  risk: 1,
  dailyTP: 2,
  dailySL: 1,
});

      })
      .catch(() => setError("Failed to load settings data"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          color: neonColors.neonRed,
          padding: "4rem",
          textAlign: "center",
        }}
      >
        Please login to access settings.
      </div>
    );
  }

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSecurityChange = (e) => {
    setSecurity({ ...security, [e.target.name]: e.target.value });
  };

  const handleToggleNotifications = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleTwoFactor = () => {
    setSecurity((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  };

  const handleToggleThemeMode = () => {
    setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const handleAccentColorChange = (color) => {
    setTheme((prev) => ({ ...prev, neonAccentColor: color }));
  };

  const handleApiIntegrationToggle = (key) => {
    setApiIntegrations((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSaveSettings = () => {
    setLoading(true);
    APIControl.saveSettingsData({
      profile,
      security,
      notifications,
      theme,
      apiIntegrations,
      language,
      eaSettings, // include EA settings here
    })
      .then(() => alert("Settings saved successfully!"))
      .catch(() => alert("Failed to save settings."))
      .finally(() => setLoading(false));
  };

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        padding: "1rem 2rem",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          borderBottom: `2px solid ${neonColors.neonBlue}`,
          paddingBottom: "0.5rem",
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        FTSA AI - SETTINGS
      </header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && (
        <StatusBadge status="error" style={{ margin: "1rem auto", maxWidth: 400 }}>
          {error}
        </StatusBadge>
      )}

      {!loading && (
        <>
          {/* PROFILE SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
            }}
          >
            <h2 style={{ color: neonColors.neonGreen }}>PROFILE SETTINGS</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <label style={{ flex: "1 1 200px" }}>
                Profit Photo URL:
                <input
                  type="text"
                  name="profitPhoto"
                  value={profile.profitPhoto}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                  placeholder="Image URL"
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                First Name:
                <input
                  type="text"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Middle Name:
                <input
                  type="text"
                  name="middleName"
                  value={profile.middleName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Sir Name:
                <input
                  type="text"
                  name="sirName"
                  value={profile.sirName}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                Phone Number:
                <input
                  type="tel"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 200px" }}>
                Email:
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ flex: "1 1 150px" }}>
                County:
                <input
                  type="text"
                  name="county"
                  value={profile.county}
                  onChange={handleProfileChange}
                  style={inputStyle(neonColors)}
                />
              </label>
            </div>
          </section>

          {/* SECURITY SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
            }}
          >
            <h2 style={{ color: neonColors.neonOrange }}>SECURITY SETTINGS</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: 400 }}>
              <label>
                Old Password:
                <input
                  type="password"
                  name="oldPassword"
                  value={security.oldPassword}
                  onChange={handleSecurityChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label>
                New Password:
                <input
                  type="password"
                  name="newPassword"
                  value={security.newPassword}
                  onChange={handleSecurityChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label>
                Confirm New Password:
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={security.confirmNewPassword}
                  onChange={handleSecurityChange}
                  style={inputStyle(neonColors)}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                Two-Factor Authentication:
                <NeonButton
                  onClick={handleToggleTwoFactor}
                  style={{
                    border: `2px solid ${
                      security.twoFactorEnabled ? neonColors.neonGreen : neonColors.neonRed
                    }`,
                    backgroundColor: security.twoFactorEnabled ? "#002200" : "transparent",
                    minWidth: 80,
                  }}
                >
                  {security.twoFactorEnabled ? "ON" : "OFF"}
                </NeonButton>
              </label>
            </div>
          </section>

          {/* NOTIFICATION PREFERENCES */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>NOTIFICATION PREFERENCES</h2>
            {Object.entries(notifications || {}).map(([key, val]) => (
              <label
                key={key}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
                <NeonButton
                  onClick={() => handleToggleNotifications(key)}
                  style={{
                    border: `2px solid ${val ? neonColors.neonGreen : neonColors.neonRed}`,
                    backgroundColor: val ? "#002200" : "transparent",
                    minWidth: 80,
                  }}
                >
                  {val ? "ON" : "OFF"}
                </NeonButton>
              </label>
            ))}
          </section>

          {/* THEME CUSTOMIZATION */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>THEME CUSTOMIZATION</h2>
            <label
              style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}
            >
              Dark Mode:
              <NeonButton
                onClick={handleToggleThemeMode}
                style={{
                  border: `2px solid ${theme.darkMode ? neonColors.neonGreen : neonColors.neonRed}`,
                  backgroundColor: theme.darkMode ? "#002200" : "transparent",
                  minWidth: 80,
                }}
              >
                {theme.darkMode ? "ON" : "OFF"}
              </NeonButton>
            </label>
            <div>
              Neon Accent Color:
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                {accentColors.map((color) => (
                  <NeonButton
                    key={color}
                    onClick={() => handleAccentColorChange(color)}
                    style={{
                      border: `2px solid ${
                        theme.neonAccentColor === color
                          ? neonColors.neonGreen
                          : neonColors.neonBlue
                      }`,
                      backgroundColor: "transparent",
                      minWidth: 80,
                    }}
                  >
                    {color}
                  </NeonButton>
                ))}
              </div>
            </div>
          </section>
          {/* EA SETTINGS */}
<section
  style={{
    marginBottom: "2rem",
    border: `2px solid ${neonColors.neonBlue}`,
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: `0 0 15px ${neonColors.neonBlue}`,
    maxWidth: 400,
  }}
>
  <h2 style={{ color: neonColors.neonOrange }}>EA SETTINGS</h2>
  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
    
    <label>
      Trading Pairs (comma separated):
      <input
        type="text"
        value={eaSettings.pairs.join(",")}
        onChange={(e) =>
          setEaSettings((prev) => ({
            ...prev,
            pairs: e.target.value.split(",").map((p) => p.trim()),
          }))
        }
        style={inputStyle(neonColors)}
        placeholder="EURUSD, GBPUSD, USDJPY"
      />
    </label>

    <label>
      Risk per Trade (%):
      <input
        type="number"
        value={eaSettings.risk}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, risk: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0.1}
        max={100}
        step={0.1}
      />
    </label>

    <label>
      Daily Take Profit (%):
      <input
        type="number"
        value={eaSettings.dailyTP}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, dailyTP: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0}
        step={0.1}
      />
    </label>

    <label>
      Daily Stop Loss (%):
      <input
        type="number"
        value={eaSettings.dailySL}
        onChange={(e) =>
          setEaSettings((prev) => ({ ...prev, dailySL: parseFloat(e.target.value) }))
        }
        style={inputStyle(neonColors)}
        min={0}
        step={0.1}
      />
    </label>
  </div>
</section>


          {/* API & INTEGRATIONS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>API & INTEGRATIONS</h2>
            {Object.entries(apiIntegrations || {}).map(([key, val]) => (
              <label
                key={key}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                {key.toUpperCase()}
                <NeonButton
                  onClick={() => handleApiIntegrationToggle(key)}
                  style={{
                    border: `2px solid ${val ? neonColors.neonGreen : neonColors.neonRed}`,
                    backgroundColor: val ? "#002200" : "transparent",
                    minWidth: 80,
                  }}
                >
                  {val ? "CONNECTED 🟩" : "NOT CONNECTED 🟥"}
                </NeonButton>
              </label>
            ))}
          </section>

          {/* DATA & PRIVACY */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonRed }}>DATA & PRIVACY</h2>
            <NeonButton
              onClick={() => alert("Exporting data as CSV...")}
              style={{ marginBottom: "1rem" }}
            >
              Export data as CSV
            </NeonButton>
            <NeonButton
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to DELETE your account? This action is irreversible."
                  )
                ) {
                  alert("Account deleted");
                }
              }}
              style={{ backgroundColor: neonColors.neonRed, borderColor: neonColors.neonRed }}
            >
              Delete Account
            </NeonButton>
            <p style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
              <a href="/privacy-policy" style={{ color: neonColors.neonBlue }}>
                Privacy Policy
              </a>
            </p>
          </section>

          {/* LANGUAGE SETTINGS */}
          <section
            style={{
              marginBottom: "2rem",
              border: `2px solid ${neonColors.neonBlue}`,
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: `0 0 15px ${neonColors.neonBlue}`,
              maxWidth: 400,
            }}
          >
            <h2 style={{ color: neonColors.neonBlue }}>LANGUAGE SETTINGS</h2>
            <select
              value={language}
              onChange={handleLanguageChange}
              style={inputStyle(neonColors)}
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </section>

          {/* APP VERSION */}
          <footer
            style={{
              textAlign: "center",
              borderTop: `1px solid ${neonColors.neonBlue}`,
              paddingTop: "1rem",
              color: neonColors.neonBlue,
              fontSize: "0.9rem",
              marginTop: "auto",
            }}
          >
            FTSA AI 0.V1 - Powered by KELVIN SPECTER (MBURU G) © 2025
          </footer>

          {/* Save button */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <NeonButton onClick={handleSaveSettings} style={{ minWidth: 160 }}>
              Save Settings
            </NeonButton>
          </div>
        </>
      )}
    </div>
  );
}

// Helper style for inputs
const inputStyle = (colors) => ({
  width: "100%",
  padding: "0.5rem",
  borderRadius: "6px",
  border: `2px solid ${colors.neonBlue}`,
  backgroundColor: "#111",
  color: colors.neonBlue,
  fontFamily: "'Orbitron', sans-serif",
  outline: "none",
});
