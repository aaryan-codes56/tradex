import numpy as np
import pandas as pd
import sys
import json
from datetime import datetime, timedelta

# Mock Data Generation for Backtesting (since we don't have a real DB of historical prices yet)
def generate_historical_data(symbol, days=30):
    date_rng = pd.date_range(end=datetime.now(), periods=days*24, freq='H') # Hourly data
    df = pd.DataFrame(date_rng, columns=['date'])
    
    # Random walk with drift
    np.random.seed(42)
    # Crypto Start Prices
    start_prices = {
        'BTC': 65000,
        'ETH': 3500,
        'SOL': 145,
        'ADA': 0.45,
        'XRP': 0.60,
        'DOGE': 0.12,
        'DOT': 7.50
    }
    start_price = start_prices.get(symbol, 100)
    
    # Higher volatility for crypto
    returns = np.random.normal(0.0002, 0.02, size=(len(date_rng)))
    price_path = start_price * np.exp(np.cumsum(returns))
    
    df['close'] = price_path
    return df

def run_backtest(symbol, strategy, duration):
    df = generate_historical_data(symbol, int(duration))
    
    initial_balance = 10000
    balance = initial_balance
    position = 0 # 0: flat, >0: long, <0: short (if allowed)
    trades = []
    
    # Simple Logic for Strategies
    for i in range(1, len(df)):
        price = df.iloc[i]['close']
        prev_price = df.iloc[i-1]['close']
        date = str(df.iloc[i]['date'])
        
        signal = 0 # 0: Hold, 1: Buy, -1: Sell
        
        if strategy == 'Momentum':
            # Buy if price went up, Sell if went down (simple trend following)
            if price > prev_price:
                signal = 1
            else:
                signal = -1
        
        elif strategy == 'Mean Reversion':
            # Buy if dipped significantly, Sell if spiked
            change = (price - prev_price) / prev_price
            if change < -0.01: # Dip
                signal = 1
            elif change > 0.01: # Spike
                signal = -1
        
        elif strategy == 'AI Driven':
             # Mock AI: Random high accuracy
             if np.random.random() > 0.6: # Trade 40% of time
                 signal = 1 if np.random.random() > 0.5 else -1

        # Execution Logic
        if signal == 1 and position == 0:
            # Buy All
            position = balance / price
            balance = 0
            trades.append({'date': date, 'type': 'BUY', 'price': price, 'balance': initial_balance}) # Tracking only
        
        elif signal == -1 and position > 0:
             # Sell All
             balance = position * price
             position = 0
             trades.append({'date': date, 'type': 'SELL', 'price': price, 'balance': balance})

    # Final Liquidation
    final_balance = balance + (position * df.iloc[-1]['close'])
    total_return = (final_balance - initial_balance) / initial_balance * 100
    
    # Calculate Metrics
    df['balance'] = initial_balance # Initialize
    # Reconstruct balance history for drawdown/sharpe
    # This is a simplification; for accurate sharpe we need daily returns 
    # based on the mocked 'trades' list and price action.
    
    # Win Rate
    winning_trades = [t for t in trades if t['type'] == 'SELL' and t['balance'] > initial_balance] # This logic is flawed because balance accumulates. 
    # Correct Win Rate Logic:
    profits = []
    trade_open_price = 0
    for t in trades:
        if t['type'] == 'BUY':
            trade_open_price = t['price']
        elif t['type'] == 'SELL':
            pnl = (t['price'] - trade_open_price) / trade_open_price
            profits.append(pnl)
    
    win_rate = (len([p for p in profits if p > 0]) / len(profits) * 100) if profits else 0
    
    # Max Drawdown & Sharpe (Approximation based on trade path)
    # Generate daily balance points for Sharpe
    balance_history = [t['balance'] for t in trades] if trades else [initial_balance]
    balance_array = np.array(balance_history)
    
    # Max Drawdown
    peak = initial_balance
    max_drawdown = 0
    for val in balance_history:
        if val > peak:
            peak = val
        dd = (peak - val) / peak
        if dd > max_drawdown:
            max_drawdown = dd
            
    # Sharpe Ratio (assuming risk-free rate 0 for simplicity)
    # We need returns series
    if len(profits) > 1:
        returns_std = np.std(profits)
        avg_return = np.mean(profits)
        sharpe = (avg_return / returns_std) * np.sqrt(252) if returns_std != 0 else 0 # Annualized
    else:
        sharpe = 0

    return {
        "symbol": symbol,
        "strategy": strategy,
        "initial_balance": initial_balance,
        "final_balance": final_balance,
        "roi": total_return,
        "trade_count": len(trades),
        "win_rate": win_rate,
        "max_drawdown": max_drawdown * 100, # Percentage
        "sharpe_ratio": sharpe,
        "history": trades
    }

if __name__ == "__main__":
    # Expecting: python backtest.py BTC Momentum 30
    symbol = sys.argv[1]
    strategy = sys.argv[2]
    duration = sys.argv[3]
    
    result = run_backtest(symbol, strategy, duration)
    print(json.dumps(result))
