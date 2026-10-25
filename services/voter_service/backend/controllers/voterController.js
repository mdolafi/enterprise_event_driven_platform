const db = require('../config/db');

// POST /api/v1/voters
exports.castVote = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const email = req.body.email || req.body.voter_email;
        const name = req.body.name || req.body.voter_name || 'Andre Gordon';

        if (!email) {
            return res.status(400).json({ error: 'Voter email is required' });
        }

        if (!email.endsWith('@dot.gov')) {
            return res.status(400).json({ error: 'Voter email must belong to @dot.gov domain' });
        }

        const result = await db.query(
            `INSERT INTO voters (email, name, role) VALUES ($1, $2, $3) RETURNING id, id AS vote_id, email, email AS voter_email, name, name AS voter_name, role, created_at`,
            [email, name, 'VOTER']
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/voters/:vote_id
exports.getVoteById = async (req, res) => {
    const { vote_id } = req.params;
    try {
        const result = await db.query(
            'SELECT id, id AS vote_id, email, email AS voter_email, name, name AS voter_name, role FROM voters WHERE id = $1',
            [vote_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/voters/:vote_id
exports.updateVote = async (req, res) => {
    const { vote_id } = req.params;
    const { vote_decision, comments, name } = req.body;
    try {
        const result = await db.query(
            `UPDATE voters SET name = COALESCE($1, name), updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, id AS vote_id, *`,
            [name, vote_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/voters/:vote_id
exports.deleteVote = async (req, res) => {
    const { vote_id } = req.params;
    try {
        const result = await db.query('DELETE FROM voters WHERE id = $1 RETURNING id', [vote_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};