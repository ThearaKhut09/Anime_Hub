const express = require('express');
const router = express.Router();
const { getReviewsByAnime, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:animeId', getReviewsByAnime);
router.post('/:animeId', protect, addReview);

module.exports = router;
