// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import APIControl from "../brain/APIControl";
import "../styles/LoginPage.css";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
  neonGreen: "#00FF00",
  neonOrange: "#FFA500",
  neonRed: "#FF0000",
};

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const [mode, setMode] = useState("login"); // login or signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loginData, setLoginData] = useState({
  email: "",
  password: "",
  keepLoggedIn: false,
});

  const [signupData, setSignupData] = useState({
    firstName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect handled in App.jsx router, or do it here:
      window.location.href = "/dashboard";
    }
  }, [isAuthenticated]);

  const validateLogin = () => {
  if (!loginData.email || !loginData.password) {
    setError("Please fill in all login fields.");
    return false;
  }
  return true;
};


  const validateSignup = () => {
    const { firstName, email, phone, password, confirmPassword, agreeTerms } = signupData;
    if (!firstName || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all signup fields.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (!agreeTerms) {
      setError("You must agree to terms & conditions.");
      return false;
    }
    // Password strength check: mixed upper, lower, numeric, special, length 8-12
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,12}$/;
    if (!pwdRegex.test(password)) {
      setError(
        "Password must be 8-12 chars, include uppercase, lowercase, number & special char."
      );
      return false;
    }
    return true;
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    setError("");
    setSuccessMsg("");
  };

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupData({
      ...signupData,
      [name]: type === "checkbox" ? checked : value,
    });
    setError("");
    setSuccessMsg("");
  };

  const handleLoginSubmit = async (e) => {
  e.preventDefault();
  console.log("Login clicked with:", loginData); // ← added
  if (!validateLogin()) return;
  setLoading(true);
  setError("");
  try {
    const authData = await APIControl.login(loginData.email, loginData.password);
console.log("API response:", authData);

if (!authData.success) {
  setError(authData.error || "Login failed. Check credentials.");
} else {
  login(authData.data, authData.token); // update context
  setSuccessMsg("Login successful! Redirecting...");
}

  } catch (err) {
    console.error(err); // ← added
    setError(err.message || "Login failed. Check credentials.");
  } finally {
    setLoading(false);
  }
};


  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setLoading(true);
    setError("");
    try {
   const { firstName, middleName, email, phone, password } = signupData; 
 const payload = { firstName, middleName, email, phone, password }; 
 const result = await APIControl.signup(payload);
  if (result.success) {
    setSuccessMsg("Signup successful! Please login.");
    setMode("login");
    setSignupData({
      firstName: "",
      middleName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeTerms: false,
    });
  } else {
    setError(result.error || "Signup failed. Try again."); // <-- check API response
  }
} catch (err) {
  console.error(err);
  setError(err.message || "Signup failed. Try again.");
} finally {
  setLoading(false);
}
  };


  return (
    <div
      className="login-page"
      style={{
        backgroundColor: neonColors.background,
        fontFamily: "'Orbitron', sans-serif",
        color: neonColors.neonBlue,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <header
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "1rem",
          color: neonColors.neonBlue,
          textAlign: "center",
        }}
      >
        WELCOME BACK TO FTSA AI
      </header>

      <nav
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          gap: "2rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        <span
          onClick={() => {
            setMode("login");
            setError("");
            setSuccessMsg("");
          }}
          style={{
            color: mode === "login" ? neonColors.neonGreen : neonColors.neonBlue,
            borderBottom: mode === "login" ? `3px solid ${neonColors.neonGreen}` : "none",
            paddingBottom: "0.25rem",
          }}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === "Enter" && setMode("login")}
        >
          LOGIN
        </span>
        <span
          onClick={() => {
            setMode("signup");
            setError("");
            setSuccessMsg("");
          }}
          style={{
            color: mode === "signup" ? neonColors.neonGreen : neonColors.neonBlue,
            borderBottom: mode === "signup" ? `3px solid ${neonColors.neonGreen}` : "none",
            paddingBottom: "0.25rem",
          }}
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === "Enter" && setMode("signup")}
        >
          CREATE ACCOUNT
        </span>
      </nav>

      {error && <StatusBadge status="error">{error}</StatusBadge>}
      {successMsg && <StatusBadge status="success">{successMsg}</StatusBadge>}

      {loading && <LoadingSpinner size={48} color={neonColors.neonBlue} />}

      {!loading && mode === "login" && (
        <form
          onSubmit={handleLoginSubmit}
          style={{
            border: `2px solid ${neonColors.neonBlue}`,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: `0 0 20px ${neonColors.neonBlue}`,
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor: "#111",
          }}
          noValidate
        >
          <label>
            Email / Username / Phone Number
            <input
  type="email"
  name="email"
  value={loginData.email}
  onChange={handleLoginChange}
  autoComplete="username"
  style={inputStyle(neonColors)}
  placeholder="Enter your email"
  required
/>

          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleLoginChange}
              autoComplete="current-password"
              style={inputStyle(neonColors)}
              placeholder="Enter password"
              required
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              name="keepLoggedIn"
              checked={loginData.keepLoggedIn}
              onChange={() =>
                setLoginData((prev) => ({ ...prev, keepLoggedIn: !prev.keepLoggedIn }))
              }
            />
            Keep me logged in on this device
          </label>

          <NeonButton type="submit" disabled={loading || !loginData.email || !loginData.password}>
            Login
          </NeonButton>

          <a
            href="/forgot-password"
            style={{
              color: neonColors.neonBlue,
              textDecoration: "underline",
              cursor: "pointer",
              marginTop: "0.5rem",
              fontSize: "0.9rem",
              alignSelf: "flex-start",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = neonColors.neonGreen)}
            onMouseLeave={(e) => (e.target.style.color = neonColors.neonBlue)}
          >
            Forgot password?
          </a>

          {/* Social sign-ins */}
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              fontSize: "0.9rem",
            }}
          >
            <span style={{ marginBottom: "0.25rem" }}>Or sign in with:</span>
            {[
              "Google",
              "Apple",
              "Facebook",
              "Twitter/X",
              "Linkedin",
            ].map((provider) => (
              <NeonButton
                key={provider}
                onClick={() => alert(`Sign in with ${provider} coming soon.`)}
                style={{ backgroundColor: "#111", borderColor: neonColors.neonBlue }}
              >
                Sign in with {provider}
              </NeonButton>
            ))}
          </div>
        </form>
      )}

      {!loading && mode === "signup" && (
        <form
          onSubmit={handleSignupSubmit}
          style={{
            border: `2px solid ${neonColors.neonBlue}`,
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: `0 0 20px ${neonColors.neonBlue}`,
            width: "100%",
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor: "#111",
          }}
          noValidate
        >
          <label>
            First Name
            <input
              type="text"
              name="firstName"
              value={signupData.firstName}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
              required
            />
          </label>
          <label>
            Middle Name(s)
            <input
              type="text"
              name="middleName"
              value={signupData.middleName}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
              required
            />
          </label>
          <label>
            Phone Number (+123)(7xxxxxxxx)
            <input
              type="tel"
              name="phone"
              value={signupData.phone}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
              pattern="^\+?[0-9]{7,15}$"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={signupData.password}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
              placeholder="8-12 chars, upper, lower, number, special"
              required
            />
          </label>
          <label>
            Confirm Password
            <input
              type="password"
              name="confirmPassword"
              value={signupData.confirmPassword}
              onChange={handleSignupChange}
              style={inputStyle(neonColors)}
              required
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              name="agreeTerms"
              checked={signupData.agreeTerms}
              onChange={handleSignupChange}
              required
            />
            I agree to terms & conditions.
          </label>

          <NeonButton
  type="submit"
  disabled={
    loading || // <-- add this
    !signupData.firstName ||
    !signupData.email ||
    !signupData.phone ||
    !signupData.password ||
    !signupData.confirmPassword ||
    !signupData.agreeTerms
  }
>
  Sign Up
</NeonButton>

        </form>
      )}

      <footer
        style={{
          marginTop: "3rem",
          fontSize: "0.8rem",
          color: neonColors.neonBlue,
          textAlign: "center",
        }}
      >
        FTSA AI - Powered by KELVIN SPECTER (MBURU G) &copy; 2025
      </footer>
    </div>
  );
}

// Helper input style for neon glowing inputs
const inputStyle = (colors) => ({
  width: "100%",
  padding: "0.5rem 0.75rem",
  marginTop: "0.25rem",
  borderRadius: "8px",
  border: `2px solid ${colors.neonBlue}`,
  backgroundColor: "#111",
  color: colors.neonBlue,
  fontFamily: "'Orbitron', sans-serif",
  fontSize: "1rem",
  outline: "none",
  boxShadow: `0 0 10px ${colors.neonBlue}`,
  transition: "border-color 0.3s ease",
  "::focus": {
    borderColor: colors.neonGreen,
  },
});
