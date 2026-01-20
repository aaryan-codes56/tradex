import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import NewsFeed from '../../components/NewsFeed';
import './Dashboard.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const [prices, setPrices] = useState([]);
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [aiPrediction, setAiPrediction] = useState(null);
    const [analysing, setAnalysing] = useState(false);

    // Trading State
    const [user, setUser] = useState(null);
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [tradeAction, setTradeAction] = useState('BUY');
    const [orderType, setOrderType] = useState('MARKET');
    const [tradeQuantity, setTradeQuantity] = useState('');
    const [limitPrice, setLimitPrice] = useState('');
    const [stopLossPrice, setStopLossPrice] = useState('');
    const [takeProfitPrice, setTakeProfitPrice] = useState('');
    const [tradeStatus, setTradeStatus] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const pricesRes = await axios.get('http://localhost:5001/api/market/prices');
            const sentimentRes = await axios.get('http://localhost:5001/api/market/sentiment');
            const userRes = await axios.get('http://localhost:5001/api/trades/positions', config);

            setPrices(pricesRes.data);
            setSentiment(sentimentRes.data);
            setUser(userRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Faster refresh for trading
        return () => clearInterval(interval);
    }, []);

    const getAiPrediction = async (symbol) => {
        setAnalysing(true);
        setAiPrediction(null);
        try {
            const { data } = await axios.post('http://localhost:5001/api/ai/predictions', {
                symbol,
                prices: []
            });
            setAiPrediction(data);
        } catch (error) {
            console.error("AI Error", error);
        }
        setAnalysing(false);
    };

    const handleTrade = async (e) => {
        e.preventDefault();
        setTradeStatus('Processing...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const currentPrice = prices.find(p => p.symbol === selectedCoin.symbol)?.current_price;
            const finalPrice = orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : currentPrice;

            if (orderType === 'LIMIT' && !limitPrice) {
                setTradeStatus('Error: Please enter a limit price.');
                return;
            }

            await axios.post('http://localhost:5001/api/trades/paper', {
                symbol: selectedCoin.symbol,
                action: tradeAction,
                quantity: parseFloat(tradeQuantity),
                price: currentPrice, // Current market price for reference or execution
                orderType,
                limitPrice: orderType === 'LIMIT' ? parseFloat(limitPrice) : null,
                stopLossPrice: stopLossPrice ? parseFloat(stopLossPrice) : null,
                takeProfitPrice: takeProfitPrice ? parseFloat(takeProfitPrice) : null,
                aiConfidence: aiPrediction?.symbol === selectedCoin.symbol ? aiPrediction.confidence : 0.5
            }, config);

            setTradeStatus(orderType === 'LIMIT' ? 'Order Placed!' : 'Success!');
            setTimeout(() => {
                setTradeModalOpen(false);
                fetchData();
            }, 1000);

        } catch (error) {
            setTradeStatus(`Error: ${error.response?.data?.message || error.message}`);
        }
    };

    const openTradeModal = (coin) => {
        setSelectedCoin(coin);
        setTradeModalOpen(true);
        setTradeStatus('');
        setOrderType('MARKET');
        setLimitPrice('');
        setStopLossPrice('');
        setTakeProfitPrice('');
        setTradeQuantity('');
    };

    if (loading) return <div className="loading">Loading Market Data...</div>;

    const [chartData, setChartData] = useState(null);
    const [chartTimeframe, setChartTimeframe] = useState('30d');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!prices.length) return;
            // Default to first coin or selected coin
            const coin = selectedCoin?.symbol || 'btc';
            try {
                const { data } = await axios.get(`http://localhost:5001/api/market/history/${coin}`);

                setChartData({
                    labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
                    datasets: [
                        {
                            label: `${coin.toUpperCase()} Price History`,
                            data: data.map(d => d.price),
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.4
                        }
                    ]
                });
            } catch (error) {
                console.error('Error fetching history', error);
            }
        };

        if (prices.length > 0) {
            fetchHistory();
        }
    }, [prices, selectedCoin]);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Market Overview</h1>
                    <p className="subtitle">Paper Balance: ${user?.balance?.toFixed(2)}</p>
                </div>
                <div className="header-cards">
                    {aiPrediction && (
                        <div className="sentiment-card ai-card">
                            <h3>AI Signal: {aiPrediction.symbol}</h3>
                            <div className="sentiment-value" style={{ color: aiPrediction.signal === 'BUY' ? '#16a34a' : aiPrediction.signal === 'SELL' ? '#dc2626' : '#ea580c' }}>
                                {aiPrediction.signal}
                                <span className="confidence">{(aiPrediction.confidence * 100).toFixed(0)}% Conf.</span>
                            </div>
                            <p className="prediction-price">Pred: ${aiPrediction.predictedPrice.toFixed(2)}</p>

                            {aiPrediction.explanation && (
                                <div className="ai-explanation">
                                    <p className="explanation-summary">{aiPrediction.explanation.summary}</p>
                                    <ul className="explanation-list">
                                        {aiPrediction.explanation.factors.map((factor, idx) => (
                                            <li key={idx}>{factor}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="sentiment-card">
                        <h3>Portfolio Value</h3>
                        <div className="sentiment-value">
                            ${Object.entries(user?.portfolio || {}).reduce((acc, [symbol, qty]) => {
                                const price = prices.find(p => p.symbol === symbol)?.current_price || 0;
                                return acc + (price * qty);
                            }, 0).toFixed(2)}
                        </div>
                    </div>
                </div>
            </header>

            {/* Trade Modal */}
            {tradeModalOpen && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Trade {selectedCoin.name}</h2>
                        <div className="trade-type">
                            <button
                                className={tradeAction === 'BUY' ? 'active buy' : ''}
                                onClick={() => setTradeAction('BUY')}>Buy</button>
                            <button
                                className={tradeAction === 'SELL' ? 'active sell' : ''}
                                onClick={() => setTradeAction('SELL')}>Sell</button>
                        </div>

                        <div className="order-type-selector">
                            <label>Order Type:</label>
                            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                                <option value="MARKET">Market</option>
                                <option value="LIMIT">Limit</option>
                            </select>
                        </div>

                        <form onSubmit={handleTrade}>
                            {orderType === 'LIMIT' && (
                                <div className="form-group">
                                    <label>Limit Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={limitPrice}
                                        onChange={(e) => setLimitPrice(e.target.value)}
                                        placeholder={selectedCoin.current_price.toString()}
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={tradeQuantity}
                                    onChange={(e) => setTradeQuantity(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="advanced-options">
                                <div className="form-group small">
                                    <label>Stop Loss ($)</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={stopLossPrice}
                                        onChange={(e) => setStopLossPrice(e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="form-group small">
                                    <label>Take Profit ($)</label>
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={takeProfitPrice}
                                        onChange={(e) => setTakeProfitPrice(e.target.value)}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <p>Est. Total: ${(parseFloat(tradeQuantity || 0) * (orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : selectedCoin.current_price)).toFixed(2)}</p>
                            {tradeStatus && <p className="status-msg">{tradeStatus}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={() => setTradeModalOpen(false)}>Cancel</button>
                                <button type="submit" className="confirm-btn">
                                    {orderType === 'LIMIT' ? 'Place Order' : `Confirm ${tradeAction}`}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="prices-grid">
                {prices.map((coin) => (
                    <div key={coin.id} className="coin-card">
                        <div className="coin-info">
                            <h3>{coin.name}</h3>
                            <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
                            {user?.portfolio && user.portfolio[coin.symbol] && (
                                <span className="holding-badge">{user.portfolio[coin.symbol]} held</span>
                            )}
                        </div>
                        <div className="coin-price">
                            <h2>${coin.current_price.toLocaleString()}</h2>
                            <span className={`change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                                {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h}%
                            </span>
                        </div>
                        <div className="card-actions">
                            <button
                                className="analyze-btn"
                                onClick={() => getAiPrediction(coin.symbol)}
                                disabled={analysing}
                            >
                                {analysing ? 'AI Analyze' : 'AI Analyze'}
                            </button>
                            <button className="trade-btn" onClick={() => openTradeModal(coin)}>Trade</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid-layout">
                <div className="charts-section">
                    <h2>{selectedCoin ? selectedCoin.name : 'Market'} Trends</h2>
                    <div className="chart-container-dashboard" style={{ height: '400px' }}>
                        {chartData ? <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} /> : <p>Loading Chart...</p>}
                    </div>
                </div>
                <div className="news-section">
                    <NewsFeed />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
