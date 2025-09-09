const express = require('express');
const router = express.Router();
const strengthService = require('../services/strengthService');

router.get('/', async (req, res) => {
  const rankedPairs = await strengthService.getRankedPairs();
  res.json(rankedPairs);
});

module.exports = router;
