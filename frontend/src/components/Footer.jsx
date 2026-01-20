import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3>TradeX</h3>
                    <p>Empowering traders with AI-driven insights.</p>
                </div>
                <div className="footer-links">
                    <h4>Platform</h4>
                    <Link to="/signup">Get Started</Link>
                    <Link to="/login">Login</Link>
                    <a href="#">Simulations</a>
                </div>
                <div className="footer-links">
                    <h4>Company</h4>
                    <a href="#">About Us</a>
                    <a href="#">Careers</a>
                    <a href="#">Blog</a>
                </div>
                <div className="footer-links">
                    <h4>Resources</h4>
                    <a href="#">Help Center</a>
                    <a href="#">Docs</a>
                    <a href="#">Privacy</a>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} TradeX. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
