// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({
    profitPhoto: "",
    firstName: "",
    middleName: "",
    sirName: "",
    email: "",
    country: "",
    phoneNumber: "",
    phoneCode: "+254",
  });

  // Fetch profile from Settings API
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await APIControl.fetchSettingsData(user.id);
        if (!data?.profile) {
          setError("No profile data found");
          setLoading(false);
          return;
        }
        setProfile(data.profile);
      } catch (err) {
        setError(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfile((prev) => ({ ...prev, profitPhoto: file }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      // Save using Settings API
      const formData = new FormData();
      Object.keys(profile).forEach((key) => {
        if (profile[key] !== undefined) {
          if (key === "profitPhoto" && profile[key] instanceof File) {
            formData.append(key, profile[key]);
          } else {
            formData.append(key, profile[key]);
          }
        }
      });

      const result = await APIControl.saveProfileData(formData, user.id);
      if (!result.success) throw new Error(result.error || "Save failed");

      alert("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

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
            <div>
              <img
                src={
                  profile.profitPhoto instanceof File
                    ? URL.createObjectURL(profile.profitPhoto)
                    : profile.profitPhoto || "https://via.placeholder.com/150"
                }
                alt="Profile"
                style={{ borderRadius: "8px", width: 150, height: 150, objectFit: "cover" }}
              />
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ marginTop: "0.5rem" }} />
            </div>

            {/* Info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {["firstName", "middleName", "sirName", "email", "country", "phoneNumber"].map((field) => (
                <div
                  key={field}
                  style={{ border: "2px solid #00FFFF", borderRadius: "8px", padding: "0.5rem 1rem", display: "flex", justifyContent: "space-between", maxWidth: 400 }}
                >
                  <strong>{field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}</strong>
                  <input
                    type="text"
                    name={field}
                    value={profile[field]}
                    onChange={handleChange}
                    style={{ background: "#111", color: "#00FFFF", border: "1px solid #00FFFF", borderRadius: "4px", padding: "0.2rem 0.5rem" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <NeonButton onClick={handleSave} style={{ minWidth: 160 }}>
              Save Profile
            </NeonButton>
          </div>
        </>
      )}

      <footer style={{ textAlign: "center", borderTop: "1px solid #00FFFF", paddingTop: "1rem", color: "#00FFFF", fontSize: "0.9rem", marginTop: "2rem" }}>
        FTSA AI 0.V1 - Powered by KELVIN SPECTER © 2025
      </footer>
    </div>
  );
}
