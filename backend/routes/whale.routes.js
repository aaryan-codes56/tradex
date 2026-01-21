const express = require('express');
const router = express.Router();

// @route   GET /api/market/whales
// @desc    Get recent large transactions
// @access  Public
router.get('/', (req, res) => {
    // Generate realistic looking whale transactions
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Huobi'];
    const anonymous = ['Unknown Wallet', 'Private Wallet'];
    const assets = ['BTC', 'ETH', 'USDT', 'XRP', 'SOL'];

    // Helper randoms
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randAmt = (min, max) => (Math.random() * (max - min) + min).toFixed(2);

    const count = 10;
    const alerts = [];

    for (let i = 0; i < count; i++) {
        const asset = pick(assets);
        let amount, value;

        // Asset specific scaling for realism
        if (asset === 'BTC') { amount = randAmt(50, 500); value = amount * 65000; }
        else if (asset === 'ETH') { amount = randAmt(500, 5000); value = amount * 3500; }
        else if (asset === 'SOL') { amount = randAmt(10000, 100000); value = amount * 145; }
        else if (asset === 'XRP') { amount = randAmt(1000000, 5000000); value = amount * 0.60; }
        else { amount = randAmt(1000000, 10000000); value = amount * 1; } // USDT

        const type = Math.random() > 0.5 ? 'Transfer' : (Math.random() > 0.5 ? 'Buy' : 'Sell');

        let from, to;
        if (type === 'Transfer') {
            from = Math.random() > 0.5 ? pick(exchanges) : pick(anonymous);
            to = Math.random() > 0.5 ? pick(exchanges) : pick(anonymous);
        } else if (type === 'Buy') { // Outflow from exchange usually
            from = pick(exchanges);
            to = pick(anonymous);
        } else { // Inflow to exchange
            from = pick(anonymous);
            to = pick(exchanges);
        }

        alerts.push({
            id: `whale_${Date.now()}_${i}`,
            timestamp: new Date(Date.now() - (i * 1000 * 60 * Math.random() * 10)), // Spread out times
            asset,
            amount: parseFloat(amount),
            valueUsd: value,
            from,
            to,
            type
        });
    }

    res.json(alerts.sort((a, b) => b.timestamp - a.timestamp));
});

module.exports = router;
