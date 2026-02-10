import React, { useEffect, useState, useRef } from "react";
import { FaEnvelope, FaUserCircle, FaBell } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  const ref = useRef(null);

  /* ===== FETCH MESSAGES (SILENT BACKGROUND) ===== */
  const loadMessages = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch("http://localhost:5000/api/messageData/userid");
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  useEffect(() => {
    loadMessages();
    const id = setInterval(loadMessages, 180000); // 3 minutes
    return () => clearInterval(id);
  }, [isAuthenticated]);

  /* ===== ONLINE / OFFLINE ===== */
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const unreadMessages = messages.filter(m => m.status === "new");
  const unreadCount = unreadMessages.length;

  /* ===== OPEN MESSAGE (MARK READ HERE) ===== */
  const openMessage = async (msg) => {
    setActiveMessage(msg);

    // Only mark as read if currently new
    if (msg.status === "new") {
      // Optimistic UI update
      setMessages(prev =>
        prev.map(m =>
          m._id === msg._id ? { ...m, status: "read" } : m
        )
      );

      try {
        try {
  const res = await fetch(`http://localhost:5000/api/messageData/read/${msg._id}`, {
    method: "PATCH"
  });
  if (!res.ok) throw new Error("Thankyou for taking Actions!");
  // reload messages to reflect DB update
  loadMessages();
} catch (err) {
  console.error("Failed to mark message as read:", err);
}

      } catch (err) {
        console.error("Failed to mark message as read:", err);
      }
    }
  };

  return (
    <>
      <div style={styles.nav}>
        <div style={styles.left} />
        <div style={styles.title}>FTSA AI</div>

        <div style={styles.right} ref={ref}>
          {/* ✉️ MESSAGE ICON */}
          <div style={styles.icon} onClick={() => setShowListModal(true)}>
            <FaEnvelope size={22} />
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </div>

          {/* 🔔 NOTIFICATION */}
<div style={styles.icon}>
  <FaBell size={22} />
  {unreadMessages.some(m => m.priority === "urgent") && <span style={styles.redDot} />}  {/* 🔴 */}
  {unreadMessages.some(m => m.priority !== "urgent") && <span style={styles.greenDot} />} {/* 🟢 */}
</div>


          {/* 👤 PROFILE */}
          <div style={styles.icon} onClick={() => navigate("/profile")}>
            <FaUserCircle size={26} />
            <span
              style={{
                ...styles.status,
                background: online ? "lime" : "red"
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== MESSAGE LIST MODAL ===== */}
      {showListModal && (
        <Modal onClose={() => setShowListModal(false)}>
          <h3>Messages</h3>

          <div style={styles.switch}>
            <button onClick={() => setUnreadOnly(true)}>Unread</button>
            <button onClick={() => setUnreadOnly(false)}>Read</button>
          </div>

          <div style={styles.messageList}>
  {(unreadOnly ? unreadMessages : messages.filter(m => m.status === "read"))
    .map((m) => (
      <div key={m._id} style={styles.messageRow}>
        <div>
  <strong style={{ color: m.priority === "urgent" ? "red" : "lime" }}>
    {m.subject}
  </strong>
  <div style={styles.date}>
    {new Date(m.created_at).toLocaleString()}
  </div>
</div>

        <button onClick={() => openMessage(m)}>
          {unreadOnly ? "Read" : "Reread"}
        </button>
      </div>
    ))}
</div>

        </Modal>
      )}

      {/* ===== FULL MESSAGE MODAL ===== */}
      {activeMessage && (
        <Modal onClose={() => setActiveMessage(null)}>
          <h2>{activeMessage.subject}</h2>
          <p style={styles.date}>
            {new Date(activeMessage.created_at).toLocaleString()}
          </p>
          <div style={styles.body}>{activeMessage.body}</div>
          <p><strong>Served by:</strong> {activeMessage.sent_by}</p>
        </Modal>
      )}
    </>
  );
}

/* ===== MODAL ===== */
const Modal = ({ children, onClose }) => (
  <div style={styles.overlay}>
    <div style={styles.modal}>
      <button style={styles.close} onClick={onClose}>✕</button>
      {children}
    </div>
  </div>
);

/* ===== STYLES ===== */
const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.5rem 1rem",
    background: "#111",
    borderBottom: "2px solid #00FFFF",
    color: "#00FFFF",
    fontFamily: "Orbitron",
    position: "relative"
  },
  title: {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: "1.5rem",
    fontWeight: "bold"
  },
  right: {
    display: "flex",
    gap: "1.2rem"
  },
  icon: {
    position: "relative",
    cursor: "pointer"
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    background: "red",
    color: "#fff",
    fontSize: "0.7rem",
    borderRadius: "50%",
    width: 16,
    height: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  greenDot: {
  position: "absolute",
  bottom: -2,
  right: -2,
  width: 8,
  height: 8,
  background: "lime",
  borderRadius: "50%",
  zIndex: 5
},
redDot: {
  position: "absolute",
  bottom: -2,
  right: 8,       // slightly offset so red doesn't overlap green
  width: 8,
  height: 8,
  background: "red",
  borderRadius: "50%",
  zIndex: 6
},

  status: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: "50%"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 3000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modal: {
  background: "#111",
  border: "1px solid #00FFFF",
  borderRadius: 10,
  padding: "1rem",
  width: 500,
  maxHeight: "80vh",
  color: "#fff",
  position: "relative",
  display: "flex",         // added
  flexDirection: "column"   // added
},

  close: {
    position: "absolute",
    top: 8,
    right: 10,
    background: "transparent",
    border: "none",
    color: "#00FFFF",
    fontSize: "1.2rem",
    cursor: "pointer"
  },
  messageRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid #00FFFF",
    padding: "0.5rem 0"
  },
  body: {
    whiteSpace: "pre-wrap",
    marginTop: "1rem"
  },
  date: {
    fontSize: "0.75rem",
    opacity: 0.7
  },
  switch: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem"
  },
  left: {
    width: "3rem"
  },
  messageList: {
  flexGrow: 1,          // fills remaining modal height
  overflowY: "auto",    // enables scrolling
  marginTop: "1rem",
  borderTop: "1px solid #00FFFF",
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem 0"
}

};

