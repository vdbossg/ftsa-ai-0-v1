import React from "react";

export default function MessageModal({ isOpen, onClose, messages, loading }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          color: "#00FFFF",
          padding: "1rem",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "400px",
          maxHeight: "80%",
          overflowY: "auto",
          boxShadow: "0 0 15px #00FFFF",
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: "0.5rem", fontWeight: "bold" }}>Messages</h2>

        {loading && <p>Loading messages...</p>}

        {!loading && messages.length === 0 && <p>No new messages</p>}

        {!loading && messages.map((msg, idx) => (
          <div key={idx} style={{
  border: "1px solid #00FFFF",
  borderRadius: "8px",
  padding: "0.5rem",
  marginBottom: "0.5rem",
  backgroundColor: msg.read ? "#111" : "#002222",
}}>
  <strong>{msg.from}</strong>
  <p style={{ margin: 0 }}>{msg.text}</p>
  <small>{new Date(msg.date).toLocaleString()}</small>
</div>

        ))}

        <button onClick={onClose} style={{
          marginTop: "1rem",
          background: "#00FFFF",
          color: "#111",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}>Close</button>
      </div>
    </div>
  );
}
