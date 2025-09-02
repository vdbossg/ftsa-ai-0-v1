// src/pages/HelpPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import HelpModal from "../components/HelpModal"; // New modal
import { fetchFAQs, fetchSupportChannels } from "../api/supportApi";

import "../styles/HelpPage.css";

const HelpPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState("");
  const [supportChannels, setSupportChannels] = useState({});
  const [contactInfo, setContactInfo] = useState({ email: "", phone: "" });

  // Fetch FAQs and support info
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [faqData, channelData] = await Promise.all([
          fetchFAQs(),
          fetchSupportChannels(),
        ]);
        setFaqs(faqData);
        setFilteredFaqs(faqData);
        setSupportChannels(channelData.channels);
        setContactInfo(channelData.contactInfo);
      } catch (err) {
        console.error("Error fetching help data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter FAQs
  useEffect(() => {
    if (!searchTerm) setFilteredFaqs(faqs);
    else {
      setFilteredFaqs(
        faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, faqs]);

  const openTicketModal = (type) => {
    if (!isAuthenticated) return (window.location.href = "/login");
    setTicketType(type);
    setTicketModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div
      className="help-page"
      style={{
        fontFamily: "Orbitron, sans-serif",
        backgroundColor: "#000",
        color: "#00FFFF",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <header className="appbar" style={{ marginBottom: "2rem" }}>
        <h1>FTSA AI</h1>
        <h2>Need Help?</h2>
      </header>

      {/* Quick Help Panel */}
      <section className="quick-help" style={{ marginBottom: "2rem" }}>
        <h3>Quick Help</h3>
        <ul
          style={{
            listStyle: "none",
            paddingLeft: 0,
            display: "flex",
            gap: "1rem",
          }}
        >
          <li>
            <a href="#faq" style={{ color: "#00FFFF" }}>
              FAQ
            </a>
          </li>
          <li>
            <a href="#contact-support" style={{ color: "#00FFFF" }}>
              Contact Support
            </a>
          </li>
          <li>
            <a href="#video-tutorials" style={{ color: "#00FFFF" }}>
              Video Tutorials
            </a>
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ marginBottom: "2rem" }}>
        <h3>Frequently Asked Questions</h3>
        <input
          type="search"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #00FFFF",
            borderRadius: "6px",
            backgroundColor: "#000",
            color: "#00FFFF",
            outline: "none",
          }}
        />
        {filteredFaqs.length === 0 && <p>No FAQs found.</p>}
        {filteredFaqs.map((faq) => (
          <details
            key={faq._id || faq.id}
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              border: "1px solid #00FFFF",
              borderRadius: "8px",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              {faq.question}
            </summary>
            <p style={{ marginTop: "0.5rem" }}>{faq.answer}</p>
          </details>
        ))}
      </section>

      {/* Contact Support */}
      <section id="contact-support" style={{ marginBottom: "2rem" }}>
        <h3>Contact Support</h3>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {supportChannels.whatsapp && (
            <button
              onClick={() => openTicketModal("WhatsApp")}
              style={channelButtonStyle}
            >
              WhatsApp
            </button>
          )}
          {supportChannels.sms && (
            <button
              onClick={() => openTicketModal("SMS")}
              style={channelButtonStyle}
            >
              SMS
            </button>
          )}
          {supportChannels.email && (
            <button
              onClick={() => openTicketModal("Email")}
              style={channelButtonStyle}
            >
              Email
            </button>
          )}
        </div>
      </section>

      {/* Ticket Modal */}
      {ticketModalOpen && (
        <HelpModal
          onClose={() => setTicketModalOpen(false)}
          type={ticketType}
          user={user}
        />
      )}

      {/* Footer */}
      <footer style={{ marginTop: "3rem", textAlign: "center" }}>
        <p>
          Email: {contactInfo.email} | Phone: {contactInfo.phone}
        </p>
        <p style={{ marginTop: "1rem" }}>FTSA AI © 2025</p>
      </footer>
    </div>
  );
};

const channelButtonStyle = {
  padding: "0.5rem 1rem",
  backgroundColor: "#00FFFF",
  color: "#000",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default HelpPage;
