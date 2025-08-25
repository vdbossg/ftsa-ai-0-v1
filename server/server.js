// server/server.js
require('dotenv').config();  // ✅ Load environment variables from server/.env
const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRoutes = require('./routes/api');
const eaRoutes = require('./routes/eaRoutes');
const mtAccountRoutes = require('./routes/mtAccountRoutes');           // ✅ Added
const propFirmRoutes = require('./routes/propFirmAccountRoutes');      // ✅ Added
const userRoutes = require('./routes/user');   // ✅ correct relative path
const mpesaRoutes = require('./routes/mpesaRoutes'); // Add this near your other routes
const cfaRoutes = require('./routes/cfaRoutes');
const connectDB = require('./config/db');
console.log('MONGO_URI:', process.env.MONGO_URI);
connectDB(); // Connect to MongoDB



const app = express();
const PORT = process.env.PORT || 5000;  // ✅ Ensure backend runs on 5000 for your setup

const allowedOrigins = [
  'http://localhost:5173',               // Vite dev server
  'http://localhost:3000',               // optional
  'https://ftsa-ai.com',                 // production domain
  'https://ftsa-ai-0-v1.netlify.app'    // your Netlify frontend
];



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
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ftsa-ai.com',
    'https://ftsa-ai-0-v1.netlify.app'
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Private-Network', 'true'); // ✅ important
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // ✅ preflight OK
  }

  next();
});

app.use('/api/user', userRoutes);
console.log('✅ /api/user routes mounted');
// API routes
app.use('/api', apiRoutes);
app.use('/api/ea', eaRoutes);                   // Existing
app.use('/cfa', cfaRoutes);
app.use('/api/mtaccounts', mtAccountRoutes);    // ✅ Added
app.use('/api/propfirmaccounts', propFirmRoutes); // ✅ Added
app.use('/api/mpesa', mpesaRoutes);  // ← add this line
console.log('✅ /api/mpesa routes mounted'); 

// FTSA AI Brain Routes
app.use('/api/news', require('./routes/newsRoutes'));
app.use('/api/bias', require('./routes/biasRoutes'));
app.use('/api/choch', require('./routes/chochRoutes'));
app.use('/api/equity', require('./routes/equityRoutes'));
// FTSA AI Brain Main Routes
app.use('/api/brain', require('./routes/brainRoutes'));




// Simple test route
app.get('/', (req, res) => {
  res.send('FTSA AI Backend Server running');
});


// ✅ Status route for frontend
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
