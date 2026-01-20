const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['paper', 'live'],
        default: 'paper'
    },
    action: {
        type: String,
        enum: ['BUY', 'SELL'],
        required: true
    },
    symbol: {
        type: String,
        required: true,
        uppercase: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    orderType: {
        type: String,
        enum: ['MARKET', 'LIMIT'],
        default: 'MARKET'
    },
    limitPrice: {
        type: Number
    },
    stopLossPrice: {
        type: Number
    },
    takeProfitPrice: {
        type: Number
    },
    status: {
        type: String,
        enum: ['OPEN', 'FILLED', 'CANCELLED', 'CLOSED'],
        default: 'FILLED'
    },
    riskMetrics: {
        stopLoss: Number,
        riskLevel: String,
        aiConfidence: Number
    }
});

module.exports = mongoose.model('Trade', tradeSchema);
