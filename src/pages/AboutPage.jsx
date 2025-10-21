// src/pages/AboutPage.jsx
import React, { useState, useEffect, useContext } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/AboutPage.css";

const AboutPage = () => {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch About page data from admin panel
  useEffect(() => {
  async function fetchAboutData() {
    try {
      setLoading(true);

      // 🔹 DEBUG: check backend URL
      console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);


      // Fetch About page data from backend
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
console.log("Using backend URL:", backendUrl);

const response = await fetch(`${backendUrl}/api/about/public`, {
  headers: {
    "Content-Type": "application/json",
  },
});


if (!response.ok) {
  throw new Error(`Failed to fetch about data: ${response.status}`);
}

const data = await response.json(); // parse JSON directly
setAboutData(data);


    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  fetchAboutData();
}, []);


  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-msg neon-glow-border">{error}</div>;

 const { 
  keyFeatures, 
  whyExist, 
  poweredBy, 
  offices, 
  team, 
  roadmap, 
  criticalNotices, 
} = aboutData || {};

  return (
    <div
      className="about-page"
      style={{
        backgroundColor: "#000",
        color: "#00FFFF",
        fontFamily: "Orbitron, sans-serif",
        minHeight: "100vh",
        padding: "2rem",
        overflowY: "auto",
      }}
    >
      <header className="appbar" style={{ marginBottom: "2rem" }}>
        <h1>FTSA AI</h1>
        <h2>About Us</h2>
      </header>

      {/* Critical Notices */}
      {criticalNotices?.length > 0 && (
        <section
          className="critical-notices neon-glow-border"
          style={{
            marginBottom: "2rem",
            padding: "1rem",
            color: "#FF5555",
          }}
        >
          <h3>Critical Notices</h3>
          <ul>
            {criticalNotices.map((notice, idx) => (
              <li key={idx}>
                <StatusBadge text="ALERT" status="red" /> {notice}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Features */}
      {keyFeatures?.length > 0 && (
        <section className="key-features neon-glow-border" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#00FFFF" }}>Key Features</h3>
          <ul>
            {keyFeatures.map((feature, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                {feature}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Purpose / Why Exists */}
      {whyExist && (
        <section className="why-exist neon-glow-border" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#FFA500" }}>Our Purpose</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{whyExist}</p>
        </section>
      )}

      {/* Powered By */}
      <section className="powered-by neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#00FF00" }}>Powered By</h3>
        <p>{poweredBy || "Kelvin Mburu Gathuru — Founder & CEO"}</p>
      </section>

      {/* Offices */}
      {offices?.length > 0 && (
        <section className="offices neon-glow-border" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#00FFFF" }}>Our Offices / Location</h3>
          {offices.map(({ address, city, country, contact }, idx) => (
            <div key={idx} style={{ marginBottom: "1rem" }}>
              <p><strong>Address:</strong> {address}</p>
              <p><strong>City:</strong> {city}</p>
              <p><strong>Country:</strong> {country}</p>
              {contact && (
                <ul>
                  {contact.phone && <li>Phone: {contact.phone}</li>}
                  {contact.email && <li>Email: {contact.email}</li>}
                  {contact.whatsapp && <li>WhatsApp: {contact.whatsapp}</li>}
                  {contact.chat && <li>Chat: {contact.chat}</li>}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Team */}
      {team?.length > 0 && (
        <section className="team neon-glow-border" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#00FFFF" }}>Our Team</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {(isAuthenticated ? team : team.slice(0, 1)).map(({ name, role, photo }, idx) => (
              <div
                key={idx}
                className="team-card neon-glow-border"
                style={{
                  backgroundColor: "#111",
                  borderRadius: "10px",
                  padding: "1rem",
                  width: "200px",
                  textAlign: "center",
                  boxShadow: "0 0 10px #00FFFF",
                }}
              >
                {photo && (
                  <img
                    src={photo}
                    alt={name}
                    style={{ width: "100%", borderRadius: "50%", marginBottom: "0.5rem" }}
                  />
                )}
                <h4>{name}</h4>
                <p>{role}</p>
              </div>
            ))}
            {!isAuthenticated && (
              <p style={{ color: "#FFA500", marginTop: "1rem" }}>
                Login to see the full team.
              </p>
            )}
          </div>
        </section>
      )}


      {/* Roadmap */}
      {roadmap?.length > 0 && (
        <section className="roadmap neon-glow-border" style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "#FFA500" }}>Roadmap</h3>
          <ul>
            {roadmap.map(({ item, eta }, idx) => (
              <li key={idx} style={{ marginBottom: "0.75rem" }}>
                <strong>{item}</strong> — <em>{eta}</em>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer */}
      <footer style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}>
        FTSA AI — Powered by Kelvin Mburu Gathuru
      </footer>
    </div>
  );
};

export default AboutPage;
