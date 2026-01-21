import { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">
                        TradeX
                    </Link>
                </div>
                <div className="navbar-links">
                    {user ? (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/history" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                History
                            </NavLink>
                            <NavLink to="/backtest" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Backtest
                            </NavLink>
                            <NavLink to="/leaderboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
                                Leaderboard
                            </NavLink>

                            <div className="profile-menu" ref={dropdownRef}>
                                <div className="profile-icon" onClick={toggleDropdown}>
                                    <div className="avatar-circle">
                                        {user.profilePicture ? (
                                            <img src={user.profilePicture} alt="P" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            user?.username?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </div>
                                </div>
                                {dropdownOpen && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <span className="user-name">{user?.username || 'User'}</span>
                                            <span className="user-email">{user?.email || ''}</span>
                                        </div>
                                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            Profile
                                        </Link>
                                        <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                            Settings
                                        </Link>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={logout} className="dropdown-item logout">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Login</Link>
                            <Link to="/signup" className="signup-link">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
