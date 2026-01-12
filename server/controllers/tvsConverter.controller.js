const tvsService = require('../services/tvsConverter.service');

// Endpoint to manually trigger conversion
exports.convertAndPost = async (req, res) => {
    try {
        const result = await tvsService.fetchConvertAndPostSignals();
        res.status(200).json({ status: 'success', signals: result });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
};
