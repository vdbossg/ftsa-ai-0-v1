// server/controllers/biasController.js
const biasService = require('../services/biasService');

exports.getBias = async (req, res) => {
  const bias = await biasService.getBias();
  res.json(bias);
};

exports.setBias = async (req, res) => {
  const { symbol, direction, confidence } = req.body;
  const updated = await biasService.setBias(symbol, direction, confidence);
  res.json(updated);
};
