const express = require('express');
const router = express.Router();
const { getReviewsByAnime, getAllReviews, addReview, deleteReview } = require('../controllers/reviewController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', protect, requireAdmin, getAllReviews);
router.get('/:animeId', getReviewsByAnime);
router.post('/:animeId', protect, addReview);
router.delete('/:id', protect, requireAdmin, deleteReview);

module.exports = router;
