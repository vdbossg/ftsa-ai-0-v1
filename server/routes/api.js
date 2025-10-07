const express = require('express');
const router = express.Router();

/* ===== Controllers ===== */
const {
  getMTAccount,
  connectMT,
  deleteMT,
} = require('../controllers/mtaccountController');

/* ===== MT Accounts (Real Mongo + Python Integration) ===== */
router.get('/mtaccounts', getMTAccount);
router.post('/mtaccounts/connect', connectMT);
router.delete('/mtaccounts', deleteMT);

/* ===== Prop Firm Accounts (keep demo in-memory for now) ===== */
let propFirmAccounts = [];
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

/* ===== Binance Accounts (keep demo too) ===== */
let binanceAccounts = [];
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
        propFirmAccounts,
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
