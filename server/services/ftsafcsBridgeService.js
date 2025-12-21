const axios = require("axios");
const { saveSignal } = require("./fcsService");

const FTSA_API_URL = "http://localhost:5000/api/ftsacalculator";
const POLL_INTERVAL_MS = 3000;

let lastSignalHash = null;

// normalize signal (important for clean comparison)
function normalizeSignal(signal) {
  const normalized = { ...signal };

  // P → p
  if ("Price" in normalized) {
    normalized.price = normalized.Price;
    delete normalized.Price;
  }

  return normalized;
}

function hashSignal(signal) {
  return JSON.stringify(signal);
}

async function pollAndBridge() {
  try {
    const res = await axios.get(FTSA_API_URL);
    if (!res.data || !res.data.signalJson) return;

    const normalizedSignal = normalizeSignal(res.data.signalJson);
    const currentHash = hashSignal(normalizedSignal);

    // if same as last sent → do nothing
    if (currentHash === lastSignalHash) return;

    // NEW SIGNAL FOUND → SAVE TO FCS
   saveSignal(normalizedSignal);


    lastSignalHash = currentHash;

    console.log("✅ New signal bridged to FCS:", normalizedSignal);

  } catch (err) {
    console.error("❌ Bridge error:", err.message);
  }
}

function startBridge() {
  console.log("🚀 FTSA → FCS Bridge started");
  setInterval(pollAndBridge, POLL_INTERVAL_MS);
}

module.exports = { startBridge };
