import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Crown, Medal } from 'lucide-react';
import './Leaderboard.css';

const Leaderboard = () => {
    // ... state ...
    const [traders, setTraders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            // ... logic ...
            try {
                const { data } = await axios.get('http://localhost:5001/api/leaderboard');
                setTraders(data);
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const formatMoney = (val) => {
        const sign = val >= 0 ? '+' : '-';
        return `${sign}$${Math.abs(val).toLocaleString()}`;
    };

    const formatPercent = (val) => {
        const sign = val >= 0 ? '+' : '-';
        return `${sign}${Math.abs(val)}%`;
    };

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2><Trophy className="text-yellow-500" size={32} style={{ marginRight: '12px' }} /> Top Traders Leaderboard</h2>
                <p>Follow the best performing portfolios in the TradeX ecosystem</p>
            </div>

            <div className="leaderboard-card">
                {loading ? (
                    <div className="loading-state">Loading Top Traders...</div>
                ) : (
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Trader</th>
                                <th>Style</th>
                                <th>Win Rate</th>
                                <th>Total Profit</th>
                                <th>ROI</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {traders.map((trader, index) => (
                                <tr key={index} className={index < 3 ? 'top-rank' : ''}>
                                    <td>
                                        <div className={`rank-badge rank-${index + 1}`}>
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="trader-name">
                                            {trader.name}
                                            {index === 0 && <Crown size={16} color="#eab308" fill="#eab308" style={{ marginLeft: '8px' }} />}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`style-badge ${trader.style.toLowerCase()}`}>
                                            {trader.style.charAt(0).toUpperCase() + trader.style.slice(1).toLowerCase()}
                                        </span>
                                    </td>
                                    <td>{trader.winRate}%</td>
                                    <td className={`profit ${trader.profit >= 0 ? 'positive' : 'negative'}`}>
                                        {formatMoney(trader.profit)}
                                    </td>
                                    <td className={`roi ${trader.roi >= 0 ? 'positive' : 'negative'}`}>
                                        {formatPercent(trader.roi)}
                                    </td>
                                    <td>
                                        <button className="copy-btn" onClick={() => alert(`Copied strategy of ${trader.name}!`)}>
                                            Copy
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
