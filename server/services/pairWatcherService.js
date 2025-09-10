// server/services/pairWatcherService.js
const { getStrongestPair, updateBrainData } = require("./brainService");
const chochService = require("./chochService"); // must export storeLTF(pair, side, valid)
const commandService = require("./commandService");

let currentPair = null;
let watching = false;
let wss = null; // optional WebSocket for frontend updates
const WATCH_INTERVAL_MS = 5000; // 5s loop

// Set WS server (optional)
function setWebSocketServer(server) {
  wss = server;
}

// Broadcast updates to frontend
function broadcast(type, payload) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify({ type, payload }));
  });
}

// Pick the current strongest pair >= 80 strength
async function pickStrongestPair() {
  const strongest = await getStrongestPair(80);
  if (!strongest) {
    console.log("⏳ No strong pair meets threshold yet");
    return null;
  }
  console.log(`🔥 Picked strongest pair: ${strongest.pair} | strength: ${strongest.strength}`);
  broadcast("TOP_PAIR", strongest);
  return strongest.pair;
}

// Watch current pair for a clean CHoCH or BOS
async function watchCurrentPair() {
  if (watching) return;
  watching = true;

  try {
    if (!currentPair) {
      currentPair = await pickStrongestPair();
      if (!currentPair) return;
    }

    // Fetch latest LTF CHoCH from chochService
    const ltf = await chochService.getLTF(currentPair);

    if (ltf && ltf.valid) {
      console.log(`✅ Clean ${ltf.side} detected on ${currentPair}`);
      broadcast("CHOCH_SIGNAL", { pair: currentPair, side: ltf.side });

      // Send command to EA via commandService
      if (ltf.side === "BUY") await commandService.setBuy(currentPair);
      else if (ltf.side === "SELL") await commandService.setSell(currentPair);

      // Reset after valid signal
      currentPair = null;
    } else {
      console.log(`⏳ Waiting for clean CHoCH/BOS on ${currentPair}`);
    }
  } catch (err) {
    console.error("❌ pairWatcherService error:", err.message || err);
  } finally {
    watching = false;
  }
}

// Start the continuous watcher loop
function startPairWatcher(intervalMs = WATCH_INTERVAL_MS) {
  setInterval(watchCurrentPair, intervalMs);
  console.log(`🚀 Pair watcher started (interval: ${intervalMs}ms)`);
}

module.exports = { startPairWatcher, setWebSocketServer };
