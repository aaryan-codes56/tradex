import { useState, useEffect } from 'react';
import axios from 'axios';
import './History.css';

const History = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5001/api/trades/history', config);
                setTrades(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch trade history.');
                setLoading(false);
            }
        };

        fetchTrades();
    }, []);

    if (loading) return <div className="loading">Loading History...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="history-container">
            <h2>Trade History</h2>
            {trades.length === 0 ? (
                <p className="no-trades">No trades executed yet.</p>
            ) : (
                <div className="table-responsive">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Symbol</th>
                                <th>Action</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                                <th>Risk Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {trades.map((trade) => (
                                <tr key={trade._id}>
                                    <td>{new Date(trade.timestamp).toLocaleString()}</td>
                                    <td>{trade.symbol}</td>
                                    <td className={trade.action === 'BUY' ? 'text-green' : 'text-red'}>
                                        {trade.action}
                                    </td>
                                    <td>{trade.quantity}</td>
                                    <td>${trade.price.toFixed(2)}</td>
                                    <td>${trade.total.toFixed(2)}</td>
                                    <td>
                                        <span className={`badge badge-${trade.riskMetrics?.riskLevel.toLowerCase()}`}>
                                            {trade.riskMetrics?.riskLevel || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default History;
