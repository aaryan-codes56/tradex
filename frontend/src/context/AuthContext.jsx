import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    // Ideally we would validate the token with the backend here
                    // For now, let's assume if we have a token we are logged in or fetch profile
                    // const res = await axios.get('http://localhost:5001/api/auth/profile', config);
                    // setUser(res.data);

                    // Fetch user profile to validate token
                    const { data } = await axios.get('http://localhost:5001/api/user/profile', config);
                    setUser(data);

                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed');
            return { success: false, error: error.response?.data?.message || 'Login failed' };
        }
    };

    const signup = async (username, email, password) => {
        try {
            const { data } = await axios.post('http://localhost:5001/api/auth/signup', { username, email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            return { success: true };
        } catch (error) {
            setError(error.response?.data?.message || 'Signup failed');
            return { success: false, error: error.response?.data?.message || 'Signup failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
