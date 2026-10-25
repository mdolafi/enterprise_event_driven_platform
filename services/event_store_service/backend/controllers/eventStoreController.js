const db = require('../config/db');

// POST /api/v1/events
exports.createEvent = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const { event_type, aggregate_id, payload, source_service } = req.body;

        if (!event_type || !aggregate_id || !payload) {
            return res.status(400).json({ error: 'Missing required event fields' });
        }

        const timestamp = new Date().toISOString();
        const result = await db.query(
            `INSERT INTO event_store (event_type, aggregate_id, payload, source_service, created_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING event_id AS id, event_id, event_type, aggregate_id, payload, source_service, created_at AS timestamp`,
            [event_type, aggregate_id, JSON.stringify(payload), source_service || 'voter_service', timestamp]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/events/:event_id
exports.getEventById = async (req, res) => {
    const { event_id } = req.params;
    try {
        const result = await db.query(
            'SELECT event_id AS id, event_id, event_type, aggregate_id, payload, source_service, created_at AS timestamp FROM event_store WHERE event_id = $1',
            [event_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/events/:event_id
exports.updateEvent = async (req, res) => {
    const { event_id } = req.params;
    const { payload } = req.body;
    try {
        const result = await db.query(
            `UPDATE event_store
             SET payload = COALESCE($1, payload),
                 created_at = CURRENT_TIMESTAMP
             WHERE event_id = $2
             RETURNING event_id AS id, *`,
            [payload ? JSON.stringify(payload) : null, event_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/events/:event_id
exports.deleteEvent = async (req, res) => {
    const { event_id } = req.params;
    try {
        const result = await db.query('DELETE FROM event_store WHERE event_id = $1 RETURNING event_id', [event_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Event record not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};