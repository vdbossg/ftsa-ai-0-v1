import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import APIControl from "../brain/APIControl";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Get token from query string
  const query = new URLSearchParams(location.search);
  const token = query.get("token"); // /reset-password?token=XYZ

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await APIControl.resetPassword(token, password); // implement in backend later
      if (res.success) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(res.error || "Failed to reset password.");
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
        <h2 style={{ color: "#00FFFF" }}>Reset Password</h2>

        {error && <StatusBadge status="error">{error}</StatusBadge>}
        {message && <StatusBadge status="success">{message}</StatusBadge>}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "2px solid #00FFFF",
            backgroundColor: "#111",
            color: "#00FFFF",
          }}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "2px solid #00FFFF",
            backgroundColor: "#111",
            color: "#00FFFF",
          }}
        />

        <NeonButton type="submit" disabled={loading || !password || !confirm}>
          {loading ? "Resetting..." : "Reset Password"}
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
