// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import NeonButton from "../components/NeonButton";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";
import "../styles/SettingsPage.css";

export default function SettingsPage() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Profile info (signup/login backend)
const [profile, setProfile] = useState({
  firstName: "",
  middleName: "",
  email: "",
  phone: "",
});

// Profile photo (MongoDB independent)
const [profilePhoto, setProfilePhoto] = useState(null);

// Security settings
const [security, setSecurity] = useState({
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: "",
  showPasswords: false,
});

// Notifications (for future)
const [notifications, setNotifications] = useState({
  messages: true,
  alerts: true,
});


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

  const token = localStorage.getItem("authToken");

  APIControl.fetchSettingsData(token)
    .then((res) => {
      if (!res?.success) {
        setError(res?.error || "Failed to load settings");
        return;
      }

      const data = res.data;

      // Profile info
      setProfile({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      // Profile photo (from same endpoint)
      setProfilePhoto(data.photo || null);

      // Notifications
      setNotifications(data.notifications || {
        messages: true,
        alerts: true,
      });
    })
    .catch((err) => {
      setError("Failed to load settings");
      console.error(err);
    })
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
  const handleToggleNotifications = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  // Save profile info (signup/login backend)
const saveProfile = async () => {
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const token = localStorage.getItem("authToken");
    const payload = {
      firstName: profile.firstName,
      middleName: profile.middleName,
      email: profile.email,
      phone: profile.phone,
    };
    const result = await APIControl.saveProfileData(payload, token);
    if (!result.success) throw new Error(result.error || "Save failed");

    setSuccessMsg("Profile info updated successfully!");
    if (updateUser) updateUser(result.data);
  } catch (err) {
    setError("Failed to save profile info: " + err.message);
  } finally {
    setLoading(false);
  }
};

// Save profile photo (MongoDB independent)
const saveProfilePhoto = async () => {
  if (!profilePhoto) {
    setError("No new photo selected.");
    return;
  }

  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const formData = new FormData();
    formData.append("photo", profilePhoto instanceof File ? profilePhoto : null);

    const result = await APIControl.saveProfilePhoto(formData);
    if (!result.success) throw new Error(result.error || "Photo upload failed");

    setSuccessMsg("Profile photo updated!");
    setProfilePhoto(result.data.photoUrl);
  } catch (err) {
    setError("Failed to save profile photo: " + err.message);
  } finally {
    setLoading(false);
  }
};


  // Save security (password update)
  const saveSecurity = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!security.oldPassword) {
      setError("Please enter your old password to change password.");
      return;
    }
    if (security.newPassword !== security.confirmNewPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (!security.newPassword) {
      setError("New password cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        oldPassword: security.oldPassword,
        newPassword: security.newPassword,
      };
      const result = await APIControl.saveProfileSecurity(payload, token);
      if (!result.success) throw new Error(result.error || "Password update failed");

      setSuccessMsg("Password updated successfully!");
      setSecurity((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmNewPassword: "" }));
    } catch (err) {
      setError("Failed to update password: " + err.message);
    } finally {
      setLoading(false);
    }
  };
// Save notifications
const saveNotifications = async () => {
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const token = localStorage.getItem("authToken");
    const result = await APIControl.saveProfileNotifications(notifications, token);
    if (!result.success) throw new Error(result.error || "Failed to save notifications");

    setSuccessMsg("Notifications updated successfully!");
  } catch (err) {
    setError("Failed to save notifications: " + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, minHeight: "100vh", padding: "2rem" }}>
      <header style={headerStyle(neonColors)}>FTSA AI - SETTINGS</header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error">{error}</StatusBadge>}
      {successMsg && <StatusBadge status="success">{successMsg}</StatusBadge>}

      {!loading && (
        <div style={gridStyle}>
          {/* Profile Photo Card */}
<div style={cardStyle(neonColors)}>
  <h2 style={{ color: neonColors.neonGreen }}>Profile Photo</h2>

  <img
    src={
      profilePhoto instanceof File
        ? URL.createObjectURL(profilePhoto)
        : profilePhoto
          ? profilePhoto
          : "/default-profile.png"
    }
    alt="Profile"
    style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover", marginBottom: 10 }}
  />

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setProfilePhoto(e.target.files[0])}
    style={{ marginBottom: 10 }}
  />
  <button onClick={saveProfilePhoto} style={buttonStyle(neonColors)}>Save Photo</button>
</div>

{/* Profile Info Card */}
<div style={cardStyle(neonColors)}>
  <h2 style={{ color: neonColors.neonGreen }}>Profile Info</h2>

  {["firstName", "middleName", "email", "phone"].map((field) => (
    <input
      key={field}
      name={field}
      placeholder={field}
      value={profile[field]}
      onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
      style={inputStyle(neonColors)}
    />
  ))}

  <button onClick={saveProfile} style={buttonStyle(neonColors)}>Save Info</button>
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
