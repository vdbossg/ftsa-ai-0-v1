const withdrawalService = require('../services/servicesWithdrawalRequest');

// POST /api/WithdrawalRequest/:method/userid/
async function postWithdrawal(req, res) {
  try {
    const method = req.params.method; // e.g., "M-bank", "M-visacard"
    const methodKey = method.toLowerCase().replace('m-', '');
    const data = req.body;
    const saved = await withdrawalService.createWithdrawal(methodKey, data);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating withdrawal:', err);
    res.status(500).json({ error: err.message });
  }
}

// GET /api/WithdrawalRequest/:method/userid/
async function getWithdrawal(req, res) {
  try {
    const method = req.params.method;
    const methodKey = method.toLowerCase().replace('m-', '');
    const withdrawals = await withdrawalService.getWithdrawals(methodKey);
    res.status(200).json(withdrawals);
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { postWithdrawal, getWithdrawal };
