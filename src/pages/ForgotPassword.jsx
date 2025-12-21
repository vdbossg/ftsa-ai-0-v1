import React, { useState } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import { useNavigate } from "react-router-dom";
import APIControl from "../brain/APIControl"; // your API helper

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Call backend API to send reset email
      const res = await APIControl.forgotPassword(email); // will implement backend later
      if (res.success) {
        setMessage("Check your email for the password reset link.");
      } else {
        setError(res.error || "Failed to send reset email.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "5rem",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          border: "2px solid #00FFFF",
          padding: "2rem",
          borderRadius: "12px",
          backgroundColor: "#111",
        }}
      >
        <h2 style={{ color: "#00FFFF" }}>Forgot Password</h2>

        {error && <StatusBadge status="error">{error}</StatusBadge>}
        {message && <StatusBadge status="success">{message}</StatusBadge>}

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "2px solid #00FFFF",
            backgroundColor: "#111",
            color: "#00FFFF",
          }}
        />

        <NeonButton type="submit" disabled={loading || !email}>
          {loading ? "Sending..." : "Send Reset Link"}
        </NeonButton>

        <span
          onClick={() => navigate("/login")}
          style={{
            color: "#00FFFF",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Back to Login
        </span>
      </form>
    </div>
  );
}
