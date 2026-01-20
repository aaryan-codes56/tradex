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
    start_price = 50000 if symbol == 'BTC' else 3000 if symbol == 'ETH' else 100
    returns = np.random.normal(0.0005, 0.01, size=(len(date_rng)))
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
    roi = ((final_balance - initial_balance) / initial_balance) * 100
    
    return {
        "symbol": symbol,
        "strategy": strategy,
        "initial_balance": initial_balance,
        "final_balance": final_balance,
        "roi": roi,
        "trade_count": len(trades),
        "history": trades
    }

if __name__ == "__main__":
    # Expecting: python backtest.py BTC Momentum 30
    symbol = sys.argv[1]
    strategy = sys.argv[2]
    duration = sys.argv[3]
    
    result = run_backtest(symbol, strategy, duration)
    print(json.dumps(result))
