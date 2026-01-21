const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get top traders (Mocked + Real mix)
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Fetch all users
        const users = await User.find({}).select('username paperBalance investedCapital preferences');

        const leaderboard = users.map(user => {
            const basis = user.investedCapital || 10000;
            const profit = user.paperBalance - basis;
            const roi = (profit / basis) * 100;

            const seed = user.username.length;
            const winRate = 50 + (seed * 2) % 40;

            return {
                name: user.username,
                roi: parseFloat(roi.toFixed(2)),
                winRate: winRate,
                profit: parseFloat(profit.toFixed(2)),
                style: user.preferences?.riskTolerance ?
                    user.preferences.riskTolerance.charAt(0).toUpperCase() + user.preferences.riskTolerance.slice(1) : 'Balanced'
            };
        });

        // Sort by Profit Descending and Filter active traders (Profit or Loss, but not 0)
        const profitableTraders = leaderboard
            .filter(trader => trader.profit !== 0)
            .sort((a, b) => b.profit - a.profit);

        res.json(profitableTraders.slice(0, 10)); // Top 10
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: 'Server Error fetching leaderboard' });
    }
});

module.exports = router;
