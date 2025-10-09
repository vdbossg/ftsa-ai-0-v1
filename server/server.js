/// server.js (top of the file)
require('dotenv').config({ path: '../.env' });  // ✅ points to project root .env
require('dotenv').config();  // ✅ Load environment variables from server/.env
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes/api');
const eaRoutes = require('./routes/eaRoutes');
const mt4Routes = require("./routes/mt4accountRoutes");
const mtaccountRoutes = require("./routes/mtAccountRoutes.js"); // match the file name
const propFirmRoutes = require('./routes/propFirmAccountRoutes');      // ✅ Added
const userRoutes = require('./routes/user');   // ✅ correct relative path
const mpesaRoutes = require('./routes/mpesaRoutes'); // Add this near your other routes
const cfaRoutes = require('./routes/cfaRoutes');
const connectDB = require('./config/db');
const adminAffiliateRoutes = require('./routes/adminAffiliateRoutes');  // ✅ add this
const supportRoutes = require("./routes/supportRoutes");
const tradesRouter = require("./routes/trades");
const dashboardRoutes = require('./routes/dashboardRoutes');
const autoTradeRoutes = require('./routes/autoTradeRoutes');
const strengthRoutes = require('./routes/strengthRoutes');
const { startPairWatcher, setWebSocketServer: pairWatcherWS } = require("./services/pairWatcherService");
const { setWebSocketServer: brainWS, updateBrainData } = require('./services/brainService');
const faqsRoute = require("./routes/faqs");
const supportChannelsRoute = require("./routes/supportChannels");
const chochService = require('./services/chochService');
const aboutRoutes = require("./routes/aboutRoutes");
const binanceRoutes = require("./routes/binanceRoutes");
const authRoutes = require("./routes/auth");

console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB(); // Connect to MongoDB



const app = express();
const PORT = process.env.PORT || 5000;  // ✅ Ensure backend runs on 5000 for your setup

const allowedOrigins = [
  'http://localhost:5173',               // Vite dev server
  'http://localhost:3000',              // optional
  'http://192.168.1.117:5173',
  'https://ftsa-ai.com',                 // production domain
  'https://ftsa-ai-0-v1.netlify.app'    // your Netlify frontend
];


chochService.connectMongo(process.env.MONGO_URI);

// ✅ Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked request from: ${origin}`);
      callback(new Error('CORS blocked for origin: ' + origin));
    }
  },
  credentials: true // Needed if sending cookies or auth headers
}));


// Parse JSON requests
app.use(express.json());

// 📝 Log every request
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  if (req.method === 'POST') {
    console.log('📦 Body:', req.body);
  }
  next();
});

app.use('/api/user', userRoutes);
console.log('✅ /api/user routes mounted');
// API routes
app.use('/api', apiRoutes);
app.use('/api/ea', eaRoutes);                   // Existing
app.use('/cfa', cfaRoutes);
app.use("/api/mt4accounts", mt4Routes);
app.use("/api/mtaccounts", mtaccountRoutes);
app.use('/api/propfirmaccounts', propFirmRoutes); // ✅ Added
app.use('/api/mpesa', mpesaRoutes);  // ← add this line
console.log('✅ /api/mpesa routes mounted'); 
app.use("/api/support", supportRoutes);
app.use("/api/faqs", faqsRoute); // Frontend fetchFAQs() → /api/faqs
app.use("/api/support/channels", supportChannelsRoute);
app.use("/api/about", aboutRoutes);
app.use("/api/admin/about", aboutRoutes);
app.use("/api/auth", authRoutes);
app.use('/dashboard', dashboardRoutes);           // GET /dashboard
app.use('/api/auto-trade', autoTradeRoutes);      // POST /api/auto-trade
app.use('/api/brain/strength', strengthRoutes);
app.use("/api/binance", binanceRoutes);
console.log("✅ /api/binance routes mounted");



// FTSA AI Brain Routes
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/bias', require('./routes/biasRoutes'));
app.use('/choch', require('./routes/chochRoutes'));
app.use('/api/equity', require('./routes/equityRoutes'));
// FTSA AI Brain Main Routes
app.use('/api/brain', require('./routes/brainRoutes'));
app.use("/api/trades", tradesRouter);
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/admin/affiliates', adminAffiliateRoutes);
console.log('✅ /api/admin/affiliates routes mounted');



// Simple test route
app.get('/', (req, res) => {
  res.send('FTSA AI Backend Server running');
});


// ✅ Status route for frontend
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});
const http = require('http');
const WebSocket = require('ws');

// Replace app.listen(...) with:
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/brain' });
// server.js (below your wss declaration)
const broadcastBrainData = (type, payload) => {
  // Send to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, payload }));
    }
  });
};

wss.on('connection', (ws) => {
  console.log('💡 Client connected to Brain WS');

  // Listen for messages from frontend if needed
  ws.on('message', async (message) => {
    // Optional: handle incoming messages (like settings updates)
    console.log('Received from client:', message.toString());
  });

  ws.on('close', () => {
    console.log('💡 Client disconnected from Brain WS');
  });
});


const { setWebSocketServer: strongestPairWS, startWatcher } = require('./services/strongestPairWatcher');


strongestPairWS(wss); // connect WS server
startWatcher(5000);    // check every 5 seconds

// Connect WS to brainService and pairWatcherService
brainWS(wss);
pairWatcherWS(wss);
// update brain data every 5 seconds
setInterval(() => {
  updateBrainData().catch(err => console.error("Brain update failed:", err));
}, 5000);
// Push live market strength every 5s
setInterval(async () => {
  try {
    await updateBrainData();  // uses brainService.broadcastBrainData internally
  } catch (err) {
    console.error('Error pushing live strength:', err.message);
  }
}, 5000);

// Start server (both Express + WS)
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT} with WS support`);
});
