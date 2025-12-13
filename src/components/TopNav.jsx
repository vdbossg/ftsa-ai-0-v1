import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FaEnvelope, FaUserCircle } from "react-icons/fa";
import MessageModal from "./MessageModal";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [messages, setMessages] = useState([]);
  const [online, setOnline] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch unread messages & messages
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchMessages() {
      try {
        const data = await fetch("/api/messages") // fetch messages
          .then(res => res.json());
        setMessages(data);
        setUnreadMessages(data.filter(msg => !msg.read).length);
      } catch (err) {
        setMessages([]);
        setUnreadMessages(0);
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Online/offline check
  useEffect(() => {
    const checkOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);
    return () => {
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, []);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#111",
      color: "#00FFFF",
      padding: "0.5rem 1rem",
      borderBottom: "2px solid #00FFFF",
      fontFamily: "'Orbitron', sans-serif",
    }}>
      <div style={{ flex: 1 }}></div>
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>FTSA AI</div>
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        
        {/* Message Icon */}
        <div style={{ cursor: "pointer", position: "relative" }} onClick={() => setIsModalOpen(true)}>
          <FaEnvelope size={24} />
          {unreadMessages > 0 && (
            <span style={{
              position: "absolute",
              top: -6,
              right: -10,
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "0.75rem",
              width: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>{unreadMessages}</span>
          )}
        </div>

        {/* Profile Icon */}
        <div style={{ cursor: "pointer", position: "relative" }} onClick={() => navigate("/profile")}>
          <FaUserCircle size={28} />
          <span style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: online ? "green" : "red",
            border: "1px solid #111"
          }} />
        </div>
      </div>

      {/* Modal */}
      <MessageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        messages={messages}
      />
    </div>
  );
}
