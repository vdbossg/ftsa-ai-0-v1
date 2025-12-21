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

  // Profile fields matching signup
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    email: "",
    phone: "",
    profitPhoto: "",
  });

  // Notifications
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

  // Fetch current user profile on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("authToken");

    APIControl.fetchUserInfo()
  .then((res) => {
    if (!res || !res.success) {
      setError(res?.error || "Failed to load profile data");
      return;
    }

    const data = res.data;
setProfile({
  firstName: data.firstName || "",
  middleName: data.middleName || "",
  email: data.email || "",
  phone: data.phone || "",
  profitPhoto: data.profitPhoto || "",
});

// ===== LOAD NOTIFICATIONS =====
if (data.notifications) {
  setNotifications(data.notifications);
}

  })
  .catch((err) => setError("Failed to load profile: " + (err?.message || "")))
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
  const handleToggleNotifications = (key) => {
  setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
};

// ===== SAVE NOTIFICATIONS =====
const saveNotifications = async () => {
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const result = await APIControl.saveNotificationSettings(notifications); // <-- use this
    if (!result.success) throw new Error(result.error || "Failed to save notifications");
    setSuccessMsg("Notification settings saved!");
  } catch (err) {
    setError("Failed to save notifications: " + err.message);
  } finally {
    setLoading(false);
  }
};

  // Save profile (firstName, middleName, email, phone)
  const saveProfile = async () => {
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const token = localStorage.getItem("authToken");

    const res = await fetch(`${BACKEND_URL}/api/user/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // if your API requires it
      },
      body: JSON.stringify({
        firstName: profile.firstName,
        middleName: profile.middleName,
        email: profile.email,
        phone: profile.phone,
      }),
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.error || "Save failed");

    setSuccessMsg("Profile saved successfully!");
    if (updateUser) updateUser(result.data);
  } catch (err) {
    setError("Failed to save profile: " + err.message);
  } finally {
    setLoading(false);
  }
};

   //Save photo
  const savePhoto = async () => {
  if (!profile.profitPhoto) return setError("No photo selected");
  setLoading(true);
  setError(null);
  setSuccessMsg(null);

  try {
    const formData = new FormData();
    formData.append("profitPhoto", profile.profitPhoto);

    const res = await fetch(`${BACKEND_URL}/api/profile/photo`, {
      method: "POST",
      body: formData,
    });

    const result = await res.json();

    if (!result.success) throw new Error(result.error || "Photo upload failed");

    setProfile((prev) => ({ ...prev, profitPhoto: result.data.profitPhoto }));
    setSuccessMsg("Profile photo updated!");
  } catch (err) {
    setError("Failed to save photo: " + err.message);
  } finally {
    setLoading(false);
  }
};

  // Save notifications
 
  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, minHeight: "100vh", padding: "2rem" }}>
      <header style={headerStyle(neonColors)}>FTSA AI - SETTINGS</header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error">{error}</StatusBadge>}
      {successMsg && <StatusBadge status="success">{successMsg}</StatusBadge>}

      {!loading && (
        <div style={gridStyle}>
          {/* Photo Edit Card */}
<div style={cardStyle(neonColors)}>
  <h2 style={{ color: neonColors.neonGreen }}>Profile Photo</h2>

  <img
    src={
      profile.profitPhoto instanceof File
        ? URL.createObjectURL(profile.profitPhoto)
        : profile.profitPhoto
          ? `${BACKEND_URL}/${profile.profitPhoto.replace(/\\/g, "/")}`
          : "/default-profile.png"
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
  <button onClick={savePhoto} style={buttonStyle(neonColors)}>Save Photo</button>
</div>

   
          {/* Profile Info Card */}
          <div style={cardStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonBlue }}>Profile Info</h2>

            {["firstName", "middleName", "email", "phone"].map((field) => (
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

          {/* Notifications Card */}
          <div style={cardStyle(neonColors)}>
            <h2 style={{ color: neonColors.neonOrange }}>Notifications</h2>
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

// STYLES (kept from original)
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
