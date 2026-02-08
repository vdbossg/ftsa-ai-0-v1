// src/pages/HelpPage.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/HelpPage.css";

// ---- FAQ Item ----
const FAQItem = ({ question, answer }) => (
  <div className="faq-item">
    <h4>{question}</h4>
    <p>{answer}</p>
  </div>
);

// ---- Bot Message ----
const BotMessage = ({ text }) => (
  <div className="bot-message">{text}</div>
);

const UserMessage = ({ text }) => (
  <div className="user-message">{text}</div>
);

// ---- Bot Modal ----
const HelpModal = ({ user, onClose }) => {
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [category, setCategory] = useState("");
  const [typing, setTyping] = useState(true);

  const categories = [
    "Login problem",
    "Create account problem",
    "Affiliate problem",
    "Withdraw problem",
    "Payment problem",
    "Other",
  ];

  useEffect(() => {
    if (step === 0) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Welcome to FTSA AI Help Center! How can we refer to you?" },
      ]);
    }
  }, [step]);

  const handleNextStep = async () => {
    if (step === 0) {
      if (!inputValue.trim()) return;
      setName(inputValue);
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      setInputValue("");
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: `Hi ${inputValue}, please provide your email.` },
      ]);
      setStep(1);
    } else if (step === 1) {
      if (!inputValue.trim()) return;
      setEmail(inputValue);
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      setInputValue("");
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Please select your problem category:" },
      ]);
      setStep(2);
    } else if (step === 2) {
      if (!category) return;
      setMessages((prev) => [...prev, { type: "user", text: category }]);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Kindly describe your problem in detail:" },
      ]);
      setStep(3);
    } else if (step === 3) {
      if (!inputValue.trim()) return;
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      const message = inputValue;
      setInputValue("");
      setTyping(true);
      try {
        const res = await axios.post("/api/supportticket/Ftsa", {
          name,
          email,
          category,
          message,
        });
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: `Your ticket was generated: ${res.data.ticketId}\nWe will respond within 2-3 business days. Thank you for your patience.` },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "Failed to create ticket. Please try again later." },
        ]);
      }
      setTyping(false);
      setStep(4);
    }
  };

  return (
    <div className="help-modal-backdrop">
      <div className="help-modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <div className="messages-container">
          {messages.map((m, idx) =>
            m.type === "bot" ? (
              <BotMessage key={idx} text={m.text} />
            ) : (
              <UserMessage key={idx} text={m.text} />
            )
          )}
          {typing && <BotMessage text="Typing..." />}
        </div>

        <div className="input-container">
          {step === 2 ? (
            <div className="category-buttons">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "selected" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
              <button onClick={handleNextStep} disabled={!category}>
                Next
              </button>
            </div>
          ) : step <= 3 ? (
            <div className="text-input-container">
              <input
                type="text"
                placeholder={
                  step === 0
                    ? "Enter your name"
                    : step === 1
                    ? "Enter your email"
                    : "Describe your problem"
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
              />
              <button onClick={handleNextStep}>Send</button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

// ---- Help Page ----
const HelpPage = () => {
  const { user } = useContext(AuthContext);
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/faqs");
      // safely extract array from backend
      const faqsArray = Array.isArray(res.data) ? res.data : Array.isArray(res.data.data) ? res.data.data : [];
      setFaqs(faqsArray);
      setFilteredFaqs(faqsArray);
    } catch (err) {
      console.error(err);
    }
  };
  fetchData();
}, []);


  useEffect(() => {
    if (!searchTerm) setFilteredFaqs(faqs);
    else {
      setFilteredFaqs(
        faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, faqs]);

  return (
    <div className="help-container">
      {/* Header */}
      <header className="help-header">
        <h1>Welcome to FTSA AI Help Center</h1>
      </header>

      {/* Cards */}
      <div className="help-cards">
        <div className="card">
          <h3>Welcome</h3>
          <p>We are ready to serve you and assist with any issues.</p>
        </div>

        <div className="card">
          <h3>Help Time</h3>
          <p>Status: Open</p>
          <ul>
            {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((day) => (
              <li key={day}>
                {day}: 09:00 - 17:00
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h3>FAQs</h3>
          <input
            type="search"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="faq-list">
            {filteredFaqs.map((faq) => (
              <FAQItem
                key={faq._id || faq.id}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
            {filteredFaqs.length === 0 && <p>No FAQs found.</p>}
          </div>
        </div>

        <div className="card">
          <h3>FTSA Help Support</h3>
          <button onClick={() => setModalOpen(true)}>
            Welcome! How can we help you today?
          </button>
        </div>
      </div>

      {modalOpen && <HelpModal user={user} onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default HelpPage;
