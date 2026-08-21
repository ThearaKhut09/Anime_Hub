const express = require('express');
const router = express.Router();
const { getAnimeList, getAnimeById, createAnime } = require('../controllers/animeController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAnimeList);
router.get('/:id', getAnimeById);
router.post('/', authenticateToken, requireAdmin, createAnime);

module.exports = router;
