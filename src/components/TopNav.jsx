// src/components/TopNav.jsx
import React, { useEffect, useState, useRef } from "react";
import { FaEnvelope, FaUserCircle, FaBell } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import APIControl from "../brain/APIControl";

export default function TopNav() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsSettings, setNotificationsSettings] = useState({
    messages: true,
    alerts: true,
  });
  const [online, setOnline] = useState(navigator.onLine);
  const [openMenu, setOpenMenu] = useState(null); // messages | profile | notifications

  const ref = useRef(null);

  /* ===== FETCH MESSAGES & SETTINGS ===== */
  useEffect(() => {
    if (!isAuthenticated) return;

    async function load() {
      // Load user settings
      const settingsData = await APIControl.fetchSettingsData(user?.id);
      if (settingsData?.notifications) {
        setNotificationsSettings(settingsData.notifications);
      }

      // Load messages only if messages toggle is ON
      if (settingsData?.notifications?.messages) {
        const res = await fetch("/api/messages");
        const data = await res.json();
        setMessages(data);
        setUnreadCount(data.filter(m => !m.read).length);
      } else {
        setMessages([]);
        setUnreadCount(0);
      }
    }

    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [isAuthenticated, user?.id]);

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

  /* ===== CLICK OUTSIDE CLOSE ===== */
  useEffect(() => {
    const close = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  /* ===== HANDLERS FOR TOGGLES ===== */
  const toggleNotification = async (key) => {
    const newVal = !notificationsSettings[key];
    const updatedSettings = { ...notificationsSettings, [key]: newVal };
    setNotificationsSettings(updatedSettings);
    await APIControl.saveSettingsData({ notifications: updatedSettings });
  };

  return (
    <div style={styles.nav}>

      <div style={styles.title}>FTSA AI</div>

      <div style={styles.right} ref={ref}>

        {/* ✉️ MESSAGES */}
        <Icon
          badge={unreadCount}
          onClick={() => setOpenMenu(openMenu === "messages" ? null : "messages")}
        >
          <FaEnvelope size={22} />
          {openMenu === "messages" && (
            <Dropdown>
              {messages.length === 0 && <Item>No messages</Item>}
              {messages.map(m => (
                <Item
                  key={m.id}
                  unread={!m.read}
                  onClick={async () => {
                    if (!m.read) {
                      await fetch(`/api/messages/${m.id}/read`, { method: "PATCH" });
                      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x));
                      setUnreadCount(c => Math.max(c - 1, 0));
                    }
                  }}
                >
                  <strong>{m.from}</strong>
                  <div>{m.text}</div>
                </Item>
              ))}
            </Dropdown>
          )}
        </Icon>

        {/* 🔔 NOTIFICATIONS */}
        <Icon onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}>
          <FaBell size={22} />
          {openMenu === "notifications" && (
            <Dropdown>
              <label style={labelStyle}>
                Messages
                <input
                  type="checkbox"
                  checked={notificationsSettings.messages}
                  onChange={() => toggleNotification("messages")}
                />
              </label>
              <label style={labelStyle}>
                Alerts
                <input
                  type="checkbox"
                  checked={notificationsSettings.alerts}
                  onChange={() => toggleNotification("alerts")}
                />
              </label>
            </Dropdown>
          )}
        </Icon>

        {/* 👤 PROFILE */}
        <Icon onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}>
          <FaUserCircle size={26} />
          <span
            style={{
              ...styles.status,
              background: online ? "lime" : "red"
            }}
          />
          {openMenu === "profile" && (
            <Dropdown>
              <Item onClick={() => navigate("/profile")}>Profile</Item>
              <Item onClick={() => navigate("/settings")}>Settings</Item>
              <Item onClick={() => navigate("/logout")}>Logout</Item>
            </Dropdown>
          )}
        </Icon>

      </div>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */

const Icon = ({ children, onClick, badge }) => (
  <div onClick={onClick} style={styles.icon}>
    {children}
    {badge > 0 && <span style={styles.badge}>{badge}</span>}
  </div>
);

const Dropdown = ({ children }) => (
  <div style={styles.dropdown}>{children}</div>
);

const Item = ({ children, unread, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "0.5rem",
      borderBottom: "1px solid #00FFFF",
      background: unread ? "#002222" : "transparent",
      cursor: "pointer"
    }}
  >
    {children}
  </div>
);

const labelStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "0.5rem",
};

/* ===== STYLES ===== */

const styles = {
  nav: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between", // <-- allow space for left, center, right
  padding: "0.5rem 1rem",
  background: "#111",
  borderBottom: "2px solid #00FFFF",
  color: "#00FFFF",
  fontFamily: "Orbitron",
  position: "relative"  // <-- needed for absolute positioning of title
},

  title: {
  position: "absolute",  // <-- absolute centers it in nav
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "1.5rem",
  fontWeight: "bold"
},

  right: {
    display: "flex",
    gap: "1.2rem",
    position: "relative"
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
  dropdown: {
    position: "absolute",
    right: 0,
    top: "2.2rem",
    width: 260,
    background: "#111",
    border: "1px solid #00FFFF",
    borderRadius: 8,
    zIndex: 2000
  },
  status: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: "50%"
  }
};
