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
  if (error) return <div className="error-msg">{error}</div>;
  if (!aboutData) return <div className="error-msg">No about data available</div>;

  return (
    <div className="about-page">
      <header className="help-header">
        <h1>FTSA AI</h1>
        <h2>About Us</h2>
      </header>

      <div className="help-cards">
        {Object.keys(SECTION_HEADERS).map((key) => {
          const sectionData = aboutData[key];
          if (!sectionData || (Array.isArray(sectionData) && sectionData.length === 0))
            return null;

          return (
            <Card
              key={key}
              title={SECTION_HEADERS[key]}
              data={sectionData}
              sectionKey={key}
            />
          );
        })}
      </div>

      <footer className="help-footer">
        FTSA AI — Powered by Kelvin Mburu Gathuru
      </footer>
    </div>
  );
};

const Card = ({ title, data, sectionKey }) => {
  const renderContent = () => {
    switch (sectionKey) {
      case "criticalNotices":
      case "keyFeatures":
        return (
          <ul className="answer-card">
            {data.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
      case "offices":
        return (
          <div className="answer-card">
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
          <div className="answer-card" style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {data.map(({ name, role, photo }, idx) => (
              <div key={idx} className="card">
                {photo && <img src={photo} alt={name} className="team-photo" />}
                <h4>{name}</h4>
                <p>{role}</p>
              </div>
            ))}
          </div>
        );
      case "roadmap":
        return (
          <ul className="answer-card">
            {data.map(({ item, eta }, idx) => (
              <li key={idx}>
                <strong>{item}</strong> {eta && <>— <em>{eta}</em></>}
              </li>
            ))}
          </ul>
        );
      case "whyExist":
        return <p className="answer-card" style={{ whiteSpace: "pre-wrap" }}>{data}</p>;
      default:
        return <pre>{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <section className="card">
      <h3 className="help-title">{title}</h3>
      {renderContent()}
    </section>
  );
};

export default AboutPage;
