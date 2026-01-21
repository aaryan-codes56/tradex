import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRightLeft, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';
import './WhaleAlerts.css';

const WhaleAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchWhales = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/whales');
                setAlerts(data.slice(0, 5));
            } catch (error) {
                console.error("Error fetching whales", error);
            }
        };

        fetchWhales();
        const interval = setInterval(fetchWhales, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatMoney = (val) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toFixed(0)}`;
    };

    return (
        <div className="whale-card">
            <div className="whale-header">
                <h3><Activity size={18} className="text-blue-600" /> Whale Watch</h3>
                <span className="live-dot"></span>
            </div>
            <div className="whale-list">
                {alerts.map(alert => (
                    <div key={alert.id} className="whale-item">
                        <div className={`whale-icon ${alert.type.toLowerCase()}`}>
                            {alert.type === 'Transfer' ? <ArrowRightLeft size={16} /> :
                                alert.type === 'Buy' ? <ArrowDownRight size={16} color="#16a34a" /> :
                                    <ArrowUpRight size={16} color="#dc2626" />}
                        </div>
                        <div className="whale-info">
                            <div className="whale-top">
                                <span className="whale-asset">{parseInt(alert.amount).toLocaleString()} {alert.asset}</span>
                                <span className="whale-value">{formatMoney(alert.valueUsd)}</span>
                            </div>
                            <div className="whale-route">
                                {alert.from.includes('Wallet') ? 'Wallet' : alert.from} ➔ {alert.to.includes('Wallet') ? 'Wallet' : alert.to}
                            </div>
                        </div>
                        <div className="whale-time">
                            {Math.floor((new Date() - new Date(alert.timestamp)) / 60000)}m
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WhaleAlerts;
