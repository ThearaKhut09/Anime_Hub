const express = require('express');
const router = express.Router();
const { addReview } = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/:animeId', authenticateToken, addReview);

module.exports = router;
