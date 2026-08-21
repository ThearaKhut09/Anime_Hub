const express = require('express');
const router = express.Router();
const { getAnimeList, getAnimeById, createAnime, deleteAnime, getAdminStats } = require('../controllers/animeController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', getAnimeList);
router.get('/admin/stats', protect, requireAdmin, getAdminStats);
router.get('/:id', getAnimeById);
router.post('/', protect, requireAdmin, createAnime);
router.delete('/:id', protect, requireAdmin, deleteAnime);

module.exports = router;
