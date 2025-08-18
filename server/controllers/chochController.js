// server/controllers/chochController.js
const chochService = require('../services/chochService');

exports.storeChoch = async (req, res) => {
  const { symbol, side, valid } = req.body;
  await chochService.storeLTFChoch(symbol, side, valid);
  res.json({ ok: true });
};

exports.getChoch = async (req, res) => {
  const symbol = req.query.symbol;
  const data = await chochService.getLTFChoch(symbol);
  res.json(data);
};
