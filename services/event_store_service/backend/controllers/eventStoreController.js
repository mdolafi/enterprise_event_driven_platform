const db = require('../config/db');

// POST /api/v1/event-store
exports.createEvent = async (req, res) => {
    const { event_type, aggregate_id, payload } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO event_store (event_type, aggregate_id, payload)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [event_type, aggregate_id, payload]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/event-store/:event_id
exports.getEventById = async (req, res) => {
    const { event_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM event_store WHERE event_id = $1', [event_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/event-store/:event_id
exports.updateEvent = async (req, res) => {
    const { event_id } = req.params;
    const { payload } = req.body;
    try {
        const result = await db.query(
            `UPDATE event_store
       SET payload = COALESCE($1, payload),
           created_at = CURRENT_TIMESTAMP
       WHERE event_id = $2
       RETURNING *`,
            [payload, event_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/event-store/:event_id
exports.deleteEvent = async (req, res) => {
    const { event_id } = req.params;
    try {
        const result = await db.query('DELETE FROM event_store WHERE event_id = $1 RETURNING event_id', [event_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};