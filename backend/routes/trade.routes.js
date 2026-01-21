const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Trade = require('../models/Trade');
const { calculateStopLoss, calculatePositionSize, checkRiskConstraints } = require('../utils/risk.utils');
const { protect } = require('./auth.routes');

// @route   POST /api/trades/paper
// @desc    Execute a paper trade
// @access  Private
// @route   POST /api/trades/paper
// @desc    Execute a paper trade
// @access  Private
router.post('/paper', protect, async (req, res) => {
    const { symbol, action, quantity, price, aiConfidence, orderType, limitPrice, stopLossPrice, takeProfitPrice } = req.body;

    if (!symbol || !action || !quantity || !price) {
        return res.status(400).json({ message: 'Please provide all trade details' });
    }

    try {
        const user = await User.findById(req.user._id);
        const totalCost = quantity * price;

        // --- RISK MANAGEMENT CHECK ---
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayTrades = await Trade.find({
            userId: user._id,
            timestamp: { $gte: startOfDay },
            status: 'FILLED'
        });

        // specific calculation for daily realized PnL could be complex, 
        // using simple proxy: sum of negative outcomes if we had a PnL field.
        // For now, we pass 0 for daily loss as a placeholder or implement specific logic later.
        // But we DO check Position Sizing which is critical.

        if (action === 'BUY') {
            const riskCheck = checkRiskConstraints(user, totalCost, 0); // Passing 0 for daily loss for now
            if (!riskCheck.allowed) {
                return res.status(400).json({ message: riskCheck.reason });
            }
        }
        // -----------------------------

        // Handle LIMIT orders (Pending execution)
        if (orderType === 'LIMIT') {
            const trade = await Trade.create({
                userId: user._id,
                type: 'paper',
                action,
                symbol,
                quantity,
                price: limitPrice || price, // Use limit price for the record
                total: quantity * (limitPrice || price),
                orderType: 'LIMIT',
                limitPrice,
                stopLossPrice,
                takeProfitPrice,
                status: 'OPEN',
                riskMetrics: {
                    stopLoss: calculateStopLoss(price, action),
                    riskLevel: aiConfidence > 0.8 ? 'LOW' : aiConfidence > 0.5 ? 'MEDIUM' : 'HIGH',
                    aiConfidence
                }
            });
            return res.status(201).json({
                message: 'Limit order placed successfully',
                trade,
                newBalance: user.paperBalance,
                portfolio: user.portfolio
            });
        }

        // MARKET ORDER EXECUTION
        // const totalCost = quantity * price; // Already defined above

        if (action === 'BUY') {
            if (user.paperBalance < totalCost) {
                return res.status(400).json({ message: 'Insufficient paper trading balance' });
            }
            user.paperBalance -= totalCost;

            // Update portfolio
            const currentQty = user.portfolio.get(symbol) || 0;
            user.portfolio.set(symbol, currentQty + parseFloat(quantity));
        } else if (action === 'SELL') {
            const currentQty = user.portfolio.get(symbol) || 0;
            if (currentQty < quantity) {
                return res.status(400).json({ message: 'Insufficient holdings to sell' });
            }
            user.paperBalance += totalCost;

            // Update portfolio
            const newQty = currentQty - parseFloat(quantity);
            if (newQty <= 0) {
                user.portfolio.delete(symbol);
            } else {
                user.portfolio.set(symbol, newQty);
            }
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        // Calculate Risk Metrics
        const stopLoss = calculateStopLoss(price, action);
        // Risk level logic (simple mock)
        const riskLevel = aiConfidence > 0.8 ? 'LOW' : aiConfidence > 0.5 ? 'MEDIUM' : 'HIGH';

        // Create Trade Record
        const trade = await Trade.create({
            userId: user._id,
            type: 'paper',
            action,
            symbol,
            quantity,
            price,
            total: totalCost,
            orderType: 'MARKET',
            stopLossPrice,
            takeProfitPrice,
            status: 'FILLED',
            riskMetrics: {
                stopLoss,
                riskLevel,
                aiConfidence
            }
        });

        await user.save();

        res.status(201).json({
            message: 'Market order executed successfully',
            trade,
            newBalance: user.paperBalance,
            portfolio: user.portfolio
        });

    } catch (error) {
        console.error('Trade Error:', error);
        res.status(500).json({ message: 'Server error executing trade', error: error.message });
    }
});

// @route   GET /api/trades/history
// @desc    Get user's trade history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.user._id }).sort({ timestamp: -1 });
        res.json(trades);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching trades' });
    }
});

// @route   GET /api/trades/positions
// @desc    Get current portfolio positions
// @access  Private
router.get('/positions', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            balance: user.paperBalance,
            portfolio: user.portfolio
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching positions' });
    }
});

// @route   POST /api/trades/backtest
// @desc    Run a backtest strategy
// @access  Private
router.post('/backtest', protect, async (req, res) => {
    const { symbol, strategy, duration } = req.body;
    const { spawn } = require('child_process');
    const path = require('path');

    if (!symbol || !strategy || !duration) {
        return res.status(400).json({ message: 'Please provide symbol, strategy, and duration' });
    }

    const scriptPath = path.join(__dirname, '../utils/backtest_engine.py');
    const pythonProcess = spawn('python3', [scriptPath, symbol, strategy, duration]);

    let dataString = '';
    let errorString = '';

    pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        errorString += data.toString();
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            console.error(`Backtest process failed: ${errorString}`);
            return res.status(500).json({ message: 'Backtest execution failed', error: errorString });
        }
        try {
            const results = JSON.parse(dataString);
            res.json(results);
        } catch (err) {
            console.error('Error parsing backtest results:', err);
            res.status(500).json({ message: 'Error parsing backtest results' });
        }
    });
});

module.exports = router;
