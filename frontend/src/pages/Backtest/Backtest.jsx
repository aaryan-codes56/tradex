import { useState } from 'react';
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
import './Backtest.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Backtest = () => {
    const [formData, setFormData] = useState({
        symbol: 'RELIANCE',
        strategy: 'Momentum',
        duration: '30'
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('http://localhost:5001/api/trades/backtest', formData, config);
            setResult(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Backtest failed');
        } finally {
            setLoading(false);
        }
    };

    const chartData = result ? {
        labels: result.history.map(t => new Date(t.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Portfolio Balance',
                data: result.history.map(t => t.balance),
                borderColor: 'rgb(37, 99, 235)',
                backgroundColor: 'rgba(37, 99, 235, 0.5)',
                tension: 0.1
            }
        ]
    } : null;

    return (
        <div className="backtest-container">
            <h2>Strategy Backtesting</h2>

            <div className="backtest-form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Stock</label>
                        <select name="symbol" value={formData.symbol} onChange={handleChange}>
                            <option value="RELIANCE">Reliance Industries</option>
                            <option value="TCS">TCS</option>
                            <option value="HDFCBANK">HDFC Bank</option>
                            <option value="INFY">Infosys</option>
                            <option value="TATAMOTORS">Tata Motors</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Strategy</label>
                        <select name="strategy" value={formData.strategy} onChange={handleChange}>
                            <option value="Momentum">Momentum Trend</option>
                            <option value="Mean Reversion">Mean Reversion</option>
                            <option value="AI Driven">AI Driven (Simulated)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Duration (Days)</label>
                        <select name="duration" value={formData.duration} onChange={handleChange}>
                            <option value="7">7 Days</option>
                            <option value="30">30 Days</option>
                            <option value="90">90 Days</option>
                        </select>
                    </div>
                    <button type="submit" className="run-btn" disabled={loading}>
                        {loading ? 'Running Simulation...' : 'Run Backtest'}
                    </button>
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {result && (
                <div className="results-section">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h4>Initial Balance</h4>
                            <p>₹{result.initial_balance.toLocaleString()}</p>
                        </div>
                        <div className="stat-card">
                            <h4>Final Balance</h4>
                            <p>₹{result.final_balance.toFixed(2)}</p>
                        </div>
                        <div className={`stat-card ${result.roi >= 0 ? 'positive' : 'negative'}`}>
                            <h4>ROI</h4>
                            <p>{result.roi.toFixed(2)}%</p>
                        </div>
                        <div className="stat-card">
                            <h4>Trades Executed</h4>
                            <p>{result.trade_count}</p>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3>Performance Curve</h3>
                        <Line options={{ responsive: true, maintainAspectRatio: false }} data={chartData} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Backtest;
