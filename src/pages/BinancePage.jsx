// src/pages/BinancePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
};

const styles = {
  footer: {
    borderTop: "2px solid #00FFFF",
    paddingTop: "1rem",
    paddingBottom: "1rem",
    textAlign: "center",
    marginTop: "40px",
  },
  footerText: {
    fontSize: "0.9rem",
    color: "#00FF00",
    textShadow: "0 0 6px #00FF00",
  },
};

export default function BinancePage() {
  const [isElectron, setIsElectron] = useState(false);

  // Detect if running inside Electron
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsElectron(userAgent.indexOf("electron") > -1);
  }, []);

  return (
    <div
      style={{
        backgroundColor: neonColors.background,
        color: neonColors.neonBlue,
        fontFamily: "'Orbitron', sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          fontSize: "1.8rem",
          fontWeight: "bold",
          borderBottom: `2px solid ${neonColors.neonBlue}`,
          padding: "1rem",
          textAlign: "center",
        }}
      >
        FTSA AI-Binance
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isElectron ? (
          // Electron: load Binance inside webview
          <webview
            src="https://www.binance.com/en"
            style={{
              flex: 1,
              width: "100%",
              border: "none",
            }}
          />
        ) : (
          // Web: fallback message
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              border: `2px solid ${neonColors.neonBlue}`,
              margin: "2rem",
              borderRadius: "12px",
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#111",
            }}
          >
            <p>
              Cannot embed Binance in a browser due to security restrictions.
            </p>
            <NeonButton
              onClick={() =>
                window.open("https://www.binance.com/en", "_blank")
              }
            >
              Open Binance Official
            </NeonButton>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          FTSA AI - Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
        </p>
      </footer>
    </div>
  );
}