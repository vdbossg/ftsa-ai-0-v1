const axios = require("axios");
const PropSetting = require("../models/PropSetting");

// Helper function to compute profit % and status
const calculateProgress = (balance, equity, setting) => {
  const profitGain = ((equity - balance) / balance) * 100;
  const maxLoss = (balance * (setting.maxDrawdown / 100));
  const dailyLoss = (balance * (setting.dailyDrawdown / 100));

  let status = "active";
  if (profitGain >= setting.profitTarget) status = "completed";
  if (equity < balance - maxLoss || equity < balance - dailyLoss) status = "failed";

  return {
    ...setting.toObject(),
    currentProfit: parseFloat(profitGain.toFixed(2)),
    status,
  };
};

// Fetch all prop firm accounts and update their progress
exports.getAllPropSettings = async () => {
  const settings = await PropSetting.find();

  const results = await Promise.all(
    settings.map(async (setting) => {
      try {
        // Fetch live account info (already provided by your backend)
        const { data } = await axios.get(`http://localhost:5000/api/mtaccounts/${setting.accountLogin}`);
        if (!data || !data.data) return setting;

        const { balance, equity } = data.data;
        return calculateProgress(balance, equity, setting);
      } catch (err) {
        console.error(`Failed to fetch MT data for ${setting.accountLogin}:`, err.message);
        return setting;
      }
    })
  );

  return results;
};

// Add new prop setting
exports.addPropSetting = async (settingData) => {
  const setting = new PropSetting(settingData);
  return await setting.save();
};
