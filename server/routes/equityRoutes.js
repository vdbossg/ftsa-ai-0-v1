// server/routes/equityRoutes.js
const express = require('express');
const router = express.Router();

// GET equity report status (future expansion if needed)
router.get('/', async (req, res) => {
  res.json({ message: 'Equity route active' });
});

// POST equity data from EA
router.post('/', async (req, res) => {
  const { balance, equity } = req.body;
  console.log(`📊 Equity update: Balance=${balance}, Equity=${equity}`);

  // TODO: Add logic to decide if EA should close trades based on profit target
  // For now, just acknowledge receipt
  res.json({ ok: true });
});

module.exports = router;
