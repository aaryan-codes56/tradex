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
import MarketHeatmap from '../../components/MarketHeatmap';
import WhaleAlerts from '../../components/WhaleAlerts';
import { TrendingUp, Wallet, Brain, Activity } from 'lucide-react';
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

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const pricesRes = await axios.get('http://localhost:5001/api/market/prices');
            const sentimentRes = await axios.get('http://localhost:5001/api/market/sentiment');
            const userRes = await axios.get('http://localhost:5001/api/trades/positions', config);

            console.log("Dashboard: fetched data", { prices: pricesRes.data, user: userRes.data });
            setPrices(pricesRes.data);
            setSentiment(sentimentRes.data);
            setUser(userRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data', error);
            setLoading(false);
        }
    };

    console.log("Dashboard: rendering", { loading, user, prices });

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



    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="section-header">
                    <div>
                        <h1>Market Overview</h1>
                        <p>Paper Balance: ${user?.balance?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>
            </header>

            <div className="bento-grid">
                {/* 1. Portfolio Summary */}
                <div className="dashboard-card area-portfolio">
                    <h3><Wallet size={18} /> Net Worth</h3>
                    <div className="metric-value">
                        ${Object.entries(user?.portfolio || {}).reduce((acc, [symbol, qty]) => {
                            const price = prices.find(p => p.symbol === symbol)?.current_price || 0;
                            return acc + (price * qty);
                        }, 0).toFixed(2)}
                    </div>
                </div>

                {/* 2. AI Insight */}
                <div className={`dashboard-card area-ai ${aiPrediction ? 'ai-active' : ''}`}>
                    <h3><Brain size={18} /> {aiPrediction ? `Signal: ${aiPrediction.symbol}` : "AI Insights"}</h3>
                    {aiPrediction ? (
                        <>
                            <div className="metric-value" style={{
                                color: aiPrediction.signal === 'BUY' ? '#16a34a' : aiPrediction.signal === 'SELL' ? '#dc2626' : '#ea580c',
                                fontSize: '1.5rem'
                            }}>
                                {aiPrediction.signal}
                            </div>
                            <div className="metric-sub">
                                {(aiPrediction.confidence * 100).toFixed(0)}% Confidence
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                                Pred: ${aiPrediction.predictedPrice.toFixed(2)}
                            </p>
                        </>
                    ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic', marginTop: 'auto' }}>
                            Select a coin below to analyze
                        </div>
                    )}
                </div>

                {/* 3. Whale Watcher (Sidebar) */}
                <div className="dashboard-card area-whales">
                    <WhaleAlerts />
                </div>

                {/* 4. Market Heatmap */}
                <div className="dashboard-card area-heatmap">
                    <MarketHeatmap />
                </div>

                {/* 4. Live Prices Ticker */}
                <div className="area-prices">
                    {Array.isArray(prices) && prices.map((coin) => (
                        <div key={coin.id} className="dashboard-card">
                            <div className="coin-info">
                                <h3>{coin.name} <span style={{ fontSize: '0.7em', color: '#94a3b8' }}>{coin.symbol.toUpperCase()}</span></h3>
                                {user?.portfolio && user.portfolio[coin.symbol] && (
                                    <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '2px 6px', borderRadius: '4px' }}>
                                        Owned
                                    </span>
                                )}
                            </div>
                            <div className="coin-price">
                                <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>${(coin.current_price || 0).toLocaleString()}</h2>
                                <span className={`change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}>
                                    {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h}%
                                </span>
                            </div>
                            <div className="card-actions">
                                <button className="analyze-btn" onClick={() => getAiPrediction(coin.symbol)} disabled={analysing}>
                                    <Brain size={16} /> {analysing ? '... ' : 'Analyze'}
                                </button>
                                <button className="trade-btn" onClick={() => openTradeModal(coin)}>Trade</button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 5. Technical Chart */}
                <div className="dashboard-card area-chart">
                    <h3><Activity size={18} /> {selectedCoin ? selectedCoin.name : 'Market'} Trends</h3>
                    <div className="chart-container-dashboard">
                        {chartData ? <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} /> : <p>Loading Chart...</p>}
                    </div>
                </div>

                {/* 6. News Feed */}
                <div className="dashboard-card area-news">
                    <NewsFeed />
                </div>
            </div>

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

                        <form onSubmit={handleTrade}>
                            <div className="order-type-selector">
                                <label>Order Type:</label>
                                <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                                    <option value="MARKET">Market</option>
                                    <option value="LIMIT">Limit</option>
                                </select>
                            </div>
                            {orderType === 'LIMIT' && (
                                <div className="form-group">
                                    <label>Limit Price ($)</label>
                                    <input
                                        type="number" step="0.000001" value={limitPrice}
                                        onChange={(e) => setLimitPrice(e.target.value)}
                                        placeholder={selectedCoin.current_price.toString()} required
                                    />
                                </div>
                            )}
                            <div className="form-group">
                                <label>Quantity</label>
                                <input
                                    type="number" step="0.000001" value={tradeQuantity}
                                    onChange={(e) => setTradeQuantity(e.target.value)} required
                                />
                            </div>
                            <div className="advanced-options">
                                <div className="form-group small">
                                    <label>Stop Loss ($)</label>
                                    <input
                                        type="number" step="0.000001" value={stopLossPrice}
                                        onChange={(e) => setStopLossPrice(e.target.value)} placeholder="Optional"
                                    />
                                </div>
                                <div className="form-group small">
                                    <label>Take Profit ($)</label>
                                    <input
                                        type="number" step="0.000001" value={takeProfitPrice}
                                        onChange={(e) => setTakeProfitPrice(e.target.value)} placeholder="Optional"
                                    />
                                </div>
                            </div>
                            <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                                Est. Total: ${(parseFloat(tradeQuantity || 0) * (orderType === 'LIMIT' && limitPrice ? parseFloat(limitPrice) : selectedCoin.current_price)).toFixed(2)}
                            </p>
                            {tradeStatus && <p className="status-msg">{tradeStatus}</p>}
                            <div className="modal-actions">
                                <button type="button" onClick={() => setTradeModalOpen(false)}>Cancel</button>
                                <button type="submit" className="confirm-btn">{orderType === 'LIMIT' ? 'Place Order' : `Confirm ${tradeAction}`}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
