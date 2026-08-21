const express = require('express');
const router = express.Router();
const { toggleWatchlist, getWatchlist, checkWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All watchlist routes require authentication

router.get('/', getWatchlist);
router.post('/:animeId', toggleWatchlist);
router.get('/check/:animeId', checkWatchlist);

module.exports = router;
