import { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Settings.css';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState(user?.preferences?.notifications ?? true);

    const [riskTolerance, setRiskTolerance] = useState(user?.preferences?.riskTolerance || 'medium');
    const [status, setStatus] = useState('');

    const handleSave = async () => {
        setStatus('Saving...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put('http://localhost:5001/api/auth/profile', {
                preferences: {
                    notifications,
                    riskTolerance
                }
            }, config);

            // Update local storage manually for immediate effect
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                storedUser.preferences = { ...storedUser.preferences, notifications, riskTolerance };
                localStorage.setItem('user', JSON.stringify(storedUser));
            }

            setStatus('Settings Saved!');
            setTimeout(() => setStatus(''), 2000);
        } catch (error) {
            console.error('Error saving settings', error);
            setStatus('Error saving settings');
        }
    };

    const handleBalanceUpdate = async (type) => {
        if (type === 'reset' && !window.confirm('Are you sure? This will clear your portfolio and reset balance to $10,000.')) return;

        setStatus('Updating Funds...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.put('http://localhost:5001/api/auth/balance', {
                type,
                amount: type === 'deposit' ? 1000 : 0
            }, config);

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                storedUser.paperBalance = data.balance;
                if (type === 'reset') storedUser.portfolio = data.portfolio;
                // Ideally also update portfolio in storage if we track it there, but mostly we fetch it fresh.
                // But Dashboard relies on fresh fetch mostly.
                // If AuthContext keeps track, we should reload.
                localStorage.setItem('user', JSON.stringify(storedUser));
            }

            setStatus(data.message);
            setTimeout(() => {
                setStatus('');
                window.location.reload(); // Refresh to show new balance in navbar/dashboard
            }, 1000);

        } catch (error) {
            console.error('Error updating funds', error);
            setStatus('Error updating funds');
        }
    };

    // Auto-save on change (optional, but let's do manual save for now or effect based)
    // Let's stick to a save button or save on change? 
    // The user request didn't specify, but "auto-save" is premium. Let's do auto-save on risk-tolerance change, and toggle change.

    useEffect(() => {
        // Initial load sync if needed
    }, []);

    const handleChange = (setter, value) => {
        setter(value);
        // We can trigger save here or have a save button. Let's add a save button for clarity, or debounced save.
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>

            <div className="setting-item">
                <div className="setting-info">
                    <h3>Notifications</h3>
                    <p>Receive email updates about your portfolio</p>
                </div>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
            </div>



            <div className="setting-item">
                <div className="setting-info">
                    <h3>Risk Tolerance</h3>
                    <p>Adjust AI recommendation sensitivity</p>
                </div>
                <select
                    className="settings-select"
                    value={riskTolerance}
                    onChange={(e) => setRiskTolerance(e.target.value)}
                >
                    <option value="low">Low (Conservative)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Aggressive)</option>
                </select>
            </div>

            <div className="setting-item fund-management" style={{ display: 'block' }}>
                <div className="setting-info" style={{ marginBottom: '1rem' }}>
                    <h3>Manage Funds 💳</h3>
                    <p>Top up your paper trading account or reset to default.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="save-btn"
                        style={{ background: '#16a34a', flex: 1 }}
                        onClick={() => handleBalanceUpdate('deposit')}
                    >
                        + Deposit $1,000
                    </button>
                    <button
                        className="save-btn"
                        style={{ background: '#dc2626', flex: 1 }}
                        onClick={() => handleBalanceUpdate('reset')}
                    >
                        Reset to $10k
                    </button>
                </div>
            </div>

            <div className="setting-item" style={{ border: 'none', justifyContent: 'flex-end' }}>
                <button
                    className="save-btn" // Reusing from profile css if imported globally, or we define it here
                    style={{ background: '#0f172a' }}
                    onClick={handleSave}
                >
                    Save Preferences
                </button>
            </div>
            {status && <div style={{ textAlign: 'right', color: '#2563eb', marginTop: '0.5rem' }}>{status}</div>}
        </div>
    );
};

export default Settings;
