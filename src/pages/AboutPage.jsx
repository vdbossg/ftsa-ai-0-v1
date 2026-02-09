// src/pages/AboutPage.jsx
import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import "../styles/AboutPage.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const SECTION_HEADERS = {
  criticalNotices: "CRITICAL ALERT",
  keyFeatures: "KEY FEATURES",
  offices: "OUR OFFICES",
  team: "FTSA TEAM",
  roadmap: "ROAD MAP",
  whyExist: "GENERAL ABOUT",
};

const AboutPage = () => {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch About Data
  const fetchAboutData = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/aboutfullData`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      setAboutData(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + silent background refresh every 2 seconds
  useEffect(() => {
    fetchAboutData();
    const interval = setInterval(fetchAboutData, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="error-msg neon-glow-border">
        {error} — Please check your backend.
      </div>
    );
  if (!aboutData)
    return (
      <div className="error-msg neon-glow-border">
        About data not available. Please update from admin panel.
      </div>
    );

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

      {/* Render dynamic cards */}
      {Object.keys(SECTION_HEADERS).map((key) => {
        const sectionData = aboutData[key];
        if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0))
          return null;

        return (
          <Card key={key} title={SECTION_HEADERS[key]} data={sectionData} sectionKey={key} />
        );
      })}

      {/* Footer */}
      <footer style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}>
        FTSA AI — Powered by Kelvin Mburu Gathuru
      </footer>
    </div>
  );
};

// Card component to handle all sections dynamically
const Card = ({ title, data, sectionKey }) => {
  const renderContent = () => {
    switch (sectionKey) {
      case "criticalNotices":
      case "keyFeatures":
        return (
          <ul>
            {data.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem" }}>
                {item}
              </li>
            ))}
          </ul>
        );
      case "offices":
        return (
          <div>
            {data.map(({ address, city, country, contact }, idx) => (
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
          </div>
        );
      case "team":
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {data.map(({ name, role, photo }, idx) => (
              <div
                key={idx}
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
          </div>
        );
      case "roadmap":
        return (
          <ul>
            {data.map(({ item, eta }, idx) => (
              <li key={idx} style={{ marginBottom: "0.75rem" }}>
                <strong>{item}</strong> {eta && <>— <em>{eta}</em></>}
              </li>
            ))}
          </ul>
        );
      case "whyExist":
        return <p style={{ whiteSpace: "pre-wrap" }}>{data}</p>;
      default:
        return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <section
      className="neon-glow-border"
      style={{
        marginBottom: "2rem",
        padding: "1rem",
      }}
    >
      <h3 style={{ marginBottom: "1rem", color: "#00FFFF" }}>{title}</h3>
      {renderContent()}
    </section>
  );
};

export default AboutPage;
