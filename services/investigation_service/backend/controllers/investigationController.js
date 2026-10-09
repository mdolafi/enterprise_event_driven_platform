const db = require('../config/db');

// POST /api/v1/investigations
exports.createInvestigation = async (req, res) => {
    const { proposal_id, investigator_name, findings, status } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO investigations (proposal_id, investigator_name, findings, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [proposal_id, investigator_name, findings, status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/investigations/:investigation_id
exports.getInvestigationById = async (req, res) => {
    const { investigation_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM investigations WHERE investigation_id = $1', [investigation_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/investigations/:investigation_id
exports.updateInvestigation = async (req, res) => {
    const { investigation_id } = req.params;
    const { findings, status } = req.body;
    try {
        const result = await db.query(
            `UPDATE investigations
       SET findings = COALESCE($1, findings),
           status = COALESCE($2, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE investigation_id = $3
       RETURNING *`,
            [findings, status, investigation_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/investigations/:investigation_id
exports.deleteInvestigation = async (req, res) => {
    const { investigation_id } = req.params;
    try {
        const result = await db.query('DELETE FROM investigations WHERE investigation_id = $1 RETURNING investigation_id', [investigation_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};