// src/pages/AboutPage.jsx
import React, { useState, useEffect, useContext } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/AboutPage.css"; // Include neon styles & Orbitron font

const AboutPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAboutData() {
      try {
        setLoading(true);
        // Replace with real API call brain/APIControl.js
        const data = await fakeFetchAboutData();
        setAboutData(data);
      } catch (err) {
        setError("Failed to load about page data.");
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
        backgroundColor: "#000000",
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
      {criticalNotices && criticalNotices.length > 0 && (
        <section
          className="critical-notices neon-glow-border"
          style={{ marginBottom: "2rem", padding: "1rem", color: "#FF0000" }}
        >
          <h3>Critical Notices</h3>
          <ul>
            {criticalNotices.map((notice, i) => (
              <li key={i}>
                <StatusBadge text="ALERT" status="red" /> {notice}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Key Features */}
      <section className="key-features neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#00FFFF" }}>Key Features</h3>
        <ul>
          {keyFeatures.map((feature, i) => (
            <li key={i} style={{ marginBottom: "0.5rem" }}>
              <StatusBadge text="✓" status="green" /> {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Why FTSA AI exists */}
      <section className="why-exist neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#FFA500" }}>Why FTSA AI Exists</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{whyExist}</p>
      </section>

      {/* Powered By */}
      <section className="powered-by neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#00FF00" }}>Powered By</h3>
        <p>{poweredBy}</p>
      </section>

      {/* Offices / Location */}
      <section className="offices neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#00FFFF" }}>Our Offices / Location</h3>
        {offices.map(({ address, city, country, contact }, idx) => (
          <div key={idx} style={{ marginBottom: "1rem" }}>
            <p><strong>Address:</strong> {address}</p>
            <p><strong>City:</strong> {city}</p>
            <p><strong>Country:</strong> {country}</p>
            <p><strong>Contact:</strong></p>
            <ul>
              {contact.phone && <li>Phone: {contact.phone}</li>}
              {contact.email && <li>Email: {contact.email}</li>}
              {contact.whatsapp && <li>WhatsApp: {contact.whatsapp}</li>}
              {contact.chat && <li>Chat: {contact.chat}</li>}
            </ul>
          </div>
        ))}
      </section>

      {/* Team (show limited if not auth) */}
      <section className="team neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#00FFFF" }}>Our Team</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {(isAuthenticated ? team : team.slice(0, 2)).map(({ name, role, photo }, idx) => (
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
              <img
                src={photo}
                alt={`${name} photo`}
                style={{ width: "100%", borderRadius: "50%", marginBottom: "0.5rem" }}
              />
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

      {/* Roadmap */}
      <section className="roadmap neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3 style={{ color: "#FFA500" }}>Roadmap</h3>
        <ul>
          {roadmap.map(({ item, eta, status }, idx) => (
            <li key={idx} style={{ marginBottom: "0.75rem" }}>
              <StatusBadge
                text={status.toUpperCase()}
                status={
                  status === "completed"
                    ? "green"
                    : status === "in-progress"
                    ? "orange"
                    : status === "planned"
                    ? "blue"
                    : "red"
                }
              />{" "}
              <strong>{item}</strong> — <em>{eta}</em>
            </li>
          ))}
        </ul>
      </section>

      <footer style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}>
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
    </div>
  );
};

// Fake fetch function simulating brain/APIControl call
async function fakeFetchAboutData() {
  return new Promise((res) =>
    setTimeout(() => {
      res({
        keyFeatures: [
          "EA AI Trading Brain logic",
          "Brain AI",
          "Live market",
          "Live market sessions clock",
          "Self/Auto Trading App FTSA AI",
          "Journal Automation",
          "MT4 / MT5 / Binance / Propfirm multi-platform connectivity",
        ],
        whyExist:
          "FTSA AI was created to revolutionize trading by integrating AI-driven decision making with seamless multi-platform access, providing traders with unprecedented insights and automation.",
        poweredBy: "KELVIN SPECTER (MBURU G)",
        offices: [
          {
            address: "123 AI Tech Park",
            city: "Nairobi",
            country: "Kenya",
            contact: {
              phone: "+254 700 000 000",
              email: "contact@ftsa.ai",
              whatsapp: "+254 712 345 678",
              chat: "Live Chat Support",
            },
          },
        ],
        team: [
          {
            name: "Kelvin Mburu",
            role: "Founder & CEO",
            photo: "https://randomuser.me/api/portraits/men/45.jpg",
          },
          {
            name: "Mary Stacy",
            role: "Lead Developer",
            photo: "https://randomuser.me/api/portraits/women/65.jpg",
          },
          {
            name: "Triza Njoroge",
            role: "AI Specialist",
            photo: "https://randomuser.me/api/portraits/women/33.jpg",
          },
          {
            name: "John Doe",
            role: "Marketing Head",
            photo: "https://randomuser.me/api/portraits/men/32.jpg",
          },
        ],
        roadmap: [
          { item: "Mobile App Launch", eta: "Q4 2025", status: "planned" },
          { item: "Binance Integration", eta: "Q3 2025", status: "in-progress" },
          { item: "AI Chat Bot Support", eta: "Q1 2026", status: "planned" },
          { item: "Journal Automation v2", eta: "Q2 2025", status: "completed" },
        ],
        criticalNotices: ["Scheduled maintenance on 2025-09-10 from 1AM to 5AM UTC."],
      });
    }, 800)
  );
}

export default AboutPage;
