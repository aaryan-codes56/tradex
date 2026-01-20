from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from model import PricePredictor

app = Flask(__name__)
CORS(app)

# Initialize model
predictor = PricePredictor()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        prices = data.get('prices', [])
        symbol = data.get('symbol', 'UNKNOWN')
        
        # If no prices provided, generate mock data for demonstration/testing
        if len(prices) < 60:
            # Generate 60 random price points based on a random walk
            prices = [50000]
            for _ in range(59):
                change = np.random.uniform(0.98, 1.02)
                prices.append(prices[-1] * change)
        
        prediction, confidence = predictor.predict(prices)
        
        # Determine signal based on prediction vs last price
        last_price = prices[-1]
        signal = 'HOLD'
        if prediction > last_price * 1.02: # 2% upside
            signal = 'BUY'
        elif prediction < last_price * 0.98: # 2% downside
            signal = 'SELL'

        return jsonify({
            'symbol': data.get('symbol', 'UNKNOWN'),
            'predictedPrice': float(prediction),
            'signal': signal,
            'confidence': float(confidence),
            'currentPrice': float(last_price)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(port=5002, debug=True)
