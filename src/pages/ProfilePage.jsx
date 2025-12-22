// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(user?.profile || {
  photo: "",
  firstName: "",
  middleName: "",
  email: "",
  phone: "",
});



  // Fetch profile from Settings API
useEffect(() => {
  if (!isAuthenticated) return;

  setLoading(true);
  setError(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Fetch user info
      const userRes = await APIControl.fetchUserInfo();
      if (!userRes.success || !userRes.data) {
        setError("Failed to load user info");
        return;
      }

      // Fetch user photo
      const photoRes = await APIControl.fetchUserPhoto();
      const photoUrl = photoRes.success && photoRes.data ? photoRes.data : null;

      setProfile({
        firstName: userRes.data.firstName || "",
        middleName: userRes.data.middleName || "",
        email: userRes.data.email || "",
        phone: userRes.data.phone || "",
        photo: photoUrl || "",
      });
    } catch (err) {
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [isAuthenticated]);



  if (!isAuthenticated) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#FF0000" }}>
        Please login to view your profile.
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "'Orbitron', sans-serif", color: "#00FFFF", background: "#111", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", borderBottom: "2px solid #00FFFF", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
        FTSA AI Profile
      </header>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}
      {error && <p style={{ textAlign: "center", color: "#FFA500" }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            {/* Profile photo */}
           <div style={{
  border: "2px solid #00FFFF",
  borderRadius: 12,
  padding: 10,
  maxWidth: 250,
  boxShadow: "0 0 15px #00FFFF",
}}>
  <img
    src={profile.photo || "/default-avatar.png"}
    alt="Profile"
    style={{ width: "100%", height: "auto", borderRadius: 12, objectFit: "cover" }}
  />
</div>


            {/* Info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["firstName", "middleName", "email", "phone"].map((field) => (
  <div key={field} style={{
    border: "2px solid #00FFFF",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    maxWidth: 400,
    boxShadow: "0 0 10px #00FFFF"
  }}>
    <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {profile[field]}
  </div>
))}

            </div>
          </div>

        
        </>
      )}

      <footer style={{ textAlign: "center", borderTop: "1px solid #00FFFF", paddingTop: "1rem", color: "#00FFFF", fontSize: "0.9rem", marginTop: "2rem" }}>
        FTSA AI 0.V1 - Powered by KELVIN SPECTER © 2025
      </footer>
    </div>
  );
}
