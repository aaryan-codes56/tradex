const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            username,
            email,
            password,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    if (req.user) {
        res.json({
            _id: req.user._id,
            username: req.user.username,
            fullName: req.user.fullName,
            bio: req.user.bio,
            email: req.user.email,
            profilePicture: req.user.profilePicture,
            preferences: req.user.preferences
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile & settings
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.username = req.body.username || user.username;
            user.fullName = req.body.fullName !== undefined ? req.body.fullName : user.fullName;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
            user.email = req.body.email || user.email;
            user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

            if (req.body.preferences) {
                user.preferences = { ...user.preferences, ...req.body.preferences };
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                fullName: updatedUser.fullName,
                bio: updatedUser.bio,
                email: updatedUser.email,
                profilePicture: updatedUser.profilePicture,
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
});

// @route   PUT /api/auth/balance
// @desc    Update paper balance (Reset or Deposit)
// @access  Private
router.put('/balance', protect, async (req, res) => {
    try {
        const { type, amount } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (type === 'reset') {
            user.paperBalance = 10000;
            user.investedCapital = 10000;
            user.portfolio = {};
        } else if (type === 'deposit') {
            if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });
            user.paperBalance += parseFloat(amount);
            // Initialize investedCapital if it doesn't exist yet (for old users)
            if (!user.investedCapital) user.investedCapital = 10000;
            user.investedCapital += parseFloat(amount);
        } else {
            return res.status(400).json({ message: 'Invalid balance operation' });
        }

        await user.save();

        res.json({
            balance: user.paperBalance,
            portfolio: user.portfolio,
            message: type === 'reset' ? 'Account reset successfully' : `Deposited $${amount}`
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error updating balance', error: error.message });
    }
});

// @route   DELETE /api/user/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            await User.deleteOne({ _id: user._id });
            // Also delete associated trades? Ideally yes, but for now just the user is fine or cascading if handled by DB.
            // Mongoose doesn't cascade by default. Let's manually delete trades for cleanliness.
            const Trade = require('../models/Trade');
            await Trade.deleteMany({ userId: user._id });

            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting account', error: error.message });
    }
});

module.exports = { router, protect };
