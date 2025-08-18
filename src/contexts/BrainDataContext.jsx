import React, { createContext, useContext, useState, useEffect } from "react";
import APIControl from "../brain/APIControl"; // Adjust path if needed

// Create the BrainDataContext
const BrainDataContext = createContext(null);

// Provider component
export const BrainDataProvider = ({ children }) => {
  // Original AI/brain state
  const [brainData, setBrainData] = useState({
    lastDecision: null,
    confidenceScore: 0,
    tradeAllowed: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ New states for BrainPage
  const [marketStrength, setMarketStrength] = useState([]);
  const [autoTradeStatus, setAutoTradeStatus] = useState("Stopped");

  // Fetch user info (original)
  const loadBrainData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await APIControl.fetchUserInfo();
      if (response.success) {
        setBrainData((prev) => ({
          ...prev,
          lastDecision: `Welcome ${response.data.name}`,
          confidenceScore: 100,
          tradeAllowed: response.data.status === "Active",
        }));

        // Optionally, fetch market strength from backend if API available
        // For now, we mock it
        setMarketStrength([
          { pair: "GBPUSD", strength: 75, trend: "Bullish" },
          { pair: "EURUSD", strength: 50, trend: "Bearish" },
          { pair: "USDJPY", strength: 30, trend: "Bearish" },
        ]);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError("Unexpected error loading brain data");
    } finally {
      setLoading(false);
    }
  };

  // Toggle auto trade
  const toggleAutoTrade = (start) => {
    setAutoTradeStatus(start ? "Running" : "Stopped");
    console.log(`Auto trade ${start ? "started" : "stopped"}`);
  };

  // Load brain data on mount
  useEffect(() => {
    loadBrainData();
  }, []);

  return (
    <BrainDataContext.Provider
      value={{
        brainData,
        setBrainData,
        loading,
        error,
        loadBrainData,
        // ✅ Injected for BrainPage
        marketStrength,
        autoTradeStatus,
        toggleAutoTrade,
      }}
    >
      {children}
    </BrainDataContext.Provider>
  );
};

// Custom hook for easy use
export const useBrainData = () => {
  const context = useContext(BrainDataContext);
  if (!context) {
    throw new Error("useBrainData must be used within a BrainDataProvider");
  }
  return context;
};
