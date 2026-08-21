const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'anime_hub_super_secret_jwt_key_2026_change_in_production');
        
        // Fetch user from DB to ensure user is active
        const userRes = await query('SELECT id, username, email, role, avatar_url FROM users WHERE id = $1', [decoded.id]);
        
        if (userRes.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid session or user does not exist.' });
        }

        req.user = userRes.rows[0];
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Access forbidden. Admin role required.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    protect: authenticateToken,
    requireAdmin
};
