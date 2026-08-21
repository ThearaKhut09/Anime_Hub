const { query } = require('../config/db');

// @route   POST /api/contacts
// @desc    Submit a contact inquiry message
const submitMessage = async (req, res, next) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'Please provide your name, email, and message.' });
        }

        const result = await query(
            `INSERT INTO contact_messages (name, email, message)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, message, created_at`,
            [name.trim(), email.toLowerCase().trim(), message.trim()]
        );

        res.status(201).json({
            success: true,
            message: 'Thank you! Your message has been received. We will get back to you shortly.',
            data: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
};

// @route   GET /api/contacts
// @desc    Get all contact messages (Admin only)
const getMessages = async (req, res, next) => {
    try {
        const result = await query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        next(err);
    }
};

// @route   DELETE /api/contacts/:id
// @desc    Delete a contact message (Admin only)
const deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        await query('DELETE FROM contact_messages WHERE id = $1', [id]);
        res.json({
            success: true,
            message: 'Message deleted successfully.'
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    submitMessage,
    getMessages,
    deleteMessage
};
