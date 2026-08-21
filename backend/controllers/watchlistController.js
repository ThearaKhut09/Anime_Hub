const { query } = require('../config/db');

// @route   POST /api/watchlist/:animeId
// @desc    Toggle anime in user's watchlist (Authenticated)
const toggleWatchlist = async (req, res, next) => {
    try {
        const { animeId } = req.params;
        const userId = req.user.id;

        // Check if already in watchlist
        const existing = await query(
            'SELECT id FROM watchlist WHERE user_id = $1 AND anime_id = $2',
            [userId, animeId]
        );

        if (existing.rows.length > 0) {
            await query(
                'DELETE FROM watchlist WHERE user_id = $1 AND anime_id = $2',
                [userId, animeId]
            );
            return res.json({
                success: true,
                inWatchlist: false,
                message: 'Removed from your Watchlist.'
            });
        } else {
            await query(
                'INSERT INTO watchlist (user_id, anime_id) VALUES ($1, $2)',
                [userId, animeId]
            );
            return res.json({
                success: true,
                inWatchlist: true,
                message: 'Added to your Watchlist! ❤️'
            });
        }
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/watchlist
// @desc    Get all saved anime in user's watchlist (Authenticated)
const getWatchlist = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await query(
            `SELECT a.id, a.title, a.native_title, a.type, a.genre, a.poster_url, 
                    a.rating, a.views, a.status, w.created_at AS saved_at
             FROM watchlist w
             JOIN anime a ON w.anime_id = a.id
             WHERE w.user_id = $1
             ORDER BY w.created_at DESC`,
            [userId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/watchlist/check/:animeId
// @desc    Check if anime is saved in watchlist (Authenticated)
const checkWatchlist = async (req, res, next) => {
    try {
        const { animeId } = req.params;
        const userId = req.user.id;

        const result = await query(
            'SELECT id FROM watchlist WHERE user_id = $1 AND anime_id = $2',
            [userId, animeId]
        );

        res.json({
            success: true,
            inWatchlist: result.rows.length > 0
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    toggleWatchlist,
    getWatchlist,
    checkWatchlist
};
