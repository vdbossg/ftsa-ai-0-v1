// server/routes/propFirmRoutes.js
const express = require('express');
const router = express.Router();

// In-memory storage (replace with DB later)
let propFirmAccounts = [];

// GET all Prop Firm accounts
router.get('/', (req, res) => {
  res.json(propFirmAccounts);
});

// POST save/add Prop Firm account
router.post('/save', (req, res) => {
  const { brokerName, accountID, password, serverName, propFirmName, accountType, platform, currency } = req.body;

  if (!accountID || !password || !serverName) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  // Check if account exists
  const existingIndex = propFirmAccounts.findIndex(acc => acc.accountID === accountID);
  const newAccount = {
    brokerName,
    accountID,
    password,
    serverName,
    propFirmName,
    accountType,
    platform,
    currency,
    balance: 0,
    equity: 0,
    freeMargin: 0,
    marginLevelPct: 0,
    openTrades: 0,
    pendingOrders: 0,
    maxDailyLossLimit: 0,
    maxOverallLossLimit: 0,
    profitTargetAmount: 0,
    profitTargetPercent: 0,
    daysRemaining: 0,
    isActive: false,
  };

  if (existingIndex >= 0) {
    propFirmAccounts[existingIndex] = newAccount;
  } else {
    propFirmAccounts.push(newAccount);
  }

  res.json({ success: true, accounts: propFirmAccounts });
});

// DELETE Prop Firm account
router.delete('/:accountID', (req, res) => {
  const { accountID } = req.params;
  propFirmAccounts = propFirmAccounts.filter(acc => acc.accountID !== accountID);
  res.json({ success: true, accounts: propFirmAccounts });
});

// POST connect Prop Firm account
router.post('/connect', async (req, res) => {
  const { accountID, password, serverName } = req.body;
  if (!accountID || !password || !serverName) {
    return res.status(400).json({ success: false, message: 'Missing accountID, password, or serverName' });
  }

  try {
    const account = propFirmAccounts.find(acc => acc.accountID === accountID);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    // Here you would connect via PropFirm API or MT4/5 bridge
    account.isActive = true;

    res.json({ success: true, message: `Prop Firm account ${accountID} connected successfully`, account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to connect Prop Firm account' });
  }
});

// POST /api/propfirmaccounts/login
router.post('/login', async (req, res) => {
  const { accountID, password, serverName } = req.body;

  if (!accountID || !password || !serverName) {
    return res.status(400).json({ success: false, message: 'Missing accountID, password, or serverName' });
  }

  try {
    // Find the account
    const account = propFirmAccounts.find(acc => acc.accountID === accountID);
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });

    // Mock login/connection to PropFirm account
    account.isActive = true;

    res.json({ success: true, message: `Logged in successfully to Prop Firm account ${accountID}`, account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to login to Prop Firm account' });
  }
});

module.exports = router;
