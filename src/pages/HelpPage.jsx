// src/pages/HelpPage.jsx
import React, { useState, useEffect, useContext } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from "../contexts/AuthContext";

import "../styles/HelpPage.css"; // Create styling with neon theme & Orbitron font

const HelpPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [ticketForm, setTicketForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    async function fetchHelpData() {
      try {
        setLoading(true);
        // Replace with real brain/APIControl calls
        const fetchedFaqs = await fakeFetchFaqs();
        const fetchedStatus = await fakeFetchSystemStatus();
        setFaqs(fetchedFaqs);
        setFilteredFaqs(fetchedFaqs);
        setSystemStatus(fetchedStatus);
      } catch (error) {
        console.error("Error fetching help data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHelpData();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredFaqs(faqs);
    } else {
      setFilteredFaqs(
        faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, faqs]);

  const fakeFetchFaqs = async () => {
    return new Promise((res) =>
      setTimeout(() => {
        res([
          {
            id: 1,
            question: "How do I reset my password?",
            answer:
              "Go to your profile settings and click 'Change Password'. Follow the instructions.",
            status: "info",
          },
          {
            id: 2,
            question: "Why can't I connect to MT4?",
            answer:
              "Check your internet connection and server settings. Contact support if the issue persists.",
            status: "warning",
          },
          {
            id: 3,
            question: "How can I withdraw my commissions?",
            answer:
              "Use the withdrawal panel on the Affiliates page and follow the prompts.",
            status: "success",
          },
          {
            id: 4,
            question: "Why is Binance offline?",
            answer: "There is a temporary outage. Our team is working to resolve it.",
            status: "error",
          },
        ]);
      }, 800)
    );
  };

  const fakeFetchSystemStatus = async () => {
    return new Promise((res) =>
      setTimeout(() => {
        res({
          MT4: "Online",
          MT5: "Online",
          Binance: "Offline",
          AffiliateSystem: "Online",
          FTSAAI: "Online",
        });
      }, 500)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTicketForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendTicket = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = "/login"; // Redirect unauthenticated users to login
      return;
    }

    setSending(true);
    setSendSuccess(null);
    try {
      // Replace with real brain/APIControl send ticket call
      await new Promise((res) => setTimeout(res, 1000));
      setSendSuccess(true);
      setTicketForm((prev) => ({ ...prev, subject: "", message: "" }));
    } catch (err) {
      console.error(err);
      setSendSuccess(false);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div
      className="help-page"
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
        <h2>NEED HELP?</h2>
      </header>

      {/* Quick Help Panel */}
      <section className="quick-help neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3>QUICK HELP</h3>
        <ul>
          <li><a href="#faq" style={{ color: "#00FFFF" }}>FAQ</a></li>
          <li><a href="#contact-support" style={{ color: "#00FFFF" }}>CONTACT SUPPORT</a></li>
          <li><a href="#video-tutorials" style={{ color: "#00FFFF" }}>VIDEO TUTORIALS</a></li>
          <li><a href="#system-status" style={{ color: "#00FFFF" }}>SYSTEM STATUS</a></li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3>FREQUENTLY ASKED QUESTIONS</h3>
        <input
          type="search"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            fontFamily: "Orbitron, sans-serif",
            marginBottom: "1rem",
            border: "1px solid #00FFFF",
            borderRadius: "6px",
            backgroundColor: "#000",
            color: "#00FFFF",
            outline: "none",
            boxShadow: "0 0 10px #00FFFF",
          }}
        />

        {filteredFaqs.length === 0 && <p>No matching FAQs found.</p>}

        <div>
          {filteredFaqs.map(({ id, question, answer, status }) => (
            <details key={id} className="faq-card neon-glow-border" style={{ marginBottom: "1rem", padding: "1rem", borderRadius: "8px" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                {question}{" "}
                <StatusBadge
                  text={status.toUpperCase()}
                  status={
                    status === "success"
                      ? "green"
                      : status === "warning"
                      ? "orange"
                      : status === "error"
                      ? "red"
                      : "blue"
                  }
                />
              </summary>
              <p style={{ marginTop: "0.5rem" }}>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Support */}
      <section id="contact-support" className="contact-support neon-glow-border" style={{ marginBottom: "2rem" }}>
        <h3>Contact Support</h3>
        <form onSubmit={handleSendTicket} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name / Username"
            value={ticketForm.fullName}
            onChange={handleInputChange}
            required
            style={inputStyle}
            disabled={!!user?.fullName}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={ticketForm.email}
            onChange={handleInputChange}
            required
            style={inputStyle}
            disabled={!!user?.email}
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={ticketForm.subject}
            onChange={handleInputChange}
            required
            style={inputStyle}
          />
          <textarea
            name="message"
            placeholder="Message"
            value={ticketForm.message}
            onChange={handleInputChange}
            rows={5}
            required
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <NeonButton type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Message"}
          </NeonButton>
        </form>
        {sendSuccess === true && (
          <p style={{ color: "#00FF00", marginTop: "1rem" }}>
            Your message was sent, we will get back to you shortly.
          </p>
        )}
        {sendSuccess === false && (
          <p style={{ color: "#FF0000", marginTop: "1rem" }}>
            Failed to send message. Please try again later.
          </p>
        )}
      </section>

      {/* System Status */}
      <section id="system-status" className="system-status neon-glow-border">
        <h3>System Status</h3>
        {systemStatus ? (
          <ul>
            {Object.entries(systemStatus).map(([system, status]) => (
              <li key={system} style={{ marginBottom: "0.5rem" }}>
                <strong>{system}:</strong>{" "}
                <StatusBadge
                  text={status}
                  status={
                    status === "Online"
                      ? "green"
                      : status === "Offline"
                      ? "red"
                      : "orange"
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>Loading system status...</p>
        )}
      </section>

      <footer style={{ marginTop: "3rem", textAlign: "center", color: "#00FFFF" }}>
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
    </div>
  );
};

const inputStyle = {
  backgroundColor: "#000",
  border: "1px solid #00FFFF",
  borderRadius: "6px",
  padding: "0.5rem",
  color: "#00FFFF",
  fontFamily: "Orbitron, sans-serif",
  outline: "none",
  boxShadow: "0 0 10px #00FFFF",
};

export default HelpPage;
