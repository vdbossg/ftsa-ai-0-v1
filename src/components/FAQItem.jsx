// src/components/FAQItem.jsx
import React, { useState } from "react";
import "../styles/FAQItem.css";

const FAQItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button
        className="faq-question"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {question}
        <span className="faq-icon">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
};

export default FAQItem;
