const express = require('express');
const axios = require('axios');
const router = express.Router();

// AI Service URL (Python Flask)
const AI_SERVICE_URL = 'http://localhost:5002';

// @route   POST /api/ai/predictions
// @desc    Get AI trade signals
// @access  Public (for now)
router.post('/predictions', async (req, res) => {
    const { symbol, prices } = req.body;

    if (!symbol || !prices || !Array.isArray(prices)) {
        return res.status(400).json({ message: 'Invalid request data. Need symbol and price array.' });
    }

    try {
        // Forward request to Python microservice
        const response = await axios.post(`${AI_SERVICE_URL}/predict`, {
            symbol,
            prices
        });

        res.json(response.data);
    } catch (error) {
        console.error('AI Service Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ message: 'AI Service unavailable' });
        }
        res.status(500).json({ message: 'Error fetching AI prediction' });
    }
});

module.exports = router;
