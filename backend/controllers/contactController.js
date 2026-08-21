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

module.exports = {
    submitMessage
};
