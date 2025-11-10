import React from "react";

const Modal = ({ title, children, onClose, isOpen }) => {
  if (!isOpen) return null; // 🚨 Don't render anything when closed

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <header style={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </header>

        {/* Content */}
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#111",
    color: "#0FF",
    padding: "1rem",
    borderRadius: "10px",
    width: "90%",
    maxWidth: "600px",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 0 20px #0FF",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #0FF",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
  },
  closeButton: {
    background: "none",
    border: "none",
    color: "#FF0000",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  content: {
    marginTop: "1rem",
  },
};

export default Modal;
