// Basic Risk Management Utilities

// Calculate suggested Stop Loss (e.g., 2% below entry for Buy)
const calculateStopLoss = (entryPrice, action, volatility = 0.02) => {
    if (action === 'BUY') {
        return entryPrice * (1 - volatility);
    } else {
        return entryPrice * (1 + volatility);
    }
};

// Calculate suggested Position Size based on risk per trade (e.g., risk 1% of equity)
// If volatility represents the distance to stop loss (e.g. 2%), 
// then Risk Amount = Position Size * Volatility
// Position Size = (Balance * RiskPerTrade) / Volatility
const calculatePositionSize = (balance, price, volatility = 0.02, riskPerTrade = 0.01) => {
    const riskAmount = balance * riskPerTrade;
    const positionValue = riskAmount / volatility;
    return positionValue / price; // Returns quantity
};

/**
 * Validates if a trade is allowed based on risk parameters
 * @param {Object} user - User object with balance and risk settings
 * @param {Number} tradeAmount - Total value of the trade
 * @param {Number} currentDailyLoss - Loss incurred so far today
 * @returns {Object} { allowed: boolean, reason: string }
 */
const checkRiskConstraints = (user, tradeAmount, currentDailyLoss = 0) => {
    const MAX_DAILY_LOSS_PERCENT = 0.05; // 5% max daily loss
    const MAX_POSITION_SIZE_PERCENT = 0.20; // 20% max portfolio in one asset

    const maxDailyLoss = user.paperBalance * MAX_DAILY_LOSS_PERCENT;
    const maxPositionSize = user.paperBalance * MAX_POSITION_SIZE_PERCENT;

    // Check 1: Max Position Size
    if (tradeAmount > maxPositionSize) {
        return {
            allowed: false,
            reason: `Risk Alert: Position size exceeds 20% limit ($${maxPositionSize.toFixed(2)})`
        };
    }

    // Check 2: Max Daily Loss (Stop trading if hit)
    if (currentDailyLoss >= maxDailyLoss) {
        return {
            allowed: false,
            reason: `Risk Alert: Daily loss limit hit ($${maxDailyLoss.toFixed(2)})`
        };
    }

    return { allowed: true };
};

module.exports = {
    calculateStopLoss,
    calculatePositionSize,
    checkRiskConstraints
};
