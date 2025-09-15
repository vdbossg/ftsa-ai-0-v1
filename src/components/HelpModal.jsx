// src/components/HelpModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { fetchTicketCategories, createTicket } from "../api/supportApi";
import "../styles/TicketModal.css";

const HelpModal = ({ onClose, type, user }) => {
  // --- Local state for form fields ---
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(null);
  const [categories, setCategories] = useState([]);

  const modalRef = useRef(null);

  // --- Generate ticket number ---
  const generateTicketNumber = (type) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const typeLower = type.toLowerCase();
    const typeCode =
      typeLower === "email"
        ? "Emailftsa-help"
        : typeLower === "sms"
        ? "SMSftsa-help"
        : typeLower === "whatsapp"
        ? "WhatsAppftsa-help"
        : "Otherftsa-help";

    const serial = `${Math.floor(Math.random() * 900 + 100)}${String.fromCharCode(
      65 + Math.floor(Math.random() * 26)
    )}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${now.getMilliseconds()}`;

    return `#${serial}-${typeCode}-${day}/${month}/${year}`;
  };

  // --- Fetch categories & initialize ticket number ---
  useEffect(() => {
    const initializeModal = async () => {
      try {
        const data = await fetchTicketCategories();
        setCategories(data);
        setTicketNumber(generateTicketNumber(type));
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    initializeModal();
  }, [type]);

  // --- Close modal on ESC key ---
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // --- Focus trap inside modal ---
  useEffect(() => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTab = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalRef.current.addEventListener("keydown", handleTab);
    return () => modalRef.current.removeEventListener("keydown", handleTab);
  }, []);

  // --- Handle form submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !message) return;

    setSending(true);
    setSendSuccess(null);

    const newTicketNumber = generateTicketNumber(type);
    setTicketNumber(newTicketNumber);

    try {
      const ticket = await createTicket({
        ticketNumber: newTicketNumber,
        userId: user?.id,
        type,
        fullName,
        email,
        category,
        message,
      });

      setTicketNumber(ticket.number || newTicketNumber);
      setSendSuccess(true);
      setMessage("");
      setCategory("");
    } catch (err) {
      console.error(err);
      setSendSuccess(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="ticket-modal-overlay">
      <div
        className="ticket-modal"
        ref={modalRef}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        <h2 id="modal-title">Support Ticket ({type})</h2>
        <p className="ticket-number">
          Ticket Number: <strong>{ticketNumber}</strong>
        </p>

        {sendSuccess === true && (
          <p className="ticket-success">
            Your ticket has been submitted and is in the queue. Our support will contact you shortly.
          </p>
        )}
        {sendSuccess === false && (
          <p className="ticket-error">Failed to submit ticket. Please try again.</p>
        )}

        {!sendSuccess && (
          <form onSubmit={handleSubmit} className="ticket-form">
            <label>
              Full Name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ticket-input"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ticket-input"
                required
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="ticket-input"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Describe your issue..."
                required
                className="ticket-input"
              />
            </label>

            <div className="ticket-buttons">
              <button type="button" onClick={onClose} className="ticket-cancel">
                Cancel
              </button>
              <button type="submit" disabled={sending} className="ticket-submit">
                {sending ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HelpModal;
