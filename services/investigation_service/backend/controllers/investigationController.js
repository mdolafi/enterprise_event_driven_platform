const db = require('../config/db');

// POST /api/v1/investigations
exports.createInvestigation = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const { proposal_id, investigator_name, investigatorEmail, findings, status } = req.body;

        if (!investigatorEmail) {
            return res.status(400).json({ error: 'Missing investigator email' });
        }

        if (!investigatorEmail.endsWith('@dot.gov')) {
            return res.status(400).json({ error: 'Investigator email must belong to @dot.gov domain' });
        }

        const result = await db.query(
            `INSERT INTO investigations (proposal_id, investigator_name, investigator_email, findings, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING investigation_id AS id, investigation_id, proposal_id, investigator_name, investigator_email AS "investigatorEmail", findings, status`,
            [proposal_id || 'ccb-2026-0042', investigator_name || 'Michael Kim', investigatorEmail, findings || '', status || 'INITIATED']
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/investigations/:investigation_id
exports.getInvestigationById = async (req, res) => {
    const { investigation_id } = req.params;
    try {
        const result = await db.query(
            'SELECT investigation_id AS id, investigation_id, investigator_email AS "investigatorEmail", * FROM investigations WHERE investigation_id = $1',
            [investigation_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/investigations/:investigation_id
exports.updateInvestigation = async (req, res) => {
    const { investigation_id } = req.params;
    const { findings, status, summary } = req.body;

    // Check for unauthorized status transition bypass
    if (status === 'CLOSED_UNAUTHORIZED_BYPASS') {
        return res.status(403).json({ error: 'Forbidden: Unauthorized status transition attempt' });
    }

    try {
        const result = await db.query(
            `UPDATE investigations
             SET findings = COALESCE($1, findings),
                 status = COALESCE($2, status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE investigation_id = $3
             RETURNING investigation_id AS id, investigation_id, status, findings`,
            [findings || summary, status, investigation_id]
        );

        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/investigations/:investigation_id
exports.deleteInvestigation = async (req, res) => {
    const { investigation_id } = req.params;
    try {
        const result = await db.query('DELETE FROM investigations WHERE investigation_id = $1 RETURNING investigation_id', [investigation_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Investigation record not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};