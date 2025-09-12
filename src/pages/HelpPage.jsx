// src/pages/HelpPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import Modal from "../components/Modal";
import { fetchFAQs, fetchSupportChannels, createTicket } from "../api/supportApi";
import FAQItem from "../components/FAQItem";
import ContactSection from "../components/ContactSection";
import HelpModal from "../components/HelpModal";
import QuickLinks from "../components/QuickLinks";
import "../styles/HelpPage.css";

const HelpPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  // State
  const [loading, setLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({ email: "", phone: [], whatsapp: "" });

  // Fetch FAQs and contact info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [faqData, channelData] = await Promise.all([fetchFAQs(), fetchSupportChannels()]);
        setFaqs(faqData);
        setFilteredFaqs(faqData);
        setContactInfo(channelData.contactInfo);
      } catch (err) {
        console.error("Error fetching help data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter FAQs (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchTerm) setFilteredFaqs(faqs);
      else
        setFilteredFaqs(
          faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
          )
        );
    }, 300); // 300ms debounce
    return () => clearTimeout(timer);
  }, [searchTerm, faqs]);

  

  const openTicketModal = () => {
  if (!isAuthenticated) return (window.location.href = "/login");
  setTicketModalOpen(true);
};

  if (loading) return <LoadingSpinner />;

  return (
    <div className="help-page">
      {/* Header */}
      <header className="help-header">
        <h1>FTSA AI</h1>
        <h2>Need Help?</h2>
      </header>

      {/* Quick Links */}
      <QuickLinks links={[{ title: "FAQ", href: "#faq" }, { title: "Contact Support", href: "#contact-support" }]} />

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <input
          type="search"
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="faq-search-input"
        />
        {filteredFaqs.length === 0 ? (
          <p className="no-faq">No FAQs found.</p>
        ) : (
          filteredFaqs.map((faq) => <FAQItem key={faq._id || faq.id} question={faq.question} answer={faq.answer} />)
        )}
      </section>

      {/* Contact Section */}
      <section id="contact-support" className="contact-section">
        <ContactSection
          contactInfo={contactInfo}
          onOpenTicket={openTicketModal}
          ticketButtonLabel="Create Ticket"
        />
      </section>

      {/* Ticket Modal */}
     {ticketModalOpen && (
  <HelpModal
    type="SMS"
    user={user}
    onClose={() => setTicketModalOpen(false)}
  />
)}


      {/* Footer */}
      <footer className="help-footer">
        <p>FTSA AI © 2025</p>
      </footer>
    </div>
  );
};

export default HelpPage;
