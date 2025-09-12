// src/components/QuickLinks.jsx
import React from "react";
import "../styles/QuickLinks.css";

const QuickLinks = ({ links }) => {
  return (
    <section className="quick-links">
      <h3>Quick Help</h3>
      <ul>
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href}>{link.title}</a>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickLinks;
