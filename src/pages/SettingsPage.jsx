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
const [photoFile, setPhotoFile] = useState(null);
const [photoUrl, setPhotoUrl] = useState(null);
const [photoSaving, setPhotoSaving] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Profile fields matching signup
  const [profile, setProfile] = useState({
    firstName: "",
    middleName: "",
    email: "",
    phone: "",
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
APIControl.fetchUserPhoto()
  .then(res => {
    if (res.success && res.data) { // <-- just check res.data
      setPhotoUrl(res.data);       // <-- res.data is already full URL
    }
  })
  .catch(() => {});

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
        });
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
          "Authorization": `Bearer ${token}`,
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
const handlePhotoSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setPhotoFile(file);
  setPhotoUrl(URL.createObjectURL(file)); // preview
};

const savePhoto = async () => {
  if (!photoFile) return;

  setPhotoSaving(true);
  setError(null);
  setSuccessMsg(null);

  const res = await APIControl.uploadUserPhoto(photoFile);

  if (!res.success) {
    setError(res.error || "Failed to save photo");
  } else {
    setSuccessMsg("Profile photo saved successfully!");
    setPhotoFile(null);
    setPhotoUrl(res.data); // update preview to uploaded photo

  }

  setPhotoSaving(false);
};

  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, minHeight: "100vh", padding: "2rem" }}>
      <header style={headerStyle(neonColors)}>FTSA AI - SETTINGS</header>

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}
      {error && <StatusBadge status="error">{error}</StatusBadge>}
      {successMsg && <StatusBadge status="success">{successMsg}</StatusBadge>}

      {!loading && (
        <div style={gridStyle}>
          {/* Profile photo Card */}
          <div style={cardStyle(neonColors)}>
  <h2 style={{ color: neonColors.neonBlue, textAlign: "center" }}>
    Profile Photo
  </h2>

  <div style={{ position: "relative", width: 160, height: 160, margin: "0 auto" }}>
    <img
      src={photoUrl || "/default-avatar.png"}
      alt="Profile"
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "50%",
        objectFit: "cover",
        border: `2px solid ${neonColors.neonBlue}`
      }}
    />

    <label
      style={{
        position: "absolute",
        bottom: 5,
        right: 5,
        cursor: "pointer",
        color: neonColors.neonBlue,
        fontWeight: "bold"
      }}
    >
      ✎
      <input type="file" hidden accept="image/*" onChange={handlePhotoSelect} />
    </label>
  </div>

  {photoFile && (
    <button
      onClick={savePhoto}
      disabled={photoSaving}
      style={buttonStyle(neonColors)}
    >
      {photoSaving ? "Saving..." : "Save Photo"}
    </button>
  )}
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
  gridTemplateColumns: "260px 1fr",
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
