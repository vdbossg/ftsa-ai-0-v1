// src/components/ContactSection.jsx
import React from "react";
import "../styles/ContactSection.css";

const ContactSection = ({ contactInfo, onOpenTicket, ticketButtonLabel }) => {
  return (
    <div className="contact-section-content">
      <button className="ticket-button" onClick={onOpenTicket}>
        {ticketButtonLabel}
      </button>
      <div className="contact-info">
        {contactInfo.email && <p>Email: {contactInfo.email}</p>}
        {contactInfo.phone && contactInfo.phone.map((p, idx) => <p key={idx}>Phone: {p}</p>)}
        {contactInfo.whatsapp && <p>WhatsApp: {contactInfo.whatsapp}</p>}
      </div>
    </div>
  );
};

export default ContactSection;
