// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import NeonButton from "../components/NeonButton";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import Modal from "react-modal";
import "../styles/SettingsPage.css";

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // add this at the top of your component
  // Profile
  const [profile, setProfile] = useState({
    profitPhoto: "",
    firstName: "",
    middleName: "",
    sirName: "",
    email: "",
    phoneNumber: "",
    phoneCode: "+254",
    country: "",
  });

  // Security
  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    twoFactorEnabled: false,
    showPasswords: false,
  });

  // Notifications
  const [notifications, setNotifications] = useState({
    messages: true,
    alerts: true,
  });

  // Modals
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSecurityModalOpen, setSecurityModalOpen] = useState(false);

  const neonColors = {
    background: "#111",
    neonBlue: "#00FFFF",
    neonGreen: "#00FF00",
    neonOrange: "#FFA500",
    neonRed: "#FF0000",
  };

  useEffect(() => {
  if (!isAuthenticated) return;
  setLoading(true);
  setError(null);

  APIControl.fetchSettingsData()
    .then((res) => {
      if (!res) {
        setError("No settings data returned");
        return;
      }

      if (!res.success) {
        setError(res.error || "Failed to fetch settings");
        return;
      }

      // Safe: only access data if success
      const data = res.data || {};
      setProfile(data.profile || profile);
      setSecurity((s) => ({
        ...s,
        twoFactorEnabled: data.security?.twoFactorEnabled ?? s.twoFactorEnabled,
      }));
      setNotifications(data.notifications || notifications);
    })
    .catch((err) => setError("Failed to load settings data: " + (err?.message || "")))
    .finally(() => setLoading(false));
}, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={centeredStyle(neonColors)}>
        Please login to access settings.
      </div>
    );
  }

  // Handlers
  const handleProfileChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });
  const handleSecurityChange = (e) =>
    setSecurity({ ...security, [e.target.name]: e.target.value });
  const handleToggleTwoFactor = () =>
    setSecurity((prev) => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
  const handleToggleNotifications = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  // Save Functions
 const saveProfile = async () => {
  setLoading(true);
  try {
    const formData = new FormData();
    Object.keys(profile).forEach(key => {
      if (profile[key] !== undefined) {
        if (key === "profitPhoto" && profile[key] instanceof File) {
          formData.append(key, profile[key]);
        } else {
          formData.append(key, profile[key]);
        }
      }
    });
    const result = await APIControl.saveProfileData(formData);
    if (!result.success) throw new Error(result.error || "Save failed");
    alert("Profile saved successfully!");
  } catch (err) {
    alert("Failed to save profile: " + err.message);
  } finally {
    setLoading(false);
  }
};

 const saveSecurity = async () => {
  if (security.newPassword && security.newPassword !== security.confirmNewPassword) {
    alert("New password and confirm password do not match!");
    return;
  }
  setLoading(true);
  try {
    const payload = {
      oldPassword: security.oldPassword || undefined,
      newPassword: security.newPassword || undefined,
      twoFactorEnabled: security.twoFactorEnabled,
    };
    const result = await APIControl.saveProfileSecurity(payload); // match your APIControl method
    if (!result.success) throw new Error(result.error || "Save failed");
    alert("Security settings saved successfully!");
  } catch (err) {
    alert("Failed to save security: " + err.message);
  } finally {
    setLoading(false);
  }
};


  const saveNotifications = async () => {
  setLoading(true);
  try {
    const result = await APIControl.saveProfileNotifications(notifications); 
// match the function in APIControl that calls `/notifications/:userId`

    if (!result.success) throw new Error(result.error || "Save failed");
    alert("Notifications saved successfully!");
  } catch (err) {
    alert("Failed to save notifications: " + err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, minHeight: "100vh", padding: "2rem" }}>
      <header style={headerStyle(neonColors)}>FTSA AI - SETTINGS</header>
      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error">{error}</StatusBadge>}

      {!loading && (
        <div style={gridStyle}>
          {/* Profile Card */}
          <div style={cardStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonGreen }}>Profile</h2>

<img
  src={
    profile.profitPhoto instanceof File
      ? URL.createObjectURL(profile.profitPhoto)
      : profile.profitPhoto
        ? `${BACKEND_URL}/${profile.profitPhoto.replace(/\\/g, "/")}` // ensures Windows path works
        : "/default-profile.png" // local placeholder instead of via.placeholder.com
  }
  alt="Profile"
  style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
/>


<input
  type="file"
  accept="image/*"
  onChange={(e) => setProfile({ ...profile, profitPhoto: e.target.files[0] })}
  style={{ marginBottom: 10 }}
/>


            {["firstName", "middleName", "sirName", "email", "phoneCode", "phoneNumber", "country"].map((field) => (
  <input
    key={field}
    name={field}
    placeholder={field}
    value={profile[field]}
    onChange={handleProfileChange}
    style={inputStyle(neonColors)}
  />
))}

            <button onClick={saveProfile} style={buttonStyle(neonColors)}>Save Profile</button>
          </div>

          {/* Security Card */}
          <div style={cardStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonOrange }}>Security</h2>
            {["oldPassword", "newPassword", "confirmNewPassword"].map((field) => (
              <input
                key={field}
                type={security.showPasswords ? "text" : "password"}
                name={field}
                placeholder={field}
                value={security[field]}
                onChange={handleSecurityChange}
                style={inputStyle(neonColors)}
              />
            ))}
            <label>
              <input
                type="checkbox"
                checked={security.showPasswords}
                onChange={() => setSecurity((prev) => ({ ...prev, showPasswords: !prev.showPasswords }))}
              /> Show Passwords
            </label>
            <label>
              Two-Factor:
              <button onClick={handleToggleTwoFactor} style={buttonStyle(neonColors)}>
                {security.twoFactorEnabled ? "ON" : "OFF"}
              </button>
            </label>
            <button onClick={saveSecurity} style={buttonStyle(neonColors)}>Save Security</button>
          </div>

          {/* Notifications Card */}
          <div style={cardStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonBlue }}>Notifications</h2>
            {Object.entries(notifications).map(([key, val]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span>{key}</span>
                <button onClick={() => handleToggleNotifications(key)} style={buttonStyle(neonColors)}>
                  {val ? "ON" : "OFF"}
                </button>
              </div>
            ))}
            <button onClick={saveNotifications} style={buttonStyle(neonColors)}>Save Notifications</button>
          </div>
        </div>
      )}
    </div>
  );
}

// STYLES
const headerStyle = (colors) => ({
  fontSize: 28,
  fontWeight: "bold",
  textAlign: "center",
  borderBottom: `2px solid ${colors.neonBlue}`,
  paddingBottom: 10,
  marginBottom: 20,
});

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "2rem",
  alignItems: "start",
};

const cardStyle = (colors) => ({
  border: `2px solid ${colors.neonBlue}`,
  borderRadius: 12,
  padding: "1rem",
  boxShadow: `0 0 15px ${colors.neonBlue}`,
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
});

const inputStyle = (colors) => ({
  padding: "0.5rem",
  borderRadius: 6,
  border: `2px solid ${colors.neonBlue}`,
  backgroundColor: "#111",
  color: colors.neonBlue,
  outline: "none",
});

const buttonStyle = (colors) => ({
  backgroundColor: colors.neonBlue,
  border: "none",
  color: "#000",
  fontWeight: "bold",
  padding: "0.5rem 1rem",
  borderRadius: 6,
  cursor: "pointer",
  marginTop: 10,
});

const centeredStyle = (colors) => ({
  fontFamily: "'Orbitron', sans-serif",
  color: colors.neonRed,
  padding: "4rem",
  textAlign: "center",
});
