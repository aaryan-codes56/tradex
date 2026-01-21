import React, { useState } from 'react';
import { Plus, Trash2, Save, Play, Settings, ArrowRight } from 'lucide-react';
import './StrategyBuilder.css';

const StrategyBuilder = () => {
    const [strategyName, setStrategyName] = useState('My Custom Strategy');
    const [rules, setRules] = useState([
        { id: 1, indicator: 'RSI', operator: '<', value: '30', action: 'BUY' }
    ]);

    const indicators = ['RSI', 'MACD', 'Bollinger Lower', 'Bollinger Upper', 'Moving Avg (50)', 'Moving Avg (200)'];
    const operators = ['<', '>', '=', 'Crosses Above', 'Crosses Below'];
    const actions = ['BUY', 'SELL', 'CLOSE_POSITION'];

    const addRule = () => {
        setRules([...rules, {
            id: Date.now(),
            indicator: 'RSI',
            operator: '<',
            value: '50',
            action: 'BUY'
        }]);
    };

    const removeRule = (id) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const updateRule = (id, field, val) => {
        setRules(rules.map(r => r.id === id ? { ...r, [field]: val } : r));
    };

    const handleSave = () => {
        // Save to LocalStorage for now
        const strategy = { name: strategyName, rules };
        localStorage.setItem('savedStrategy', JSON.stringify(strategy));
        alert('Strategy Saved Successfully!');
    };

    return (
        <div className="strategy-container">
            <header className="strategy-header">
                <div>
                    <h2>⚡ Strategy Builder</h2>
                    <p>Design your own algo-trading logic without writing code.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setRules([])}>Reset</button>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={18} /> Save Strategy
                    </button>
                </div>
            </header>

            <div className="builder-canvas">
                <div className="strategy-meta">
                    <label>Strategy Name</label>
                    <input
                        type="text"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                    />
                </div>

                <div className="rules-list">
                    {rules.map((rule, index) => (
                        <div key={rule.id} className="rule-card">
                            <div className="rule-number">Rule #{index + 1}</div>

                            <div className="rule-logic">
                                <span className="logic-text">IF</span>
                                <select
                                    value={rule.indicator}
                                    onChange={(e) => updateRule(rule.id, 'indicator', e.target.value)}
                                >
                                    {indicators.map(i => <option key={i} value={i}>{i}</option>)}
                                </select>

                                <select
                                    className="operator-select"
                                    value={rule.operator}
                                    onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
                                >
                                    {operators.map(op => <option key={op} value={op}>{op}</option>)}
                                </select>

                                <input
                                    type="number"
                                    value={rule.value}
                                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                                    className="value-input"
                                />

                                <span className="logic-text arrow"><ArrowRight size={20} /> THEN</span>

                                <select
                                    className={`action-select ${rule.action}`}
                                    value={rule.action}
                                    onChange={(e) => updateRule(rule.id, 'action', e.target.value)}
                                >
                                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                            </div>

                            <button className="delete-btn" onClick={() => removeRule(rule.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                <button className="add-rule-btn" onClick={addRule}>
                    <Plus size={18} /> Add New Rule
                </button>
            </div>
        </div>
    );
};

export default StrategyBuilder;
