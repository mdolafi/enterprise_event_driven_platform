const db = require('../config/db');

// POST /api/v1/submitters
exports.createSubmission = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const { email, submitter_email, name, submitter_name, title, description, priority, system_affected } = req.body;
        const targetEmail = email || submitter_email;

        if (!targetEmail) {
            return res.status(400).json({ error: 'Submitter email is required' });
        }

        if (!targetEmail.endsWith('@dot.gov')) {
            return res.status(400).json({ error: 'Submitter email must belong to @dot.gov domain' });
        }

        const result = await db.query(
            `INSERT INTO submitters (email, name, title, description, priority, system_affected)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, id AS submission_id, email, name, title, description, priority, system_affected`,
            [targetEmail, name || submitter_name || 'Edward Kegan', title || '', description || '', priority || 'HIGH', system_affected || 'marad_ccb_db']
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/submitters/:submission_id
exports.getSubmissionById = async (req, res) => {
    const { submission_id } = req.params;
    try {
        const result = await db.query(
            'SELECT id, id AS submission_id, email, name, title, description, priority, system_affected FROM submitters WHERE id = $1',
            [submission_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/submitters/:submission_id
exports.updateSubmission = async (req, res) => {
    const { submission_id } = req.params;
    const { title, description } = req.body;
    try {
        const result = await db.query(
            `UPDATE submitters
             SET title = COALESCE($1, title),
                 description = COALESCE($2, description),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING id, *`,
            [title, description, submission_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/submitters/:submission_id
exports.deleteSubmission = async (req, res) => {
    const { submission_id } = req.params;
    try {
        const result = await db.query('DELETE FROM submitters WHERE id = $1 RETURNING id', [submission_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};
