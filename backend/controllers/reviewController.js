const { query } = require('../config/db');

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
            [animeId, userId, comment.trim(), rating ? parseInt(rating, 10) : null]
        );

        const newReview = insertRes.rows[0];

        res.status(201).json({
            success: true,
            message: 'Review posted successfully!',
            data: {
                ...newReview,
                username: req.user.username,
                avatar_url: req.user.avatar_url,
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    addReview
};
