import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import './TradeGPTWidget.css';

const TradeGPTWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm TradeGPT. Ask me about your portfolio or market trends.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const { user } = React.useContext(AuthContext); // Ensure AuthContext is imported

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const token = localStorage.getItem('token');
            // If backend chat route is not ready, we can still mock here or try the endpoint
            // Let's try the endpoint, if it fails, fallback to client-side mock or error
            // Actually, let's implement the backend route next so we can rely on it.

            const { data } = await axios.post('http://localhost:5001/api/ai/chat', {
                message: input,
                context: user ? { balance: user.paperBalance, portfolio: user.portfolio } : {}
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessages(prev => [...prev, { id: Date.now() + 1, text: data.response, sender: 'ai' }]);
            setIsTyping(false);

        } catch (error) {
            console.error("GPT Error", error);
            // Fallback for demo if backend is offline
            setTimeout(() => {
                let fallbackResponse = "I'm having trouble connecting to the server. Please try again later.";
                if (input.toLowerCase().includes('hello')) fallbackResponse = "Hello! I am operating in offline mode currently.";
                setMessages(prev => [...prev, { id: Date.now() + 1, text: fallbackResponse, sender: 'ai' }]);
                setIsTyping(false);
            }, 1000);
        }
    };

    if (!user) return null;

    return (
        <div className={`tradegpt-wrapper ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="tradegpt-fab" onClick={() => setIsOpen(true)}>
                    🤖 <span className="fab-label">Ask AI</span>
                </button>
            )}

            {isOpen && (
                <div className="tradegpt-window">
                    <div className="gpt-header">
                        <div className="gpt-title">
                            <span className="ai-avatar">🤖</span>
                            <div>
                                <h4>TradeGPT Assistant</h4>
                                <span className="status-indicator">Online</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="gpt-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                <div className="bubble">{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message ai">
                                <div className="bubble typing">
                                    <span>●</span><span>●</span><span>●</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="gpt-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Ask about crypto..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TradeGPTWidget;
