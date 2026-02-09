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

  useEffect(() => {
    fetchAboutData();
    const interval = setInterval(fetchAboutData, 2000); // silent refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-msg neon-red">{error}</div>;
  if (!aboutData) return <div className="error-msg neon-orange">No about data available</div>;

  return (
    <div className="about-page">
      <header className="help-header">
        <h1 className="neon-blue">FTSA AI</h1>
        <h2 className="neon-green">About Us</h2>
      </header>

      <div className="help-cards">

        {/* CRITICAL ALERT */}
        {aboutData.criticalNotices && aboutData.criticalNotices.length > 0 && (
          <section className="card neon-glow critical-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.criticalNotices}</h3>
            <ul className="card-list neon-green">
              {aboutData.criticalNotices.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* KEY FEATURES */}
        {aboutData.keyFeatures && aboutData.keyFeatures.length > 0 && (
          <section className="card neon-glow features-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.keyFeatures}</h3>
            <ul className="card-list neon-green">
              {aboutData.keyFeatures.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* OUR OFFICES */}
        {aboutData.offices && aboutData.offices.length > 0 && (
          <section className="card neon-glow offices-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.offices}</h3>
            <div className="card-grid">
              {aboutData.offices.map(({ address, city, country, contact }, idx) => (
                <div key={idx} className="sub-card office-card neon-blue">
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
          </section>
        )}

        {/* FTSA TEAM */}
        {aboutData.team && aboutData.team.length > 0 && (
          <section className="card neon-glow team-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.team}</h3>
            <div className="card-grid team-grid">
              {aboutData.team.map(({ name, role, photo }, idx) => (
                <div key={idx} className="sub-card team-member-card neon-blue">
                  {photo && <img src={photo} alt={name} className="team-photo" />}
                  <h4>{name}</h4>
                  <p>{role}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ROAD MAP */}
        {aboutData.roadmap && aboutData.roadmap.length > 0 && (
          <section className="card neon-glow roadmap-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.roadmap}</h3>
            <ul className="card-list neon-orange">
              {aboutData.roadmap.map(({ item, eta }, idx) => (
                <li key={idx}>
                  <strong>{item}</strong>{eta && <> — <em>{eta}</em></>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* GENERAL ABOUT */}
        {aboutData.whyExist && (
          <section className="card neon-glow general-card">
            <h3 className="card-title neon-blue">{SECTION_HEADERS.whyExist}</h3>
            <p className="card-text neon-green" style={{ whiteSpace: "pre-wrap" }}>
              {aboutData.whyExist}
            </p>
          </section>
        )}

      </div>

      <footer className="help-footer neon-blue">
        FTSA AI — Powered by Kelvin Mburu Gathuru
      </footer>
    </div>
  );
};

export default AboutPage;
