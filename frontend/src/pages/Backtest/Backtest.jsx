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
                label: 'Portfolio Value',
                data: result.history.map(t => t.balance),
                borderColor: '#2563eb', // Primary Blue
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
                    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
                    return gradient;
                },
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointBackgroundColor: '#2563eb',
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#ffffff',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `Balance: $${context.parsed.y.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    color: '#64748b',
                    maxTicksLimit: 8,
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                grid: {
                    color: '#f1f5f9',
                    drawBorder: false,
                    borderDash: [5, 5]
                },
                ticks: {
                    color: '#64748b',
                    callback: function (value) {
                        return '$' + value;
                    },
                    font: {
                        size: 11
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    return (
        <div className="backtest-container">
            <div className="backtest-header">
                <h2>Algo-Backtesting</h2>
                <p>Test your strategies against historical crypto data</p>
            </div>

            <div className="backtest-content">
                <div className="backtest-form-card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Crypto Asset</label>
                            <select name="symbol" value={formData.symbol} onChange={handleChange}>
                                <option value="BTC">Bitcoin (BTC)</option>
                                <option value="ETH">Ethereum (ETH)</option>
                                <option value="SOL">Solana (SOL)</option>
                                <option value="ADA">Cardano (ADA)</option>
                                <option value="XRP">Ripple (XRP)</option>
                                <option value="DOGE">Dogecoin (DOGE)</option>
                                <option value="DOT">Polkadot (DOT)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Strategy</label>
                            <select name="strategy" value={formData.strategy} onChange={handleChange}>
                                <option value="Momentum">Momentum Trend</option>
                                <option value="Mean Reversion">Mean Reversion</option>
                                <option value="AI Driven">AI Neural Net (Beta)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Timeframe (Days)</label>
                            <select name="duration" value={formData.duration} onChange={handleChange}>
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="180">6 Months</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>
                        <button type="submit" className="run-btn" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner"></span> Running Simulation...
                                </>
                            ) : 'Execute Backtest'}
                        </button>
                    </form>
                </div>

                {error && <div className="error-message">{error}</div>}

                {result && (
                    <div className="results-section">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h4>Initial Capital</h4>
                                <p>${result.initial_balance.toLocaleString()}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Final Equity</h4>
                                <p>${result.final_balance.toFixed(2)}</p>
                            </div>
                            <div className={`stat-card ${result.roi >= 0 ? 'positive' : 'negative'}`}>
                                <h4>Total ROI</h4>
                                <p>{result.roi > 0 ? '+' : ''}{result.roi.toFixed(2)}%</p>
                            </div>
                            <div className="stat-card">
                                <h4>Total Trades</h4>
                                <p>{result.trade_count}</p>
                            </div>
                            <div className="stat-card">
                                <h4>Win Rate</h4>
                                <p>{result.win_rate ? result.win_rate.toFixed(1) : 0}%</p>
                            </div>
                            <div className="stat-card negative">
                                <h4>Max Drawdown</h4>
                                <p>-{result.max_drawdown ? result.max_drawdown.toFixed(2) : 0}%</p>
                            </div>
                            <div className="stat-card">
                                <h4>Sharpe Ratio</h4>
                                <p>{result.sharpe_ratio ? result.sharpe_ratio.toFixed(2) : 0}</p>
                            </div>
                        </div>

                        <div className="chart-container">
                            <div className="chart-header">
                                <h3>Equity Curve</h3>
                                <div className="chart-badge">{formData.strategy}</div>
                            </div>
                            <div className="chart-wrapper">
                                <Line options={chartOptions} data={chartData} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Backtest;
