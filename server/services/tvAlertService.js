const TVAlert = require('../models/tvAlertModel');

// Helper to check if an alert is fully valid
const isValidAlert = (alert) => {
    // Dynamically select choch fields based on type
    const choch30mField = alert.type === "BUY" ? "30m bullish choch" : "30m bearish choch";
    const choch5mField = alert.type === "BUY" ? "5m bullish choch" : "5m bearish choch";

    // All numeric fields must exist and not be false
    const allFieldsValid =
        typeof alert[choch30mField] === 'number' &&
        typeof alert[choch5mField] === 'number' &&
        typeof alert["5m support"] === 'number' &&
        typeof alert["5m resistance"] === 'number';

    // Type must be BUY or SELL
    const typeValid = ["BUY", "SELL"].includes(alert.type);

    return allFieldsValid && typeValid;
};

// Save multiple valid alerts at once
const saveMultipleTVAlerts = async (alerts) => {
    if (!Array.isArray(alerts)) alerts = [alerts];

    // Filter valid alerts
    const validAlerts = alerts.filter(isValidAlert);

    // Delete old alerts before saving new ones
    await TVAlert.deleteMany({});

    // Insert only valid alerts
    if (validAlerts.length === 0) return []; // nothing valid to save
    return await TVAlert.insertMany(validAlerts);
};

// Get all stored alerts (already only valid ones)
const getAllTVAlerts = async () => {
    const alerts = await TVAlert.find().sort({ timestamp: -1 });

    // Filter valid alerts and remove any null fields
    return alerts
        .filter(isValidAlert)
        .map(alert => {
            const cleanAlert = { ...alert._doc }; // clone Mongoose document
            Object.keys(cleanAlert).forEach(key => {
                if (cleanAlert[key] === null) delete cleanAlert[key];
            });
            return cleanAlert;
        });
};


module.exports = {
    saveMultipleTVAlerts,
    getAllTVAlerts
};