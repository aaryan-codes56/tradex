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

module.exports = {
    calculateStopLoss,
    calculatePositionSize
};
