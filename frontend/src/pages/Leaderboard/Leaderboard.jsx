import { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

const Leaderboard = () => {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetching from auth routes where we added the endpoint
                const { data } = await axios.get('http://localhost:5001/api/auth/leaderboard');
                setLeaders(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching leaderboard', error);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) return <div className="loading">Loading Leaderboard...</div>;

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2>🏆 Top Traders</h2>
                <p>Ranking based on current Portfolio Balance</p>
            </div>

            <div className="leaderboard-card">
                <table className="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Trader</th>
                            <th>Balance</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaders.map((leader, index) => (
                            <tr key={leader._id} className={index < 3 ? 'top-rank' : ''}>
                                <td>
                                    <span className={`rank-badge rank-${index + 1}`}>
                                        {index + 1}
                                    </span>
                                </td>
                                <td className="trader-cell">
                                    <div className="trader-avatar">
                                        {leader.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="trader-name">{leader.username}</span>
                                </td>
                                <td className="balance-cell">
                                    ${leader.paperBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td>
                                    {index === 0 && <span className="status-badge gold">Legend</span>}
                                    {index === 1 && <span className="status-badge silver">Master</span>}
                                    {index === 2 && <span className="status-badge bronze">Pro</span>}
                                    {index > 2 && <span className="status-badge">Member</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
