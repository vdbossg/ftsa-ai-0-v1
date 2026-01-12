const tvAlertService = require('../services/tvAlertService');

// POST /api/tvAlert
const receiveAlert = async (req, res) => {
    try {
        const alerts = Array.isArray(req.body) ? req.body : [req.body];

        // Filter valid alerts dynamically based on type
        const validAlerts = alerts.filter(alert => {
            // All fields exist and not false
            const choch30mField = alert.type === "BUY" ? "30m bullish choch" : "30m bearish choch";
            const choch5mField = alert.type === "BUY" ? "5m bullish choch" : "5m bearish choch";

            const allFieldsValid =
                typeof alert.symbol === "string" &&
                typeof alert.type === "string" &&
                typeof alert.timeframe === "string" &&
                typeof alert[choch30mField] === "number" &&
                typeof alert[choch5mField] === "number" &&
                typeof alert["5m support"] === "number" &&
                typeof alert["5m resistance"] === "number";

            // Type must be BUY or SELL
            const typeValid = ["BUY", "SELL"].includes(alert.type);

            return allFieldsValid && typeValid;
        });

        if (validAlerts.length === 0) {
            return res.status(200).json({ status: 'success', alerts: [] }); // no valid alerts
        }

        // Save all valid alerts (replacing old ones)
        const savedAlerts = await tvAlertService.saveMultipleTVAlerts(validAlerts);
        console.log('✅ TradingView alerts saved:', savedAlerts);

        res.status(200).json({ status: 'success', alerts: savedAlerts });

    } catch (err) {
        console.error('❌ Error saving TV alerts:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// GET /api/tvAlert
const fetchAlerts = async (req, res) => {
    try {
        const alerts = await tvAlertService.getAllTVAlerts();
        res.status(200).json({ status: 'success', alerts }); // only valid alerts
    } catch (err) {
        console.error('❌ Error fetching alerts:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

module.exports = {
    receiveAlert,
    fetchAlerts
};
