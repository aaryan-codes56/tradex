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
        console.warn('AI Service Error (using mock data):', error.message);

        // Mock Fallback for Demo/Dev
        const signal = Math.random() > 0.5 ? 'BUY' : 'SELL';
        const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 100; // access last price or dummy
        const predictedPrice = signal === 'BUY' ? currentPrice * 1.05 : currentPrice * 0.95;

        // Return mock data immediately
        return res.json({
            symbol: symbol,
            signal: signal,
            confidence: 0.75 + (Math.random() * 0.2), // 0.75 to 0.95
            predictedPrice: predictedPrice,
            timestamp: new Date().toISOString()
        });
    }
});

// @route   POST /api/ai/chat
// @desc    Chat with TradeGPT
// @access  Public (should be Private in prod)
router.post('/chat', (req, res) => {
    const { message, context } = req.body;
    const lowerMsg = message.toLowerCase();

    // Simulate AI Processing
    let response = "I'm still learning, but I can help you with market trends and portfolio insights.";

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        response = "Hello Trader! How can I assist you with your portfolio today?";
    } else if (lowerMsg.includes('portfolio') || lowerMsg.includes('balance')) {
        if (context && context.balance) {
            response = `Your current paper trading balance is roughly $${context.balance.toFixed(2)}. ${context.portfolio && Object.keys(context.portfolio).length > 0 ? "You have open positions in " + Object.keys(context.portfolio).join(', ').toUpperCase() + "." : "You currently have no open positions."}`;
        } else {
            response = "I can't access your live portfolio right now, but generally, diversification is key!";
        }
    } else if (lowerMsg.includes('btc') || lowerMsg.includes('bitcoin')) {
        response = "Bitcoin is currently trading near $45,000 with high volatility. Technical indicators suggest a potential breakout if it crosses the $46k resistance.";
    } else if (lowerMsg.includes('eth') || lowerMsg.includes('ethereum')) {
        response = "Ethereum is showing strong network activity. Gas fees are moderate. Support levels are holding around $3,000.";
    } else if (lowerMsg.includes('buy') || lowerMsg.includes('sell') || lowerMsg.includes('trade')) {
        response = "While I can't give financial advice, current market sentiment is 'Greed', which often precedes a correction, though momentum remains strong.";
    } else if (lowerMsg.includes('doge') || lowerMsg.includes('shib')) {
        response = "Meme coins are highly volatile! Be careful and always use stop losses.";
    }

    // Simulate delay
    setTimeout(() => {
        res.json({ response });
    }, 1000);
});

module.exports = router;
