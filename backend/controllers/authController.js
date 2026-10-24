const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/jwt');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user account
const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide username, email, and password.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
        }

        // Check if email already exists
        const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await query(
            `INSERT INTO users (username, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, role, avatar_url, created_at`,
            [username.trim(), email.toLowerCase().trim(), passwordHash, 'user']
        );

        const newUser = result.rows[0];
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'Account registered successfully!',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                avatar_url: newUser.avatar_url,
            }
        });
    } catch (err) {
        next(err);
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password.' });
        }

        const userRes = await query(
            `SELECT id, username, email, password_hash, role, avatar_url
             FROM users WHERE email = $1`,
            [email.toLowerCase().trim()]
        );

        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const user = userRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Logged in successfully!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url,
            }
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
const getMe = async (req, res) => {
    res.json({
        success: true,
        user: req.user
    });
};

module.exports = {
    register,
    login,
    getMe
};
