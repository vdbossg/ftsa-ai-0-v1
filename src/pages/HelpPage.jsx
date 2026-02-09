// src/pages/HelpPage.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import "../styles/HelpPage.css";
import APIControl from "../brain/APIControl";
// ---- FAQ Item ----
const FAQItem = ({ faq, onClick }) => (
  <div
    className="faq-item cursor-pointer hover:bg-[#0B0C10] p-2 rounded"
    onClick={() => onClick(faq)}
  >
    <h4 className="text-white font-semibold">{faq.question}</h4>
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

  // Helper to simulate bot typing
  const addBotMessage = (text, delay = 1500) => {
    setTyping(true); // show typing indicator
    setTimeout(() => {
      setMessages((prev) => [...prev, { type: "bot", text }]);
      setTyping(false); // hide typing after message
    }, delay);
  };

  // Initial bot welcome
  useEffect(() => {
    if (step === 0) {
      addBotMessage("Welcome to FTSA AI Help Center! How can we refer to you?");
    }
  }, [step]);

  const handleNextStep = async () => {
    if (step === 0) {
      if (!inputValue.trim()) return;
      setName(inputValue);
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      setInputValue("");
      addBotMessage(`Hi ${inputValue}, please provide your email.`);
      setStep(1);
    } else if (step === 1) {
      if (!inputValue.trim()) return;
      setEmail(inputValue);
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      setInputValue("");
      addBotMessage("Please select your problem category:");
      setStep(2);
    } else if (step === 2) {
      if (!category) return;
      setMessages((prev) => [...prev, { type: "user", text: category }]);
      addBotMessage("Kindly describe your problem in detail:");
      setStep(3);
    } else if (step === 3) {
      if (!inputValue.trim()) return;
      setMessages((prev) => [...prev, { type: "user", text: inputValue }]);
      const message = inputValue;
      setInputValue("");
      setTyping(true);

      try {
        const res = await APIControl.createSupportTicket({
          name,
          email,
          category,
          message,
        });

        const ticketId = res.data?.ticketId || res.ticketId; // handles both cases

        addBotMessage(
          ticketId
            ? `Your ticket was generated: ${ticketId}\nWe will respond within 2-3 business days. Thank you for your patience.`
            : "Your ticket was created, but we did not receive a ticket ID. Please check your email or try again later.",
          2000
        );
      } catch (err) {
        addBotMessage("Failed to create ticket. Please try again later.", 2000);
      }

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
          {/* Show input only when bot is not typing */}
          {!typing &&
            (step === 0 ? (
              <div className="text-input-container">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
                />
                <button onClick={handleNextStep}>Send</button>
              </div>
            ) : step === 1 ? (
              <div className="text-input-container">
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
                />
                <button onClick={handleNextStep}>Send</button>
              </div>
            ) : step === 2 ? (
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
            ) : step === 3 ? (
              <div className="text-input-container">
                <input
                  type="text"
                  placeholder="Describe your problem"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
                />
                <button onClick={handleNextStep}>Send</button>
              </div>
            ) : null)}
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
  const [selectedFaq, setSelectedFaq] = useState(null); // for FAQ modal


  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/FtsafaqsData");
      console.log("FAQ Response:", res.data);
      const faqsArray = res.data?.faqs || [];
      setFaqs(faqsArray);
      setFilteredFaqs(faqsArray);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
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
  {filteredFaqs.length > 0 ? (
    filteredFaqs.map((faq) => (
      <FAQItem
        key={faq._id || faq.id}
        faq={faq}
        onClick={() => setSelectedFaq(faq)}
      />
    ))
  ) : searchTerm ? (
    <p>No FAQs found for "{searchTerm}".</p>
  ) : (
    <p>Loading FAQs...</p>
  )}
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
       {/* FAQ Answer Modal */}
{selectedFaq && (
  <div
    className="faq-modal-backdrop"
    onClick={() => setSelectedFaq(null)} // click outside to close
  >
    <div
      className="faq-modal p-6 max-w-md w-full relative"
      onClick={(e) => e.stopPropagation()} // prevent modal click from closing
    >
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl font-bold"
        onClick={() => setSelectedFaq(null)}
      >
        &times;
      </button>

      {/* Question Card */}
      <div className="faq-card question-card mb-4 p-4 rounded-lg">
        <h3 className="text-white font-bold text-lg">Question</h3>
        <p className="text-white mt-2">{selectedFaq.question}</p>
      </div>

     
 {/* Answer Card */}
<div className="faq-card answer-card p-4 rounded-lg bg-green-600">
  <h3 className="text-white font-bold text-lg">Answer</h3>
  <div className="text-white mt-2">
    {selectedFaq.answer.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null; // skip empty lines

      // Function to wrap links exactly as they appear
      const renderLineWithLinks = (text) => {
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.(com|net|org|co\.ke|io|ai|gov|edu)(\/[^\s]*)?)/gi;
        const elements = [];
        let lastIndex = 0;

        text.replace(urlRegex, (match, offset) => {
          // push text before the match
          if (offset > lastIndex) {
            elements.push(text.slice(lastIndex, offset));
          }
          // push the matched link exactly as it is
          elements.push(
            <a
              key={offset}
              href={match} // use the link exactly as it is
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-200"
            >
              {match}
            </a>
          );
          lastIndex = offset + match.length;
          return match;
        });

        // push remaining text after last match
        if (lastIndex < text.length) {
          elements.push(text.slice(lastIndex));
        }

        return elements;
      };

      // Check for bullets
      if (trimmed.startsWith("•")) {
        return (
          <ul key={idx} className="ml-4 list-disc">
            <li>{renderLineWithLinks(trimmed)}</li>
          </ul>
        );
      }

      return (
        <p key={idx} className="mb-2">
          {renderLineWithLinks(trimmed)}
        </p>
      );
    })}
  </div>
</div>
    </div>
  </div>
)}
    </div>
  );
};

export default HelpPage;
