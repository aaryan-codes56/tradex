import { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { user, logout, login } = useContext(AuthContext); // Assuming login/setUser updates context
    const [pfpUrl, setPfpUrl] = useState(user?.profilePicture || '');
    const [username, setUsername] = useState(user?.username || '');
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [status, setStatus] = useState('');

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setStatus('Updating...');
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const { data } = await axios.put('http://localhost:5001/api/auth/profile', {
                username,
                fullName,
                bio,
                profilePicture: pfpUrl
            }, config);

            localStorage.setItem('user', JSON.stringify(data));
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
                    <h2>{user?.fullName || user?.username}</h2>
                    <p>{user?.email}</p>
                    {user?.bio && <p style={{ margin: '0.5rem 0', color: '#64748b' }}>{user.bio}</p>}
                </div>
            </div>

            <div className="profile-section">
                <h3>Edit Profile</h3>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="form-group">
                        <label>Bio</label>
                        <input
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Crypto enthusiast..."
                            maxLength={160}
                        />
                    </div>
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

            <div className="danger-zone" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
                <button className="delete-btn" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
        </div>
    );
};


export default Profile;
