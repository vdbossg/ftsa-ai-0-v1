//C:\Users\LENOVO\Desktop\FTSA_AI_0.v1\server\controllers\fcsController.js
const { getLatestSignal, saveSignal } = require("../services/fcsService");

exports.getSignal = (req, res) => {
  const signal = getLatestSignal();
  if (!signal) return res.status(404).json({ message: "No signal available" });
  res.json(signal);
};

exports.sendSignal = (req, res) => {
  const signal = req.body;
  const saved = saveSignal(signal);
  if (!saved) return res.status(400).json({ message: "Failed to save signal" });
  res.json(saved);
};
