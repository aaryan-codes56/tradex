import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Input
from sklearn.preprocessing import MinMaxScaler

class PricePredictor:
    def __init__(self):
        self.model = self._build_model()
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        # Warmup or dummy training to initialize weights
        self._warmup()

    def _build_model(self):
        model = Sequential([
            Input(shape=(60, 1)),
            LSTM(50, return_sequences=True),
            LSTM(50, return_sequences=False),
            Dense(25),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mean_squared_error')
        return model

    def _warmup(self):
        # Create dummy data to initialize the model
        dummy_X = np.random.rand(1, 60, 1)
        dummy_y = np.random.rand(1, 1)
        self.model.train_on_batch(dummy_X, dummy_y)

    def prepare_data(self, prices):
        # Scale data
        dataset = np.array(prices).reshape(-1, 1)
        scaled_data = self.scaler.fit_transform(dataset)
        
        # Take last 60 points for prediction
        x_input = scaled_data[-60:].reshape(1, 60, 1)
        return x_input, dataset[-1][0]

    def predict(self, prices):
        try:
            x_input, last_price = self.prepare_data(prices)
            
            # Get prediction
            predicted_scaled = self.model.predict(x_input, verbose=0)
            predicted_price = self.scaler.inverse_transform(predicted_scaled)[0][0]
            
            # Simple confidence calculation (mock logic for now as real confidence requires probabilistic output)
            # In a real scenario, this could be based on validation loss or dropout variance
            confidence = 0.85 
            
            return predicted_price, confidence
        except Exception as e:
            print(f"Prediction error: {e}")
            return 0, 0
