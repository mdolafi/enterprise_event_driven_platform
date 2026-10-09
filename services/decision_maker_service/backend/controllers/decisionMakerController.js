const db = require('../config/db');

// POST /api/v1/decision_makers
exports.recordDecision = async (req, res) => {
    const { decision_maker_name, proposal_id, final_decision, notes } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO decisions (decision_maker_name, proposal_id, final_decision, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [decision_maker_name, proposal_id, final_decision, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/decision_makers/:decision_id
exports.getDecisionById = async (req, res) => {
    const { decision_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM decisions WHERE decision_id = $1', [decision_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Decision record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/decision_makers/:decision_id
exports.updateDecision = async (req, res) => {
    const { decision_id } = req.params;
    const { final_decision, notes } = req.body;
    try {
        const result = await db.query(
            `UPDATE decisions
       SET final_decision = COALESCE($1, final_decision),
           notes = COALESCE($2, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE decision_id = $3
       RETURNING *`,
            [final_decision, notes, decision_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Decision record not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/decision_makers/:decision_id
exports.deleteDecision = async (req, res) => {
    const { decision_id } = req.params;
    try {
        const result = await db.query('DELETE FROM decisions WHERE decision_id = $1 RETURNING decision_id', [decision_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Decision record not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};