import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Footer from '../../components/Footer';
import './Home.css';


const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="home-container">
            <section className="hero">
                <div className="hero-content">
                    <h1>Master Crypto Trading with AI</h1>
                    <p>
                        TradeX combines advanced AI price predictions with a powerful paper trading engine.
                        Test strategies risk-free and level up your trading game.
                    </p>
                    {!user && (
                        <div className="cta-buttons">
                            <Link to="/signup" className="btn btn-primary">Get Started</Link>
                        </div>
                    )}
                </div>

            </section>



            <section className="features">
                <div className="feature-card">
                    <h3>AI Predictions</h3>
                    <p>Get real-time Buy/Sell signals powered by LSTM neural networks. Our models analyze historical price action to identify potential breakout trends.</p>
                </div>
                <div className="feature-card">
                    <h3>Paper Trading</h3>
                    <p>Start with a $10,000 virtual balance. Execute buy and sell orders in a risk-free environment to validate your strategies before using real capital.</p>
                </div>
                <div className="feature-card">
                    <h3>Real-time Data</h3>
                    <p>Stay ahead with live market prices and sentiment analysis. Monitor the top cryptocurrencies with instant updates.</p>
                </div>
            </section>

            <section className="why-choose-us">
                <h2>Why Choose TradeX?</h2>
                <div className="reasons-grid">
                    <div className="reason-card">
                        <h4>Zero Risk</h4>
                        <p>Master the markets with virtual currency before risking real capital.</p>
                    </div>
                    <div className="reason-card">
                        <h4>Advanced AI</h4>
                        <p>Our LSTM models are trained on millions of data points to predict trends.</p>
                    </div>
                    <div className="reason-card">
                        <h4>Real-Time Execution</h4>
                        <p>Experience instant order execution and portfolio updates.</p>
                    </div>
                    <div className="reason-card">
                        <h4>Institutional Tools</h4>
                        <p>Access professional-grade charting and risk management metrics.</p>
                    </div>
                </div>
            </section>

            <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h4>Create Account</h4>
                        <p>Sign up in seconds and get your virtual trading wallet funded instantly. No deposit required.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h4>Analyze Trends</h4>
                        <p>Use our AI tools to scan the market for high-confidence trading opportunities and signals.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h4>Execute Trades</h4>
                        <p>Place paper trades, track your portfolio performance in real-time, and refine your strategy.</p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
