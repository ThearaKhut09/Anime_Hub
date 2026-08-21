const { query } = require('../config/db');

// @route   GET /api/reviews/:animeId
// @desc    Get all reviews for an anime
const getReviewsByAnime = async (req, res, next) => {
    try {
        const { animeId } = req.params;
        const result = await query(
            `SELECT r.id, r.comment, r.rating, r.created_at,
                    u.username, u.avatar_url, u.role
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.anime_id = $1
             ORDER BY r.created_at DESC`,
            [animeId]
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

// @route   POST /api/reviews/:animeId
// @desc    Add review/comment for an anime (Authenticated)
const addReview = async (req, res, next) => {
    try {
        const { animeId } = req.params;
        const { comment, rating } = req.body;
        const userId = req.user.id;

        if (!comment || comment.trim() === '') {
            return res.status(400).json({ success: false, message: 'Review comment cannot be empty.' });
        }

        const insertRes = await query(
            `INSERT INTO reviews (anime_id, user_id, comment, rating)
             VALUES ($1, $2, $3, $4)
             RETURNING id, comment, rating, created_at`,
            [animeId, userId, comment.trim(), rating ? parseInt(rating, 10) : 5]
        );

        const newReview = insertRes.rows[0];

        res.status(201).json({
            success: true,
            message: 'Review posted successfully!',
            data: {
                ...newReview,
                username: req.user.username,
                avatar_url: req.user.avatar_url,
                role: req.user.role
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getReviewsByAnime,
    addReview
};
