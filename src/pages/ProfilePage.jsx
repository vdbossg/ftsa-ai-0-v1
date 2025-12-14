//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\src\pages\ProfilePage.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    profilePhoto: "",
    firstName: "",
    middleName: "",
    sirName: "",
    email: "",
    country: "",
    phoneNumber: "",
    phoneCode: "+254"
  });

  useEffect(() => {
    if (!user) return;
    async function fetchProfile() {
      const data = await APIControl.fetchProfile(user.id);
      setProfile(data);
    }
    fetchProfile();
  }, [user]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  
  const handleSave = async () => {
    await APIControl.updateProfile(profile);
    alert("Profile updated!");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "'Orbitron', sans-serif", color: "#00FFFF", background: "#111", minHeight: "100vh" }}>
      <header style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", borderBottom: "2px solid #00FFFF", paddingBottom: "0.5rem", marginBottom: "2rem" }}>
        FTSA AI Profile
      </header>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        {/* Profile photo */}
        <div>
          <img src={profile.profilePhoto || "https://via.placeholder.com/150"} alt="Profile" style={{ borderRadius: "8px", width: 150, height: 150, objectFit: "cover" }} />
          <NeonButton onClick={async () => {
            const url = prompt("Enter profile photo URL", profile.profilePhoto);
            if (!url) return;
            setProfile(prev => ({ ...prev, profilePhoto: url }));
          }} style={{ marginTop: "1rem" }}>Change Photo</NeonButton>
        </div>

        {/* Info cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {["firstName", "middleName", "sirName", "email", "country", "phoneNumber"].map(field => (
            <div key={field} style={{ border: "2px solid #00FFFF", borderRadius: "8px", padding: "0.5rem 1rem", display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
              <strong>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
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
        <NeonButton onClick={handleSave} style={{ minWidth: 160 }}>Save Profile</NeonButton>
      </div>

      <footer style={{ textAlign: "center", borderTop: "1px solid #00FFFF", paddingTop: "1rem", color: "#00FFFF", fontSize: "0.9rem", marginTop: "2rem" }}>
        FTSA AI 0.V1 - Powered by KELVIN SPECTER © 2025
      </footer>
    </div>
  );
}
