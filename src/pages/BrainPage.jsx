//FTSA_AI_0.v1\src\pages\BrainPage.jsx
import React, { useEffect, useState } from "react";
import { useBrainData } from "../contexts/BrainDataContext";
import NeonButton from "../components/NeonButton";
import APIControl from "../brain/APIControl"; // for fetching brain data, market strength, CHoCH
import { useRef } from "react"; // at top of file

export default function BrainPage() {
  const { autoTradeStatus, toggleAutoTrade } = useBrainData();

  const [tradeHistory, setTradeHistory] = useState([]);
  const [topPair, setTopPair] = useState(null);
  const [marketStrength, setMarketStrength] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
  maxTrades: 1,
  risk: 1,
  dailyMaxLoss: 1,
  tpTargets: "tp1",
});
const [todayNews, setTodayNews] = useState([]);
const [currentNews, setCurrentNews] = useState(null);
const [nextNews, setNextNews] = useState(null);
const [recentNewsWithinHour, setRecentNewsWithinHour] = useState(null);
const [countdown, setCountdown] = useState("");
const [saveMessage, setSaveMessage] = useState(""); // for showing save confirmation
const [pendingTrade, setPendingTrade] = useState(null); // for a single valid trade from TV + Top3
const [eaUpdatedTrades, setEaUpdatedTrades] = useState([]);
const [accountTotals, setAccountTotals] = useState({ balance: 1000 }); // default 1000 or whatever you want as initial balance
const [cotData, setCotData] = useState(null); // holds COT data for today's trade
const [topDownData, setTopDownData] = useState(null); // holds Top-Down Strength for pending trade
const [currentUser, setCurrentUser] = useState(null);
const [riskState, setRiskState] = useState(null);
const toggleRSC = async () => {
  if (!riskState || togglingRSC) return;
  setTogglingRSC(true);

  const newStatus = riskState.autoTrade.status === "RUNNING" ? "STOPPED" : "RUNNING";

  try {

  // get active user from watcher
  const userResp = await fetch("http://localhost:5000/api/current-user");
  const userData = await userResp.json();

  if (!userData.userId) {
    console.error("No logged-in user");
    return;
  }

  const resp = await fetch("http://localhost:5000/api/brain/risk-state/toggle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: userData.userId,
      status: newStatus,
    }),
  });


    const data = await resp.json();

    if (data.success) {
      setRiskState(prev => ({
        ...prev,
        autoTrade: { status: newStatus },
      }));
    }
  } catch (err) {
    console.error("Failed to toggle RSC:", err);
  } finally {
    setTogglingRSC(false);
  }
};
const [riskLoading, setRiskLoading] = useState(false);
const [togglingRSC, setTogglingRSC] = useState(false);
// Fetch live account balances from MT and Prop accounts
useEffect(() => {
  const fetchAccounts = async () => {
    try {
      const [mtRes, propRes] = await Promise.all([
        fetch("http://localhost:5000/api/mtaccounts"),
        fetch("http://localhost:5000/api/propaccounts")
      ]);
      const mtData = await mtRes.json();
      const propData = await propRes.json();

      let balance = 0;

      if (mtData.success && Array.isArray(mtData.accounts)) {
        mtData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            balance += summary.balance || 0;
          }
        });
      }

      if (propData.success && Array.isArray(propData.accounts)) {
        propData.accounts.forEach(acc => {
          if (acc.account?.isConnected) {
            const summary = acc.summary?.data || {};
            balance += summary.balance || 0;
          }
        });
      }

      setAccountTotals(prev => ({ ...prev, balance }));
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    }
  };

  fetchAccounts();
  const interval = setInterval(fetchAccounts, 1000); // live update every second
  return () => clearInterval(interval);
}, []);

const scrollableTableContainer = {
  marginBottom: "2rem",
  border: "1px solid #00FFFF",
  padding: "1rem",
  borderRadius: "12px",
  boxShadow: "0 0 10px #00FFFF",
  maxHeight: "300px",      // sets max height
  overflowY: "auto",       // enables vertical scroll
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  borderBottom: "2px solid #00FFFF",
  padding: "0.5rem",
  textAlign: "left",
};

const tdStyle = {
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem",
};
const thShadowStyle = {
  borderBottom: "3px double #00FFFF",
  boxShadow: "0 2px 2px rgba(0,255,255,0.5)",
  padding: "0.5rem",
};

const tdVerticalLineStyle = {
  borderBottom: "1px solid #252e2eff",
  borderRight: "1px solid #00FFFF",
  padding: "0.5rem",
  textAlign: "center",  // <-- added
};

const lastTdStyle = {
  borderBottom: "1px solid #00FFFF",
  padding: "0.5rem",
};

const tradeHistoryRef = useRef(tradeHistory);
const marketStrengthRef = useRef(marketStrength);



const loadBrainData = async (showLoader = false) => {
  if (showLoader) setLoading(true); // only show loader on first load
  setError(null);
  try {
    const strengthResp = await APIControl.fetchMarketStrength();
    if (!strengthResp.success) throw new Error("Failed to fetch market strength");

    const strengthJson = strengthResp.data;

    setMarketStrength(
      strengthJson.map((p) => ({
        pair: p.symbol,
        strength: p.strength,
        trend: p.bias ? p.bias : "Unknown",
        color: p.signal || "neutral",
      }))
    );
  } catch (err) {
    setError("Failed to load brain data");
    console.error(err);
  } finally {
    if (showLoader) setLoading(false); // only hide loader if we showed it
  }
};
const fetchEaUpdates = async () => {
  try {
    const resp = await fetch("http://localhost:5000/api/ftsacalculator"); // GET latest trade with tradeActivated
    if (!resp.ok) throw new Error("Failed to fetch EA trade updates");

    const data = await resp.json();

    if (data?.trendJson) {
      setEaUpdatedTrades([data.trendJson]);
    }
  } catch (err) {
    console.error("Error fetching EA updates:", err);
  }
};
const updatePendingTrade = async () => {
  // 🚫 BLOCK NEW TRADES DURING NEWS WINDOW
if (currentNews || nextNews || recentNewsWithinHour) {
  console.log("🚫 Trade blocked due to news window");
  return;
}

if (!filteredSignals.length || !marketStrength.length) return;

  // Get top 3 strongest pairs
  const top3Pairs = [...marketStrength]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3);

  // Find first valid signal that is in top 3
  const validSignal = filteredSignals.find(signal =>
    top3Pairs.some(p => p.pair === signal.symbol)
  );

  if (!validSignal) {
    setPendingTrade(null);
    return;
  }

  const top3PairData = top3Pairs.find(p => p.pair === validSignal.symbol);

  // Fetch COT bias
  let cotData;
  try {
    const resp = await fetch(`http://localhost:5000/api/ftsacot/${validSignal.symbol}`);
    cotData = await resp.json();
  } catch (err) {
    console.error("Failed to fetch COT data:", err);
    setPendingTrade(null);
    return;
  }

  // Fetch Top-Down Strength bias
 // Fetch Top-Down Strength bias
let topDownResponse;
try {
  const resp = await fetch(`http://localhost:5000/api/topdownstrength/${validSignal.symbol}`);
  topDownResponse = await resp.json();
  setTopDownData(topDownResponse); // <-- store in state
} catch (err) {
  console.error("Failed to fetch Top-Down Strength:", err);
  setPendingTrade(null);
  return;
}


  // Normalize all biases
  const signalBias = validSignal.type === "BUY" ? "bullish" :
                     validSignal.type === "SELL" ? "bearish" : "neutral";

  const top3Bias = (top3PairData.trend || "").toLowerCase();
  
  const cotBias = (cotData.bias || "neutral").toLowerCase().includes("bull") ? "bullish" :
                  (cotData.bias || "neutral").toLowerCase().includes("bear") ? "bearish" : "neutral";

  const topDownBias = (topDownData.multiTFBias || "neutral").toLowerCase().includes("bull") ? "bullish" :
                      (topDownData.multiTFBias || "neutral").toLowerCase().includes("bear") ? "bearish" : "neutral";

  // Only proceed if all four biases match
  if (signalBias === top3Bias && top3Bias === cotBias && cotBias === topDownBias) {
    if (pendingTrade?.symbol === validSignal.symbol) return; // already same
    setPendingTrade({
      symbol: validSignal.symbol,
      type: validSignal.type,
      mode: validSignal.mode || "-",
      trend: signalBias,
      entry: validSignal.entry ?? "-",
      sl: validSignal.sl ?? "-",
      tp: validSignal.tp3 ?? "-",
      time: new Date().toLocaleTimeString(),
      tradeActivated: "PENDING",
    });
  } else {
    setPendingTrade(null); // biases mismatch
  }
};
useEffect(() => { tradeHistoryRef.current = tradeHistory; }, [tradeHistory]);
useEffect(() => { marketStrengthRef.current = marketStrength; }, [marketStrength]);
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const resp = await fetch("http://localhost:5000/api/current-user");
      const userData = await resp.json();

      if (userData?.userId) {
        // Fetch full user info for name
        const fullResp = await fetch(`http://localhost:5000/api/CurrentUserBp/${userData.userId}`);
        const fullData = await fullResp.json();

        if (fullData.success) setCurrentUser(fullData.data);
      }
    } catch (err) {
      console.error("Failed to fetch current user:", err);
    }
  };

  fetchCurrentUser();
}, []);
useEffect(() => {
  (async () => {
    await updatePendingTrade();
  })();
}, [filteredSignals, marketStrength]);
useEffect(() => {
  const fetchCotForPendingTrade = async () => {
    if (!pendingTrade) {
      setCotData(null); // clear if no trade
      return;
    }

    try {
      const resp = await fetch(`http://localhost:5000/api/ftsacot/${pendingTrade.symbol}`);
      if (!resp.ok) throw new Error("Failed to fetch COT data");
      const data = await resp.json();
      setCotData(data); // store in state
    } catch (err) {
      console.error("Error fetching COT data:", err);
      setCotData(null);
    }
  };

  fetchCotForPendingTrade();
}, [pendingTrade]);

useEffect(() => {

  const fetchRiskState = async () => {
    try {

      const userResp = await fetch("http://localhost:5000/api/current-user");
      const userData = await userResp.json();

      if (!userData.userId) return;

      const resp = await fetch(
        `http://localhost:5000/api/brain/risk-state/${userData.userId}`
      );

      const data = await resp.json();

      if (data.success) {
        setRiskState(data.data);
      }

    } catch (err) {
      console.error("Failed to fetch Risk State:", err);
    }
  };

  fetchRiskState();

  const interval = setInterval(fetchRiskState, 3000);
  return () => clearInterval(interval);

}, []);
useEffect(() => {
  let ws;

  const initializeWebSocket = () => {
    ws = new WebSocket("wss://ftsa-ai-backend.onrender.com/brain");// <-- replace with your actual WS URL

    ws.onopen = () => console.log("Brain WebSocket connected");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "MARKET_STRENGTH") {
  setMarketStrength(
    data.payload.map(p => ({
      pair: p.symbol,
      strength: p.strength,
      trend: p.bias ? p.bias : "Unknown",
      color: p.signal || "neutral",
    }))
  );
}



      if (data.type === "TOP_PAIR") setTopPair(data.payload);
    };

    ws.onclose = () => console.log("Brain WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error", err);
  };

  initializeWebSocket();

  return () => {
    if (ws) ws.close();
  };
}, []);

useEffect(() => {
  const fetchNews = async () => {
    try {
      const resp = await fetch("http://localhost:5000/api/news/today");
      const data = await resp.json();
      if (data.success && Array.isArray(data.data)) {
        setTodayNews(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch news:", err);
    }
  };

  fetchNews();
  const interval = setInterval(fetchNews, 60000); // refresh every 60s
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!todayNews.length) {
    setCurrentNews(null);
    setNextNews(null);
    setRecentNewsWithinHour(null);
    setCountdown("00:00:00");
    return;
  }

  const now = new Date();

  // Only high-impact news
  const highImpactNews = todayNews
    .filter(n => n.impact === "🟥")
    .map(n => {
      if (!n.time || n.time.toLowerCase() === "tentative") return null;
      const match = n.time.toLowerCase().match(/(\d+):(\d+)(am|pm)/);
      if (!match) return null;

      let hours = parseInt(match[1], 10);
      let minutes = parseInt(match[2], 10);
      const period = match[3];

      if (period === "pm" && hours !== 12) hours += 12;
      if (period === "am" && hours === 12) hours = 0;

      const dateTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );

      return { ...n, dateTime };
    })
    .filter(n => n)
    .sort((a, b) => a.dateTime - b.dateTime);

  // 🟥 Ongoing: now to 15 min after
  const ongoing = highImpactNews.find(
    n => now >= n.dateTime && now <= new Date(n.dateTime.getTime() + 15 * 60 * 1000)
  );

  // 🟧 Upcoming: 1h before until start
  const upcoming = highImpactNews.find(
    n => now >= new Date(n.dateTime.getTime() - 60 * 60 * 1000) && now < n.dateTime
  );

  // 🟩 Cooling: 15min to 1h after
  const recent = highImpactNews.find(
    n => now > new Date(n.dateTime.getTime() + 15 * 60 * 1000) && now <= new Date(n.dateTime.getTime() + 60 * 60 * 1000)
  );

  setCurrentNews(ongoing || null);
  setNextNews(upcoming || null);
  setRecentNewsWithinHour(recent || null);

  const getHHMMSS = (totalSeconds) => {
    const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  let initialCountdown = 0;
  if (ongoing) {
    initialCountdown = Math.max(
      0,
      Math.floor((ongoing.dateTime.getTime() + 15 * 60 * 1000 - now.getTime()) / 1000)
    );
  } else if (upcoming) {
    initialCountdown = Math.max(
      0,
      Math.floor((upcoming.dateTime.getTime() - now.getTime()) / 1000)
    );
  } else if (recent) {
    initialCountdown = Math.max(
      0,
      Math.floor((recent.dateTime.getTime() + 60 * 60 * 1000 - now.getTime()) / 1000)
    );
  }

  setCountdown(getHHMMSS(initialCountdown));

  const timer = setInterval(() => {
    setCountdown(prev => {
      if (!prev) return "00:00:00";
      const [h, m, s] = prev.split(":").map(Number);
      let totalSeconds = h * 3600 + m * 60 + s;
      totalSeconds = Math.max(0, totalSeconds - 1);
      return getHHMMSS(totalSeconds);
    });
  }, 1000);

  return () => clearInterval(timer);

}, [todayNews]);


useEffect(() => {
  const interval = setInterval(() => {
    loadBrainData(false); // refresh in background silently
  }, 5000); // 5000ms = 5 seconds

  return () => clearInterval(interval); // cleanup on unmount
}, []);
useEffect(() => {
  fetchEaUpdates(); // initial fetch
  const interval = setInterval(fetchEaUpdates, 2000); // fetch every 2 seconds
  return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (eaUpdatedTrades[0]?.tradeActivated === "CLOSED") {
    const timer = setTimeout(() => setEaUpdatedTrades([]), 5000); // remove after 5s
    return () => clearTimeout(timer);
  }
}, [eaUpdatedTrades]);

// Auto-refresh filtered signals every 5 seconds
useEffect(() => {
  const fetchFilteredSignals = async () => {
    try {
      const resp = await APIControl.fetchFilteredSignals();
      if (resp.success) {
        // Make sure it's a new array reference to force re-render
        setFilteredSignals([...resp.data]);
        console.log("Filtered signals updated:", resp.data);
      }
    } catch (err) {
      console.error("Failed to fetch filtered signals:", err);
    }
  };

  fetchFilteredSignals(); // initial fetch
  const interval = setInterval(fetchFilteredSignals, 5000); // refresh every 5 seconds
  return () => clearInterval(interval); // cleanup on unmount
}, []);

useEffect(() => {
  const initialize = async () => {
    try {
      // Load saved RMS settings
      const resp = await APIControl.fetchRmsSettings();
      if (resp.success && resp.data) {
        const s = resp.data;
        setSettings({
          maxTrades: s.maxTrades ?? 1,
          risk: s.risk ?? 1,
          dailyMaxLoss: s.dailyMaxLoss ?? 1,
          tpTargets: s.tpTargets ?? "tp1",
        });
      }

     // Load initial brain data once, show loader only for first load
await loadBrainData(true);

    } catch (err) {
      console.error("Failed to initialize RMS settings or brain data", err);
    }
  };

  initialize();
}, []);
// Send pendingTrade to backend for calculation whenever it changes
useEffect(() => {
  if (!pendingTrade) return;

  const sendTradeToBackend = async () => {
    try {
      // Prepare a clean trade object with live balance and numeric values
      const tradeToSend = {
        ...pendingTrade,
        initialBalance: accountTotals.balance, // live balance from MT + Prop
        risk: settings.risk,
        tpTargets: settings.tpTargets,
        dailyMaxLoss: settings.dailyMaxLoss,
        entry: Number(pendingTrade.entry) || 0,
        sl: Number(pendingTrade.sl) || 0,
        tp: Number(pendingTrade.tp) || 0
      };

      const resp = await fetch('http://localhost:5000/api/ftsacalculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingTrade: tradeToSend }),
      });

      if (!resp.ok) throw new Error('Failed to send trade to backend');
      const data = await resp.json();

      if (data?.data) {
        const { signalJson, trendJson } = data.data;

        // Update EA trades with backend-calculated results
        setEaUpdatedTrades([{
          tradeActivated: trendJson.tradeActivated,
          lots: signalJson.lots,
          tp: signalJson.tp,
          sl: signalJson.sl
        }]);

        // Also update pendingTrade with calculated TP/SL if needed
        setPendingTrade(prev => ({
          ...prev,
          tp: signalJson.tp,
          sl: signalJson.sl,
          lots: signalJson.lots,
          tradeActivated: trendJson.tradeActivated
        }));
      }
    } catch (err) {
      console.error('Error sending trade to backend:', err);
    }
  };

  sendTradeToBackend();
}, [pendingTrade, accountTotals.balance, settings.risk, settings.tpTargets, settings.dailyMaxLoss]);

// List of all major and minor currency pairs
const allPairs =  [
  // Forex
  "EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","NZDUSD","USDCAD",
  "EURGBP","EURJPY","EURCHF","EURAUD","EURCAD","EURNZD",
  "GBPJPY","GBPCHF","GBPAUD","GBPCAD","GBPNZD",
  "AUDJPY","AUDNZD","AUDCHF","AUDCAD",
  "CADJPY","CADCHF","CHFJPY",
  "NZDJPY","NZDCHF","NZDCAD",

  // Indices
  "US30","NAS100",

  // Metals
  "XAUUSD",

  // Crypto
  "BTCUSD","ETHUSD"
];


  return (
    <div
      style={{
        color: "#00FFFF",
        fontFamily: "Orbitron",
        backgroundColor: "#000000",
        padding: "1rem",
        minHeight: "100vh",
      }}
    >
      
  <h1 style={{ textShadow: "0 0 8px #00FFFF" }}>FTSA AI Brain Control</h1>
  {currentUser && (
  <h3 style={{ marginTop: "0.5rem" }}>
    <span style={{ color: "#00FFFF", textShadow: "0 0 6px #00FFFF" }}>Welcome, </span>
    <span style={{ color: "#00FF00", textShadow: "0 0 8px #00FF00" }}>
      {currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1)}!
    </span>
  </h3>
)}
<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start" }}>
  {/* High-Impact News Panel */}
  <div style={{
    textAlign: "right",
    fontSize: "0.9rem",
    backgroundColor: "#111",
    border: "2px solid #00FFFF",
    borderRadius: "8px",
    padding: "0.5rem 1rem",
    minWidth: "280px",
    boxShadow: "0 0 10px #00FFFF"
  }}>
    {currentNews ? (
      <>
        <div>{currentNews.currency} 🟥 ONGOING</div>
        <div>{currentNews.event}</div>
        <div>{currentNews.date} {currentNews.time} | Ends in {countdown}s</div>
      </>
    ) : nextNews ? (
      <>
        <div>{nextNews.currency} 🟧 Upcoming</div>
        <div>{nextNews.event}</div>
        <div>{nextNews.date} {nextNews.time} | Countdown: {countdown}s</div>
      </>
    ) : recentNewsWithinHour ? (
      <>
        <div>{recentNewsWithinHour.currency} 🟩 Ended</div>
        <div>Waiting market to stabilize</div>
        <div>Countdown: {countdown}s</div>
      </>
    ) : (
      <>
        <div>⚪ No High-Impact Event</div>
        <div>[—]</div>
        <div>[—]</div>
      </>
    )}
  </div>
</div>

      {loading && <p style={{ color: "#00FFFF" }}>Loading AI brain data...</p>}
      {error && <p style={{ color: "#FF0000" }}>{error}</p>}
      {/* Today's Trade */}
<section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Today's Trade</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "700px" }}>
      <thead>
        <tr>
          <th style={thShadowStyle}>Time</th>
          <th style={thShadowStyle}>Type</th>
          <th style={thShadowStyle}>Mode</th>
          <th style={thShadowStyle}>Pair</th>
          <th style={thShadowStyle}>Trend</th>
          <th style={thShadowStyle}>Entry</th>
          <th style={thShadowStyle}>SL</th>
          <th style={thShadowStyle}>TP</th>
          <th style={thShadowStyle}>Trade Activated</th>
        </tr>
      </thead>
     <tbody>
  {pendingTrade ? (
    <tr key="pending" style={{ backgroundColor: "#000000" }}>
      <td style={tdVerticalLineStyle}>{pendingTrade.time}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.type}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.mode}</td>
      <td style={tdVerticalLineStyle}>{pendingTrade.symbol}</td>
      <td style={{ ...tdVerticalLineStyle, textAlign: "center", color: pendingTrade.trend === "bullish" ? "#00FF00" : "#FF0000" }}>
        {pendingTrade.trend}
      </td>
      <td style={tdVerticalLineStyle}>{pendingTrade.entry}</td>
<td style={tdVerticalLineStyle}>{pendingTrade.sl}</td>
<td style={tdVerticalLineStyle}>{pendingTrade.tp}</td>

<td style={lastTdStyle}>
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "8px",
    backgroundColor: eaUpdatedTrades[0]?.tradeActivated === "ACTIVE" ? "#00FF00" :
                     eaUpdatedTrades[0]?.tradeActivated === "CLOSED" ? "#FF0000" : "#FFA500",
    color: "#000",
    fontWeight: "bold"
  }}>
    {eaUpdatedTrades[0]?.tradeActivated || "Pending"}
  </span>
</td>

    </tr>
  ) : (
    <tr>
      <td colSpan={9} style={{ textAlign: "center" }}>No trades yet</td>
    </tr>
  )}
</tbody>

    </table>
  </div>
</section>
{cotData && (
<section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Commitments of Traders Report (COT)</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "700px" }}>
      <thead>
        <tr>
          <th style={thShadowStyle}>Pair</th>
          <th style={thShadowStyle}>Currency</th>
          <th style={thShadowStyle}>Long</th>
          <th style={thShadowStyle}>Short</th>
          <th style={thShadowStyle}>Net</th>
          <th style={thShadowStyle}>Percent %</th>
          <th style={thShadowStyle}>Bias</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={tdVerticalLineStyle}>{cotData.pair}</td>
          <td style={tdVerticalLineStyle}>{cotData.cotCurrency}</td>
          <td style={tdVerticalLineStyle}>{cotData.nonCommercial.long}</td>
          <td style={tdVerticalLineStyle}>{cotData.nonCommercial.short}</td>
          <td style={tdVerticalLineStyle}>{cotData.nonCommercial.net}</td>
          <td style={tdVerticalLineStyle}>{cotData.nonCommercial.percent}</td>
          <td style={{ ...lastTdStyle, color: cotData.bias?.includes("bull") ? "#00FF00" : "#FF0000" }}>
            {cotData.bias}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</section>
)}
{pendingTrade && topDownData && (
  <section style={scrollableTableContainer}>
    <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Top-Down Strength (TDS)</h2>
    <div style={{ overflowX: "auto" }}>
      <table style={{ ...tableStyle, minWidth: "600px" }}>
        <thead>
          <tr>
            <th style={thShadowStyle}>Symbol</th>
            <th style={thShadowStyle}>1D</th>
            <th style={thShadowStyle}>4H</th>
            <th style={thShadowStyle}>1H</th>
            <th style={thShadowStyle}>30M</th>
            <th style={thShadowStyle}>multiTFBias</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdVerticalLineStyle}>{topDownData.symbol}</td>
            <td style={tdVerticalLineStyle}>{topDownData.timeframes["1D"].bias}</td>
            <td style={tdVerticalLineStyle}>{topDownData.timeframes["4H"].bias}</td>
            <td style={tdVerticalLineStyle}>{topDownData.timeframes["1H"].bias}</td>
            <td style={tdVerticalLineStyle}>{topDownData.timeframes["30M"].bias}</td>
            <td style={lastTdStyle}>{topDownData.multiTFBias}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
)}

      {/* Market Strength Table */}
      <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Market Strength</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "400px" }}>
      <thead>
        <tr>
          <th style={{ ...thShadowStyle, textAlign: "left" }}>Pair</th>
<th style={{ ...thShadowStyle, textAlign: "right" }}>Strength %</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trend</th>
        </tr>
      </thead>
      <tbody>
        {marketStrength?.length > 0 ? (
          marketStrength.map((row, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: row.pair === topPair ? "#002255" : "transparent",
                fontWeight: row.pair === topPair ? "bold" : "normal",
              }}
            >
              <td style={tdVerticalLineStyle}>{row.pair}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "right" }}>{row.strength}</td>
<td style={{ ...lastTdStyle, textAlign: "center", color: row.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
  {row.trend}
</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={3} style={{ textAlign: "center" }}>No data</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
   {/* Trading View Signals */}
<section style={{ ...scrollableTableContainer, maxHeight: "300px", overflowY: "auto" }}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Trading View Signals</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "750px" }}>
      <thead>
  <tr>
    <th style={thShadowStyle}>Symbol</th>
    <th style={thShadowStyle}>Type</th>
    <th style={thShadowStyle}>Status</th>
    <th style={thShadowStyle}>Choch</th>
    <th style={thShadowStyle}>Entry</th>
    <th style={thShadowStyle}>SL</th>
    <th style={thShadowStyle}>TP</th>
    <th style={thShadowStyle}>Timeframe</th>
  </tr>
</thead>

      <tbody>
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal, idx) => (
           <tr
  key={idx}
  style={{
    backgroundColor: signal.type === "BUY" ? "#003300" :
                     signal.type === "SELL" ? "#330000" : "transparent",
    color: signal.type === "BUY" ? "#00FF00" :
           signal.type === "SELL" ? "#FF0000" : "#00FFFF"
  }}
>
  <td style={tdVerticalLineStyle}>{signal.symbol}</td>
  <td style={tdVerticalLineStyle}>
    {signal.type === "BUY" && <span style={{ color: "#00FF00" }}>↑ BUY</span>}
    {signal.type === "SELL" && <span style={{ color: "#FF0000" }}>↓ SELL</span>}
    {!["BUY","SELL"].includes(signal.type) && signal.type}
  </td>
  <td style={tdVerticalLineStyle}>{signal.status || "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.choch ? `${signal.choch} (${signal.chochType})` : "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.entry ?? "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.sl ?? "-"}</td>
  <td style={tdVerticalLineStyle}>{signal.tp3 ?? "-"}</td>
  <td style={lastTdStyle}>{signal.timeframe || "-"}</td>
</tr>

          ))
        ) : (
          <tr>
            <td colSpan={10} style={{ textAlign: "center" }}>No signals available</td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</section>
{/* Risk Management Settings */}
<section
  style={{
    marginBottom: "2rem",
    border: "1px solid #00FFFF",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 0 10px #00FFFF",
  }}
>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Risk Management Settings</h2>

  {/* Max Trades / Day */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Max Trades / Day:</p>
    <select
      value={settings.maxTrades || 1}
      onChange={(e) => {
        const maxTrades = parseInt(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, maxTrades };
          APIControl.saveRmsSettings(updated);
          return updated;
        });
      }}
    >
      <option value={1}>1</option>
      <option value={2}>2</option>
      <option value={3}>3</option>
    </select>
  </div>

  {/* Risk % per Trade */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Risk % per Trade:</p>
    <select
      value={settings.risk || 1}
      onChange={(e) => {
        const risk = parseFloat(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, risk };
          APIControl.saveRmsSettings(updated);
          return updated;
        });
      }}
    >
      <option value={0.25}>0.25%</option>
      <option value={0.5}>0.5%</option>
      <option value={0.75}>0.75%</option>
      <option value={1}>1%</option>
      <option value={1.25}>1.25%</option>
      <option value={1.5}>1.5%</option>
      <option value={1.75}>1.75%</option>
      <option value={2}>2%</option>
    </select>
  </div>

  {/* Daily Max Loss % */}
  <div style={{ marginBottom: "1rem" }}>
    <p>Daily Max Loss %:</p>
    <select
      value={settings.dailyMaxLoss || 1}
      onChange={(e) => {
        const dailyMaxLoss = parseFloat(e.target.value);
        setSettings(prev => {
          const updated = { ...prev, dailyMaxLoss };
          APIControl.saveRmsSettings(updated)
          return updated;
        });
      }}
    >
      <option value={0.25}>0.25%</option>
      <option value={0.5}>0.5%</option>
      <option value={0.75}>0.75%</option>
      <option value={1}>1%</option>
      <option value={1.25}>1.25%</option>
      <option value={1.5}>1.5%</option>
      <option value={1.75}>1.75%</option>
      <option value={2}>2%</option>
    </select>
  </div>

  {/* TP Targets */}
  <div style={{ marginBottom: "1rem" }}>
    <p>TP Targets:</p>
    <select
      value={settings.tpTargets || "tp1"}
      onChange={(e) => {
  const tpTargets = e.target.value;
  setSettings(prev => {
    const updated = { ...prev, tpTargets };
    APIControl.saveRmsSettings(updated); // ✅ Fixed
    return updated;
  });
}}

    >
      <option value="tp1">TP1</option>
      <option value="tp2">TP2</option>
      <option value="tp3">TP3</option>
    </select>
  </div>

  <div>
    <NeonButton
  onClick={async () => {
    try {
      await APIControl.saveRmsSettings(settings);
      setSaveMessage("✅ Settings saved successfully!");
      setTimeout(() => setSaveMessage(""), 3000); // hide after 3s
    } catch (err) {
      console.error(err);
      setSaveMessage("❌ Failed to save settings.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  }}
>
  Save Risk Management Settings
</NeonButton>
{saveMessage && <p style={{ color: "#00FF00", marginTop: "0.5rem" }}>{saveMessage}</p>}
  </div>
</section>

{/* Risk State Center */}
<section
  style={{
    marginBottom: "2rem",
    border: "1px solid #00FFFF",
    padding: "1rem",
    borderRadius: "12px",
    boxShadow: "0 0 10px #00FFFF",
  }}
>
 <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem"
  }}
>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>
    Risk State Center (RSC)
  </h2>

  <button
  onClick={toggleRSC}
  disabled={togglingRSC} // disable while processing
  style={{
    padding: "6px 14px",
    borderRadius: "20px",
    border: "1px solid #00FFFF",
    background: riskState?.autoTrade?.status === "RUNNING" ? "#003300" : "#330000",
    color: riskState?.autoTrade?.status === "RUNNING" ? "#00FF00" : "#FF0000",
    cursor: togglingRSC ? "not-allowed" : "pointer",
    fontFamily: "Orbitron"
  }}
>
  {togglingRSC ? "Toggling..." : riskState?.autoTrade?.status === "RUNNING" ? "ON" : "OFF"}
</button>
</div>

  {!riskState ? (
    <p>Loading Risk State...</p>
  ) : (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>

        <tr>
          <td>Date</td>
          <td>{riskState.date}</td>
        </tr>

        <tr>
          <td>Status</td>
          <td
            style={{
              color:
                riskState.autoTrade.status === "RUNNING"
                  ? "#00FF00"
                  : "#FF0000",
            }}
          >
            {riskState.autoTrade.status}
          </td>
        </tr>

        <tr>
          <td>Max Trades</td>
          <td>{riskState.limits.maxTrades}</td>
        </tr>

        <tr>
          <td>Daily Max Loss</td>
          <td>{riskState.limits.dailyMaxLoss}%</td>
        </tr>

        <tr>
          <td>Trades Taken</td>
          <td>{riskState.today.tradesTaken}</td>
        </tr>

        <tr>
          <td>Remaining Trades</td>
          <td>{riskState.today.remainingTrades}</td>
        </tr>

        <tr>
          <td>Total Loss Today</td>
          <td>{riskState.today.totalLossPercent}%</td>
        </tr>

        <tr>
          <td>Pending Trades</td>
          <td>{riskState.todayTrades.pending}</td>
        </tr>

        <tr>
          <td>Active Trades</td>
          <td>{riskState.todayTrades.active}</td>
        </tr>

        <tr>
          <td>Closed Trades</td>
          <td>{riskState.todayTrades.closed}</td>
        </tr>

        <tr>
          <td>Can Trade</td>
          <td
            style={{
              color: riskState.permissions.canTrade
                ? "#00FF00"
                : "#FF0000",
            }}
          >
            {riskState.permissions.canTrade ? "YES" : "NO"}
          </td>
        </tr>

        <tr>
          <td>Blocked Reason</td>
          <td>{riskState.permissions.blockedReason || "-"}</td>
        </tr>

      </tbody>
    </table>
  )}
</section>
{/* Top 3 Pairs */}
   <section style={scrollableTableContainer}>
  <h2 style={{ textShadow: "0 0 5px #00FFFF" }}>Top 3 Pairs</h2>
  <div style={{ overflowX: "auto" }}>
    <table style={{ ...tableStyle, minWidth: "400px" }}>
      <thead>
        <tr>
         <th style={{ ...thShadowStyle, textAlign: "left" }}>Selected Pair</th>
<th style={{ ...thShadowStyle, textAlign: "right" }}>Strength %</th>
<th style={{ ...thShadowStyle, textAlign: "center" }}>Trend</th>
        </tr>
      </thead>
      <tbody>
        {[...marketStrength]
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 3)
          .map((row, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: row.pair === topPair ? "#002255" : "transparent",
                fontWeight: row.pair === topPair ? "bold" : "normal",
              }}
            >
              <td style={tdVerticalLineStyle}>{row.pair}</td>
<td style={{ ...tdVerticalLineStyle, textAlign: "right" }}>{row.strength}</td>
<td style={{ ...lastTdStyle, textAlign: "center", color: row.trend === "Bullish" ? "#00FF00" : "#FF0000" }}>
  {row.trend}
</td>

            </tr>
          ))}
      </tbody>
    </table>
  </div>
</section>
 
    </div>
  );
}
