const tradeAlerts = [
  // Example structure
  // { type: "info" | "warning" | "error", message: "Sample alert" }
];

const reminders = [
  // Example reminder strings
];

let autoTradeStatus = "OFF"; // or "ON"

exports.getDashboardData = async (req, res) => {
  try {
    res.json({
      tradeAlerts,
      reminders,
      autoTradeStatus
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};
