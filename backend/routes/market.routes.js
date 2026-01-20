const express = require('express');
const router = express.Router();

// @route   GET /api/market/prices
// @desc    Get live crypto prices
// @access  Public
router.get('/prices', async (req, res) => {
    // Mock data for phase 1
    res.json([
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', current_price: 45000, price_change_percentage_24h: 2.5 },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', current_price: 3000, price_change_percentage_24h: 1.2 },
        { id: 'solana', symbol: 'sol', name: 'Solana', current_price: 100, price_change_percentage_24h: -0.5 },
        { id: 'cardano', symbol: 'ada', name: 'Cardano', current_price: 0.50, price_change_percentage_24h: 0.8 },
        { id: 'ripple', symbol: 'xrp', name: 'XRP', current_price: 0.60, price_change_percentage_24h: -1.0 },
    ]);
});

// @route   GET /api/market/sentiment
// @desc    Get market sentiment
// @access  Public
router.get('/sentiment', (req, res) => {
    res.json({
        score: 65,
        status: 'Greed',
        breakdown: {
            twitter: 'Positive',
            news: 'Neutral',
            reddit: 'Bullish'
        }
    });
});

// @route   GET /api/market/news
// @desc    Get latest crypto news (Mock)
// @access  Public
router.get('/news', async (req, res) => {
    // Mock News Data
    const newsItems = [
        {
            id: 1,
            title: "Bitcoin breaks $50k barrier again",
            source: "CryptoDaily",
            time: "2h ago",
            url: "#",
            sentiment: "Positive"
        },
        {
            id: 2,
            title: "Ethereum 2.0 upgrade delayed",
            source: "CoinTelegraph",
            time: "4h ago",
            url: "#",
            sentiment: "Negative"
        },
        {
            id: 3,
            title: "Regulatory concerns rise in EU",
            source: "Bloomberg",
            time: "6h ago",
            url: "#",
            sentiment: "Neutral"
        },
        {
            id: 4,
            title: "Solana sees massive adoption in NFT space",
            source: "Decrypt",
            time: "8h ago",
            url: "#",
            sentiment: "Positive"
        },
        {
            id: 5,
            title: "Top analysts predict bull run continuation",
            source: "CNBC",
            time: "12h ago",
            url: "#",
            sentiment: "Positive"
        }
    ];

    res.json(newsItems);
});

// @route   GET /api/market/history/:symbol
// @desc    Get historical price data (Mock)
// @access  Public
router.get('/history/:symbol', async (req, res) => {
    const { symbol } = req.params;
    // Mock data generation
    const now = Date.now();
    const history = [];
    let price = symbol === 'BTC' ? 50000 : symbol === 'ETH' ? 3000 : 100;

    for (let i = 30; i >= 0; i--) {
        const time = now - (i * 24 * 60 * 60 * 1000); // Days ago
        const volatility = 0.05;
        const change = 1 + (Math.random() * volatility * 2 - volatility);
        price = price * change;
        history.push({
            timestamp: time,
            price: price
        });
    }

    res.json(history);
});

module.exports = router;
