require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

// Routes
const { router: authRoutes } = require('./routes/auth.routes');
const marketRoutes = require('./routes/market.routes');
const aiRoutes = require('./routes/ai.routes');
const tradeRoutes = require('./routes/trade.routes');

app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trades', tradeRoutes);

app.get('/', (req, res) => {
    res.send('TradeX API is running');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
