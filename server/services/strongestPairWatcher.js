// server/services/strongestPairWatcher.js
const { getStrongestPair } = require('./brainService');
const chochService = require('./chochService');

let wss = null; // WebSocket server (set from server.js)
let activePair = null; // Currently watched strongest pair

// Set WebSocket server
function setWebSocketServer(server) {
  wss = server;
}

// Broadcast to clients (or command center)
function broadcast(type, payload) {
  if (!wss) return;
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify({ type, payload }));
  });
}

// Core watcher loop
async function startWatcher(intervalMs = 5000) {
  console.log('🚀 Strongest Pair Watcher started...');

  setInterval(async () => {
    try {
      // 1️⃣ Get current strongest pair
      const top = await getStrongestPair(80); // only pairs ≥ 80 strength
      if (!top) {
        console.log('⚠️ No strong pair meets threshold yet.');
        activePair = null;
        broadcast('STRONG_PAIR', { pair: null, valid: false });
        return;
      }

      // 2️⃣ If new strongest pair, reset watcher
      if (activePair !== top.pair) {
        console.log(`🔥 New strongest pair detected: ${top.pair} (${top.strength})`);
        activePair = top.pair;
      }

      // 3️⃣ Check for valid CHoCH/BOS on 15m
      const choch = await chochService.getLTF(activePair);

      if (choch && choch.valid) {
        console.log(`✅ Clean CHoCH/BOS detected for ${activePair}: ${choch.side}`);
        broadcast('TOP_PAIR_CHoCH', { pair: activePair, side: choch.side, valid: true });
      } else {
        broadcast('TOP_PAIR_CHoCH', { pair: activePair, side: null, valid: false });
      }

    } catch (err) {
      console.error('❌ StrongestPairWatcher error:', err.message || err);
    }
  }, intervalMs);
}

module.exports = { setWebSocketServer, startWatcher };
