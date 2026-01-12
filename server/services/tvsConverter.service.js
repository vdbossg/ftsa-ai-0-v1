const axios = require("axios");

// Convert a single alert to bot-ready signal
const convertTVAlertToBotSignal = (alert) => {
    const { symbol, type, timeframe } = alert;
    const isBuy = type === "BUY";

    // Map choch and entry dynamically
    const choch = isBuy ? alert["30m bullish choch"] : alert["30m bearish choch"];
    const entry = isBuy ? alert["5m bullish choch"] : alert["5m bearish choch"];

    // Support / SL assignment
    let support, sl;
    if (isBuy) {
        support = alert["5m support"];
        sl = support;
    } else {
        support = alert["5m support"];
        sl = alert["5m resistance"];
    }

    // TP calculation
    let tp;
    if (typeof entry === "number" && typeof sl === "number") {
        tp = isBuy
            ? entry + 3 * (entry - sl)
            : entry - 3 * (sl - entry);
        tp = Number(tp.toFixed(5));
    }

    // Construct final output
    const output = {
        symbol,
        type,
        mode: "PENDING",
        timeframe,
        choch,
        entry,
        sl,
        tp
    };

    // Add support/resistance only in correct places
    if (isBuy) output.resistance = alert["5m resistance"];
    if (!isBuy) output.support = support;

    return output;
};

// Fetch alerts from TVAlert, convert, and post to TVSP
const fetchConvertAndPostSignals = async () => {
    try {
        const { data } = await axios.get("http://localhost:5000/api/tvAlert");

        if (!data.alerts || data.alerts.length === 0) {
            console.log("⚠️ No alerts to convert");
            return;
        }

        const signals = data.alerts.map(convertTVAlertToBotSignal);

        const response = await axios.post(
            "http://localhost:5000/api/tvspSignal",
            signals
        );

        console.log(`✅ Signals posted to tvspSignal: ${signals.length} alerts`);
        return response.data;
    } catch (err) {
        console.error("❌ TVS Converter Service Error:", err.message);
    }
};

// --- NEW: Auto-refresh every 2 seconds ---
setInterval(() => {
    fetchConvertAndPostSignals();
}, 5000);

console.log("🔄 TVS Converter is now running in the background every 2 seconds...");

module.exports = {
    convertTVAlertToBotSignal,
    fetchConvertAndPostSignals
};
