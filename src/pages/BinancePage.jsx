// src/pages/BinancePage.jsx
import React, { useEffect, useState } from "react";
import NeonButton from "../components/NeonButton";

const neonColors = {
  background: "#000000",
  neonBlue: "#00FFFF",
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
        Binance
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {isElectron ? (
          // Electron: load real Binance site inside iframe
          <iframe
            src="https://www.binance.com/en"
            title="Binance"
            style={{
              flex: 1,
              width: "100%",
              border: "none",
            }}
          />
        ) : (
          // Web: show button to open Binance in new tab
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
    </div>
  );
}