const db = require('../config/db');

// POST /api/v1/notifications
exports.createNotification = async (req, res) => {
    const { recipient_email, subject, message_body, notification_type } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO notifications (recipient_email, subject, message_body, notification_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [recipient_email, subject, message_body, notification_type]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/notifications/:notification_id
exports.getNotificationById = async (req, res) => {
    const { notification_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM notifications WHERE notification_id = $1', [notification_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Notification not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/notifications/:notification_id
exports.updateNotification = async (req, res) => {
    const { notification_id } = req.params;
    const { subject, message_body } = req.body;
    try {
        const result = await db.query(
            `UPDATE notifications
       SET subject = COALESCE($1, subject),
           message_body = COALESCE($2, message_body),
           updated_at = CURRENT_TIMESTAMP
       WHERE notification_id = $3
       RETURNING *`,
            [subject, message_body, notification_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Notification not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/notifications/:notification_id
exports.deleteNotification = async (req, res) => {
    const { notification_id } = req.params;
    try {
        const result = await db.query('DELETE FROM notifications WHERE notification_id = $1 RETURNING notification_id', [notification_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Notification not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};