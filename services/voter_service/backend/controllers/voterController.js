const db = require('../config/db');

// POST /api/v1/voters
exports.castVote = async (req, res) => {
    const { voter_name, proposal_id, vote_decision, comments } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO votes (voter_name, proposal_id, vote_decision, comments)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [voter_name, proposal_id, vote_decision, comments]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/voters/:vote_id
exports.getVoteById = async (req, res) => {
    const { vote_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM votes WHERE vote_id = $1', [vote_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/voters/:vote_id
exports.updateVote = async (req, res) => {
    const { vote_id } = req.params;
    const { vote_decision, comments } = req.body;
    try {
        const result = await db.query(
            `UPDATE votes
       SET vote_decision = COALESCE($1, vote_decision),
           comments = COALESCE($2, comments),
           updated_at = CURRENT_TIMESTAMP
       WHERE vote_id = $3
       RETURNING *`,
            [vote_decision, comments, vote_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/voters/:vote_id
exports.deleteVote = async (req, res) => {
    const { vote_id } = req.params;
    try {
        const result = await db.query('DELETE FROM votes WHERE vote_id = $1 RETURNING vote_id', [vote_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Vote record not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};