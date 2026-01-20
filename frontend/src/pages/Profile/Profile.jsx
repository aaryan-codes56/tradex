import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, logout, login } = useContext(AuthContext); // Assuming login/setUser updates context
    const [pfpUrl, setPfpUrl] = useState(user?.profilePicture || '');
    const [username, setUsername] = useState(user?.username || '');
    const [status, setStatus] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatus('Updating...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.put('http://localhost:5001/api/auth/profile', {
                username,
                profilePicture: pfpUrl
            }, config);

            // Update local storage and context if possible, or just force reload
            // Ideally AuthContext should have an 'updateUser' method, but for now we can rely on re-login simulation or just updating state
            // Let's assume user context auto-updates or we need to manually update it
            // Simple hack for now if update function not available: update user object in local storage?
            // Better: reload page or call a function from context if it exists.
            // If login function accepts user data, we can call it.

            // For this MVP, we will rely on a simple alert and maybe context update if exposed, if not just reload.
            localStorage.setItem('user', JSON.stringify(data));
            // Trigger a reload to refresh context
            window.location.reload();

        } catch (error) {
            setStatus('Error updating profile');
            console.error(error);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete('http://localhost:5001/api/auth/profile', config);
                logout();
            } catch (error) {
                console.error('Error deleting account', error);
                alert('Failed to delete account');
            }
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar-large">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" />
                    ) : (
                        user?.username?.charAt(0).toUpperCase()
                    )}
                </div>
                <div className="profile-info">
                    <h2>{user?.username}</h2>
                    <p>{user?.email}</p>
                </div>
            </div>

            <div className="profile-section">
                <h3>Edit Profile</h3>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Profile Picture URL</label>
                        <input
                            type="text"
                            value={pfpUrl}
                            onChange={(e) => setPfpUrl(e.target.value)}
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                    <button type="submit" className="save-btn">Save Changes</button>
                    {status && <p style={{ marginTop: '1rem', color: '#2563eb' }}>{status}</p>}
                </form>
            </div>

            <div className="danger-zone">
                <h3>Danger Zone</h3>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
        </div>
    );
};

export default Profile;
