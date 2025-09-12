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
        {contactInfo.email && (
          <p>
            Email: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
          </p>
        )}

        {contactInfo.phone && contactInfo.phone.map((p, idx) => (
          <p key={idx}>
            Phone: <a href={`tel:${p}`}>{p}</a>
          </p>
        ))}

        {contactInfo.whatsapp && (
          <p>
            WhatsApp:{" "}
            <a
              href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contactInfo.whatsapp}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ContactSection;
