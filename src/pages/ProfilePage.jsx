// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import LoadingSpinner from "../components/LoadingSpinner";
import StatusBadge from "../components/StatusBadge";

export default function ProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const neonColors = {
    background: "#111",
    neonBlue: "#00FFFF",
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await APIControl.fetchSettingsData(user.id);
        if (!data?.profile) {
          setError("No profile data found");
          return;
        }
        setProfile({
          firstName: data.profile.firstName || "",
          middleName: data.profile.middleName || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
        });
        setPhotoUrl(data.profile.photo || "/default-avatar.png");
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div style={centeredStyle(neonColors)}>Please login to view your profile.</div>
    );
  }

  if (loading) return <LoadingSpinner size={48} color={neonColors.neonBlue} />;
  if (error) return <StatusBadge status="error">{error}</StatusBadge>;

  return (
    <div style={{ backgroundColor: neonColors.background, color: neonColors.neonBlue, minHeight: "100vh", padding: "2rem" }}>
      <header style={headerStyle(neonColors)}>FTSA AI - PROFILE</header>

      <div style={gridStyle}>
        {/* Profile Photo Card */}
        <div style={photoCardStyle(neonColors)}>
          <img
            src={photoUrl}
            alt="Profile"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: 12,
              objectFit: "cover",
            }}
          />
        </div>

        {/* Profile Info Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {profile && Object.keys(profile).map((key) => (
            <div key={key} style={infoCardStyle(neonColors)}>
              <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {profile[key]}
            </div>
          ))}
        </div>
      </div>
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
  gridTemplateColumns: "1fr 2fr",
  gap: "2rem",
  alignItems: "start",
};

const photoCardStyle = (colors) => ({
  border: `2px solid ${colors.neonBlue}`,
  borderRadius: 12,
  padding: 10,
  maxWidth: 250,
  boxShadow: `0 0 15px ${colors.neonBlue}`,
});

const infoCardStyle = (colors) => ({
  border: `2px solid ${colors.neonBlue}`,
  borderRadius: 12,
  padding: "0.5rem 1rem",
  boxShadow: `0 0 10px ${colors.neonBlue}`,
});

const centeredStyle = (colors) => ({
  fontFamily: "'Orbitron', sans-serif",
  color: colors.neonBlue,
  padding: "4rem",
  textAlign: "center",
});
