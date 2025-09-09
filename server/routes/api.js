const express = require('express');
const router = express.Router();

// In-memory storage for demo (replace with DB or API calls later)
let mtAccounts = [];
let propFirmAccounts = [];
let binanceAccounts = [];

/* ===== MT Accounts ===== */
// GET all MT accounts
router.get('/mtaccounts', (req, res) => res.json({ success: true, data: mtAccounts }));

// GET MT account by id
router.get('/mtaccounts/:id', (req, res) => {
  const acc = mtAccounts.find(a => a.id === req.params.id);
  if (!acc) return res.status(404).json({ success: false, message: 'MT account not found' });
  res.json({ success: true, data: acc });
});

// POST new MT account
router.post('/mtaccounts', (req, res) => {
  const newAcc = req.body;
  if (!newAcc.id) return res.status(400).json({ success: false, message: 'ID required' });
  mtAccounts.push(newAcc);
  res.json({ success: true, data: newAcc });
});

// PUT update MT account
router.put('/mtaccounts/:id', (req, res) => {
  const index = mtAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'MT account not found' });
  mtAccounts[index] = { ...mtAccounts[index], ...req.body };
  res.json({ success: true, data: mtAccounts[index] });
});

// DELETE MT account
router.delete('/mtaccounts/:id', (req, res) => {
  const index = mtAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'MT account not found' });
  const deleted = mtAccounts.splice(index, 1);
  res.json({ success: true, data: deleted[0] });
});

/* ===== Prop Firm Accounts ===== */
router.get('/propfirms', (req, res) => res.json({ success: true, data: propFirmAccounts }));
router.post('/propfirms', (req, res) => {
  const newAcc = req.body;
  if (!newAcc.id) return res.status(400).json({ success: false, message: 'ID required' });
  propFirmAccounts.push(newAcc);
  res.json({ success: true, data: newAcc });
});
router.put('/propfirms/:id', (req, res) => {
  const index = propFirmAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Prop firm account not found' });
  propFirmAccounts[index] = { ...propFirmAccounts[index], ...req.body };
  res.json({ success: true, data: propFirmAccounts[index] });
});
router.delete('/propfirms/:id', (req, res) => {
  const index = propFirmAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Prop firm account not found' });
  const deleted = propFirmAccounts.splice(index, 1);
  res.json({ success: true, data: deleted[0] });
});

/* ===== Binance Accounts ===== */
router.get('/binance', (req, res) => res.json({ success: true, data: binanceAccounts }));
router.post('/binance', (req, res) => {
  const newAcc = req.body;
  if (!newAcc.id) return res.status(400).json({ success: false, message: 'ID required' });
  binanceAccounts.push(newAcc);
  res.json({ success: true, data: newAcc });
});
router.put('/binance/:id', (req, res) => {
  const index = binanceAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Binance account not found' });
  binanceAccounts[index] = { ...binanceAccounts[index], ...req.body };
  res.json({ success: true, data: binanceAccounts[index] });
});
router.delete('/binance/:id', (req, res) => {
  const index = binanceAccounts.findIndex(a => a.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Binance account not found' });
  const deleted = binanceAccounts.splice(index, 1);
  res.json({ success: true, data: deleted[0] });
});
/* ===== User Info (Homepage Overview) ===== */
router.get('/user/info', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        // Account balance = sum of all account balances
        accountBalance: [
          ...mtAccounts,
          ...propFirmAccounts,
          ...binanceAccounts,
        ].reduce((sum, acc) => sum + (acc.balance || 0), 0),

        // Open positions = total across all accounts
        openPositions: [
          ...mtAccounts,
          ...propFirmAccounts,
          ...binanceAccounts,
        ].reduce((sum, acc) => sum + (acc.openPositions || 0), 0),

        // Profit/Loss = sum across all accounts
        profitLoss: [
          ...mtAccounts,
          ...propFirmAccounts,
          ...binanceAccounts,
        ].reduce((sum, acc) => sum + (acc.profitLoss || 0), 0),

        // Pass full prop firm accounts for frontend display
        propFirmAccounts,

        // Market news placeholder (replace with real feed later if needed)
        marketNews: [
          "US Inflation report released today...",
          "EUR/USD volatility expected this week...",
        ],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
