import React from "react";

const Modal = ({ title, children, onClose }) => {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <header style={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </header>
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
    minWidth: "300px",
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
    color: "#0FF",
    fontSize: "1.5rem",
    cursor: "pointer",
  },
  content: {
    marginTop: "1rem",
  },
};

export default Modal;
