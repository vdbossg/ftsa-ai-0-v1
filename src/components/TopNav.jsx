import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaUserCircle } from "react-icons/fa";

export default function TopNav() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [unreadMessages, setUnreadMessages] = useState(0);
  const [online, setOnline] = useState(true);

  // Example: fetch unread messages count
  useEffect(() => {
    if (!isAuthenticated) return;
    async function fetchMessages() {
      // Replace with real API call
      const count = await fetch("/api/messages/unread")
        .then(res => res.json())
        .then(data => data.count)
        .catch(() => 0);
      setUnreadMessages(count);
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Online/offline check (simple ping simulation)
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
      
      {/* Left: empty space or logo */}
      <div style={{ flex: 1 }}></div>

      {/* Center: FTSA AI */}
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>FTSA AI</div>

      {/* Right: Messages & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{ cursor: "pointer", position: "relative" }} onClick={() => navigate("/messages")}>
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
    </div>
  );
}
