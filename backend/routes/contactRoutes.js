const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, deleteMessage } = require('../controllers/contactController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

router.post('/', submitMessage);
router.get('/', protect, requireAdmin, getMessages);
router.delete('/:id', protect, requireAdmin, deleteMessage);

module.exports = router;
