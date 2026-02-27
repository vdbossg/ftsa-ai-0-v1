//FTSA_AI_0.v1\src\pages\DashboardPage.jsx
import React, { useEffect, useState, useContext } from "react";
import NeonButton from "../components/NeonButton";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { AuthContext } from '/src/contexts/AuthContext.jsx';
import APIControl from "../brain/APIControl";
import "../styles/DashboardPage.css";

// Add this below your imports
const ImageSlider = ({ images }) => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full mb-4">
      <img
  src={images[current].url}
  alt={images[current].fileName || "ad-image"}
  loading="lazy"
  className="w-full max-h-[60vh] object-contain rounded"
/>

    </div>
  );
};

const DashboardPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  // Local state for live clock
  const [digitalClock, setDigitalClock] = useState(new Date());
  const [marketSession, setMarketSession] = useState([]);
  const [overallStatus, setOverallStatus] = useState("Closed");
const [liveAds, setLiveAds] = useState([]);
const [liveScrolling, setLiveScrolling] = useState(null);
const [showModal, setShowModal] = useState(false);

  // Redirect unauthenticated users handled by router or higher context
  useEffect(() => {
  if (!isAuthenticated) return;

  async function loadDashboard() {
    try {
      const response = await APIControl.fetchDashboardData();
      console.log("Dashboard Data:", response);
      if (response.success) {
        setDashboardData(response.data);
        setError(null);
      } else {
        setError("Failed to load dashboard data.");
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
      console.error(err);
    }
  }

  loadDashboard();
  setLoading(false); // render page immediately
}, [isAuthenticated]);

  useEffect(() => {
  if (!isAuthenticated) return;

  async function fetchScrollingText() {
    try {
      const res = await fetch("https://ftsa-ai-backend.onrender.com/api/scrollingtexts/live");
      const data = await res.json();
      if (data.length > 0) {
        setLiveScrolling(data[0]); // only one go_live
      }
    } catch (err) {
      console.error("Error fetching scrolling text:", err);
    }
  }

  fetchScrollingText();
}, [isAuthenticated]);

useEffect(() => {
  if (!isAuthenticated) return;

  async function fetchLiveAds() {
    try {
      const res = await fetch('https://ftsa-ai-backend.onrender.com/api/live-ads');
      const json = await res.json();
      if (json.success) {
        setLiveAds(json.data);
      }
    } catch (err) {
      console.error("Error fetching live ads:", err);
    }
  }

  // Fetch immediately once
  fetchLiveAds();

  // Set interval to fetch every 2 seconds
  const interval = setInterval(fetchLiveAds, 5000); // fetch every 5 seconds

  // Cleanup interval on unmount
  return () => clearInterval(interval);

}, [isAuthenticated]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setDigitalClock(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update market sessions every second with weekday awareness
  useEffect(() => {
    const MARKET_SESSIONS = [
      { name: "London", open: 8, close: 16 },   // UTC
      { name: "New York", open: 13, close: 21 },
      { name: "Sydney", open: 22, close: 6 },   // overnight
      { name: "Asian", open: 0, close: 8 },
    ];

    function updateSessions() {
      const now = new Date();
      const utcHour = now.getUTCHours();
      const utcDay = now.getUTCDay(); // 0=Sunday, 5=Friday

      let anyOpen = false;

      const updated = MARKET_SESSIONS.map((s) => {
        let open = s.open;
        let close = s.close;
        if (close <= open) close += 24; // handle overnight session

        let currentHour = utcHour + (utcHour < open && close > 24 ? 24 : 0);

        const isOpen = currentHour >= open && currentHour < close;
        if (isOpen) anyOpen = true;

        let target = new Date(now);
        if (isOpen) {
          target.setUTCHours(close % 24, 0, 0, 0);
        } else {
          if (currentHour < open) {
            target.setUTCHours(open % 24, 0, 0, 0);
          } else {
            target.setUTCDate(target.getUTCDate() + 1);
            target.setUTCHours(open % 24, 0, 0, 0);
          }
        }

        const diff = target - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        const countdown = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        return { name: s.name, isOpen, countdown };
      });

      // Overall market status
      let statusText = anyOpen ? "OPENED" : "CLOSED";

      // Handle weekend: if Sunday (0) -> closed till Monday
      if (utcDay === 0) statusText = "CLOSED (Opens Monday)";
      // Handle Friday after last session closes
      if (utcDay === 5 && !anyOpen) statusText = "CLOSED (Opens Monday)";

      setMarketSession(updated);
      setOverallStatus(statusText);
    }

    updateSessions();
    const interval = setInterval(updateSessions, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="dashboard-page" style={{ color: "#FF0000", fontFamily: "Orbitron" }}>
        <h2>Please login to access the dashboard.</h2>
      </div>
    );
  }

  if (loading) {
  return (
    <div className="dashboard-page" style={{ color: "#00FFFF", fontFamily: "Orbitron" }}>
      <h1>FTSA AI Dashboard</h1>
      <p>Loading data...</p>
    </div>
  );
}


  if (error) return <div className="error-msg neon-glow-border">{error}</div>;

  const { userInfo, trades, news, accounts } = dashboardData || {};


  return (
    <div
      className="dashboard-page"
      style={{
        backgroundColor: "#000000",
        color: "#00FFFF",
        fontFamily: "Orbitron, sans-serif",
        minHeight: "100vh",
        padding: "1rem 2rem",
        overflowY: "auto",
      }}
    >
      
      <header className="appbar" style={{ marginBottom: "1.5rem" }}>
        <h1>FTSA AI</h1>
        {liveScrolling && (
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    whiteSpace: "nowrap",
    width: "fit-content",   // ✅ prevents full stretch
  }}
>

    {/* Moving Text */}
    <div>

    <div className="ticker-wrapper">
  <div
    className="ticker"
    style={{
      animationDuration: `${Math.max(liveScrolling.scrollingText.length * 0.2, 12)}s`,
    }}
  >
    <span data-text={liveScrolling.scrollingText}>
      {liveScrolling.scrollingText}
    </span>
  </div>
</div>


    </div>

    {/* Button */}
    <button
  onClick={() => setShowModal(true)}
  style={{
    backgroundColor: "#00e676",   // ✅ new green
    color: "#000",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 0 10px #00e676",
    transition: "all 0.3s ease",
  }}
  onMouseEnter={(e) =>
    (e.target.style.boxShadow = "0 0 20px #00e676")
  }
  onMouseLeave={(e) =>
    (e.target.style.boxShadow = "0 0 10px #00e676")
  }
>

      Tap for more info
    </button>
  </div>
)}

      </header>

      {/* Digital Clock */}
<div style={{ fontSize: "1.5rem", color: "#00FFFF", marginBottom: "1rem", textAlign: "center" }}>
  {digitalClock.toLocaleTimeString()}
</div>

{/* Live Ad | Market Session */}
<section className="top-info neon-glow-border" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem" }}>
    
    {/* Left: Live Ad */}
    <div style={{ flex: 1 }}>
      {liveAds.length > 0 && (() => {
        const ad = liveAds[0]; // first live ad
        const images = ad.media.filter(m => m.mediaType === "image");
        const videos = ad.media.filter(m => m.mediaType === "video");

        return (
          <div
            key={ad._id}
            className="p-4 bg-[#1F2833] rounded-md text-white"
            style={{ maxWidth: "500px" }}
          >
            {ad.type && (
  <h2
    className="text-xl font-bold mb-2 text-center"
    style={{ color: "#00FF00" }}
  >
    {ad.type}
  </h2>
)}
            {ad.description && <p className="text-center mb-2">{ad.description}</p>}

            {/* Images Slider */}
            {images.length > 0 && <ImageSlider images={images} />}

            {/* Videos */}
            {videos.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {videos.map((v) => (
                  <video
                    key={v._id}
                    src={v.url}
                    controls
                    autoPlay
                    loop
                    className="w-full rounded max-h-[40vh] object-contain"
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>

    {/* Right: Market Session */}
    <div
      className="market-session"
      style={{ flexShrink: 0, fontSize: "1rem", color: "#00FF00", display: "flex", flexDirection: "column", alignItems: "flex-start" }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
        MARKET SESSION: {overallStatus}
      </div>
      {marketSession && marketSession.map((s) => (
        <div key={s.name} style={{ marginBottom: "0.25rem", textAlign: "right" }}>
          {s.name}: {s.isOpen ? "Open" : "Closed"} <br />
          <span style={{ fontSize: "0.9rem", color: "#FFA500" }}>
            {s.isOpen ? "Closes in " : "Opens in "} {s.countdown}
          </span>
        </div>
      ))}
    </div>

  </div>
</section>

     {/* Market Strength Table */}
<section
  className="market-strength neon-glow-border"
  style={{
    marginBottom: "2rem",
    padding: "1rem",
  }}
>
  <h2 style={{ color: "#00FFFF" }}>Market Strength</h2>

  {/* Scrollable container */}
  <div
    style={{
      maxHeight: "300px",         // height of the visible area
      overflowY: "auto",          // vertical scroll if content overflows
      border: "1px solid #00FFFF",
      borderRadius: "8px",
    }}
  >
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        color: "#00FFFF",
        fontFamily: "Orbitron",
      }}
    >
      <thead style={{ position: "sticky", top: 0, backgroundColor: "#000000", zIndex: 1 }}>
        <tr>
          {["Pair", "Strength", "Trend"].map((header) => (
            <th
              key={header}
              style={{
                borderBottom: "2px solid #00FFFF",
                padding: "0.5rem",
                textAlign: "left",
                borderRight: "1px solid #00FFFF",
              }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
     <tbody>
  {!dashboardData ? (
    <tr>
      <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
        Loading market strength...
      </td>
    </tr>
  ) : dashboardData.marketStrength?.length > 0 ? (
    dashboardData.marketStrength.map(({ symbol, strength, bias }, idx) => (
      <tr
        key={idx}
        style={{
          borderBottom: "1px solid #00FFFF",
          backgroundColor: idx % 2 === 0 ? "#001111" : "#000000",
        }}
      >
        <td style={{ padding: "0.5rem", borderRight: "1px solid #00FFFF" }}>{symbol}</td>
        <td style={{ padding: "0.5rem", borderRight: "1px solid #00FFFF" }}>{strength}</td>
        <td
          style={{
            padding: "0.5rem",
            color: bias === "Bullish" ? "#00FF00" : bias === "Bearish" ? "#FF0000" : "#AAAAAA",
          }}
        >
          {bias || "Unknown"}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan={3} style={{ textAlign: "center", padding: "1rem" }}>
        No market strength data.
      </td>
    </tr>
  )}
</tbody>
    </table>
  </div>
</section>
{showModal && liveScrolling && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    }}
  >
    <div
      style={{
        backgroundColor: "#111",
        padding: "2rem",
        borderRadius: "10px",
        maxWidth: "800px",
        width: "90%",
        maxHeight: "90vh",
        overflowY: "auto",
        color: "#00FFFF",
      }}
    >
      <h2
  style={{
    marginBottom: "1rem",
    color: "#00FF00",      // ✅ neon heading green
    textShadow: "0 0 10px #00FF00",
  }}
>
  {liveScrolling.title}
</h2>


      <p style={{ marginBottom: "1rem" }}>
        {liveScrolling.description}
      </p>

      {/* Media */}
      {liveScrolling.mediaUrl.map((url, index) => {
        const type = liveScrolling.mediaType[index];

        if (type === "image") {
          return (
           <img
  key={index}
  src={url}
  alt="media"
  loading="lazy"
  style={{
    width: "100%",
    marginBottom: "1rem",
    borderRadius: "8px",
  }}
/>

          );
        }

        if (type === "video") {
          return (
           <video
  key={index}
  src={url}
  controls
  preload="none"
  style={{
    width: "100%",
    marginBottom: "1rem",
    borderRadius: "8px",
  }}
/>

          );
        }

        return null;
      })}

      <button
        onClick={() => setShowModal(false)}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#FF0000",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

 <footer style={{ textAlign: "center", padding: "1rem", color: "#00FFFF", borderTop: "1px solid #00FFFF" }}>
        FTSA AI-Powered by KELVIN SPECTER (MBURU G) Copyright ©️ 2025
      </footer>
     
    </div>
  );
};

export default DashboardPage;
