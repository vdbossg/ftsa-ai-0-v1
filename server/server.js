//FTSA_AI_0.v1\server\server.js
//APP A.
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
const propSettingRoutes = require("./routes/propSettingRoutes");
const propAccountRoutes = require("./routes/propAccountRoutes");
const propTradesRoute = require("./routes/propTradesRoute");
const mttabletradesRoutes = require("./routes/mttabletrades.routes");
const propJournalRoutes = require("./routes/propAIJournalRoutes");
const mtJournalRoutes = require("./routes/mtAIJournalRoutes");
const PropTradeService = require('./services/propTradeService');
const MTTradeService = require('./services/mtTradeService');
const propTradeRoutes = require('./routes/propTradeRoutes');
const mtTradeRoutes = require('./routes/mtTradeRoutes');
const licenseRoutes = require('./routes/license');
const settingsRoutes = require('./routes/settingsRoutes'); // CommonJS style
const fcsRoutes = require("./routes/fcsRoutes");
const tvspRoutes = require("./routes/tvsp.routes")
const filterRoutes = require("./routes/filter.routes");
const rmsRouter = require("./routes/rms");
const validTradeRoutes = require("./routes/validTradeRoutes");
const validTradeDataRoutes = require("./routes/validTradeDataRoutes");
const ftsaRoutes = require('./routes/ftsacalculatorRoutes');
const passwordRoutes = require("./routes/password");
const userPhotoRoutes = require("./routes/userPhoto.routes");
const tvAlertRoutes = require('./routes/tvAlertRoutes');
const tvsConverterRoutes = require('./routes/tvsConverter.routes');
const Elimq5Routes = require("./routes/Elimq5Routes");
const proxyTokenRoutes = require("./routes/proxyTokenRoutes");
const ex5LinkerRoutes = require("./routes/ex5LinkerRoutes");
const RoutesEaDownload = require("./routes/RoutesEaDownload");
const gatemanRoutes = require("./routes/gatemanRoutes");
const affiliateRoutes = require('./routes/affiliate'); 
const FTSAHelpRoutes = require("./routes/RoutesFTSAhelp");
const { startBridge } = require("./services/ftsafcsBridgeService");
startBridge();
const ftsaFaqRoutes = require('./routes/routesFtsaFaqs');
const aboutFullDataRoutes = require("./routes/routesAboutfullData");
const myMessageRoutes = require("./routes/routesMymessageData");
const liveAdsRoutes = require('./routes/routesLiveAds');
const scrollingTextsRoutes = require('./routes/routesScrollingtexts');
const newReferralRoutes = require('./routes/routesNewreferrals');
const affiliatestatusRoutes = require('./routes/routesAffiliatestatusMy');
const withdrawalRoutes = require('./routes/routesWithdrawalRequest');







console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB(); // Connect to MongoDB
// 🚀 Start EA EX5 Auto-Compiler Service (runs every 2 seconds)
require("./services/Ea.ex5services");
console.log("✅ EA Compiler Service started");

// 🚀 Start EX5 Linker Service (watch folder & tie files to licenses)
const { startEx5Watcher } = require("./services/ex5LinkerService");
startEx5Watcher();
console.log("✅ EX5 Linker Service started");

const app = express();
const PORT = process.env.PORT || 5000;  // ✅ Ensure backend runs on 5000 for your setup
const path = require("path");
// Serve uploads folder so browser can access profile photos

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Serve uploaded profile photos
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

const allowedOrigins = [
  'http://localhost:5173',               // Vite dev server
  'http://localhost:3000',              // optional
  'http://192.168.1.117:5173',
  'https://ftsa-ai.com',                 // production domain
  'https://ftsa-ai-0-v1.netlify.app'    // your Netlify frontend
];


chochService.connectMongo(process.env.MONGO_URI);

// Start polling Prop and MT trades
PropTradeService.startPolling(5000); // every 5 seconds
MTTradeService.startPolling(5000);
console.log('✅ Prop and MT trade polling started');

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
app.use('/api/mpesa', mpesaRoutes);  // ← add this line
console.log('✅ /api/mpesa routes mounted'); 
app.use("/api/support", supportRoutes);
app.use("/api/faqs", faqsRoute); // Frontend fetchFAQs() → /api/faqs
app.use("/api/support/channels", supportChannelsRoute);
app.use("/api/about", aboutRoutes);
app.use("/api/admin/about", aboutRoutes);
app.use("/api/proptabletrades", propTradesRoute);
app.use("/api/mttabletrades", mttabletradesRoutes);
app.use("/api/auth", authRoutes);
app.use('/dashboard', dashboardRoutes);           // GET /dashboard
app.use('/api/auto-trade', autoTradeRoutes);      // POST /api/auto-trade
app.use('/api/brain/strength', strengthRoutes);
app.use("/api/propsetting", propSettingRoutes);
app.use("/api/propaijournal", propJournalRoutes);
console.log("✅ /api/propaijournal routes mounted")
app.use("/api/binance", binanceRoutes);
console.log("✅ /api/binance routes mounted");
app.use("/api/propaccounts", propAccountRoutes);
console.log("✅ /api/propaccounts routes mounted");
app.use("/api/mtaijournal", mtJournalRoutes);
console.log("✅ /api/mtaijournal routes mounted")
app.use('/api', propTradeRoutes);
console.log('✅ /api/closed-prop-trades routes mounted');
app.use('/api', mtTradeRoutes);
console.log('✅ /api/closed-mt-trades routes mounted')
app.use('/api/licenses', licenseRoutes);
console.log('✅ /api/license routes mounted');
app.use('/api/settings', settingsRoutes);
console.log('✅ /api/settings routes mounted');
app.use("/api/fcs", fcsRoutes);
console.log('✅ /api/fcs routes mounted');
app.use("/api", tvspRoutes)
console.log('✅ /api/tvsp routes mounted');
app.use("/api/filter", filterRoutes);
console.log('✅ /api/filter routes mounted');
app.use("/api/rms", rmsRouter);
console.log('✅ /api/rms routes mounted');
app.use("/api", validTradeRoutes);
console.log('✅ /api/validTrade routes mounted');
app.use("/api", validTradeDataRoutes);
console.log('✅ /api/validTradeData routes mounted');
app.use('/api', ftsaRoutes);
console.log('✅ /api/ftsacalculator routes mounted');
app.use("/api/auth", passwordRoutes);
console.log('✅ /api/passwordRoutes routes mounted');
app.use("/api/user", userPhotoRoutes);
console.log('✅ /api/userPhotoRoutes routes mounted');
app.use('/api/tvAlert', tvAlertRoutes);
console.log('✅ /api/tvAlert routes mounted');
app.use('/api/tvsConverter', tvsConverterRoutes);
console.log('✅ /api/tvsConverter routes mounted');
app.use('/api/affiliate', affiliateRoutes);
console.log('✅ /api/affiliate routes mounted');
app.use("/api", FTSAHelpRoutes);
console.log("✅ /api/FTSA Help routes mounted");
app.use("/api/elimq5", Elimq5Routes);
console.log("✅ /api/elimq5 routes mounted");
const Elimq5Service = require('./services/Elimq5Service');

app.use('/api/byrer', newReferralRoutes);
console.log('✅ /api/byrer routes mounted');
app.use('/api/scrollingtexts', scrollingTextsRoutes);
console.log('✅ /api/scrollingtexts routes mounted');
// Later in server.js, after other `app.use('/api/...')`
app.use('/api/affiliatestatus', affiliatestatusRoutes);
console.log('✅ /api/affiliatestatus routes mounted');

app.use('/api/WithdrawalRequest', withdrawalRoutes);
console.log('✅ /api/WithdrawalRequest routes mounted');


app.use("/api", myMessageRoutes);
console.log("✅ /api/messageData routes mounted");

app.use("/api/aboutfullData", aboutFullDataRoutes);
console.log("✅ /api/aboutfullData route mounted");

// Start automatic polling for EA generation
new Elimq5Service();
console.log('✅ Elimq5Service polling started');
app.use('/api/FtsafaqsData', ftsaFaqRoutes);
console.log('✅ /api/FtsafaqsData routes mounted');
app.use("/api/proxy", proxyTokenRoutes);
console.log("✅ /api/proxyToken routes mounted");
// API routes for EX5 licenses
app.use("/api", ex5LinkerRoutes);
console.log("✅ /api/ex5Linker routes mounted");
app.use("/api", RoutesEaDownload);
console.log("✅ /api/RoutesEaDownload routes mounted");
app.use("/api/gateman", gatemanRoutes);
console.log("✅ /api/gateman routes mounted");

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

app.use('/api/live-ads', liveAdsRoutes);
console.log('✅ /api/live-ads route mounted');



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

const gracefulShutdown = async () => {
  console.log('⚡ Shutting down, closing active trades...');
  await PropTradeService.closeAllActiveTrades();
  await MTTradeService.closeAllActiveTrades();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

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
