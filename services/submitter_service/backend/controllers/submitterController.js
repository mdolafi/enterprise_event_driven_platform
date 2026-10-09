const db = require('../config/db');

// POST /api/v1/submitters
exports.createSubmission = async (req, res) => {
    const { submitter_name, title, description } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO submissions (submitter_name, title, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [submitter_name, title, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/submitters/:submission_id
exports.getSubmissionById = async (req, res) => {
    const { submission_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM submissions WHERE submission_id = $1', [submission_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/submitters/:submission_id
exports.updateSubmission = async (req, res) => {
    const { submission_id } = req.params;
    const { title, description } = req.body;
    try {
        const result = await db.query(
            `UPDATE submissions
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE submission_id = $3
       RETURNING *`,
            [title, description, submission_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/submitters/:submission_id
exports.deleteSubmission = async (req, res) => {
    const { submission_id } = req.params;
    try {
        const result = await db.query('DELETE FROM submissions WHERE submission_id = $1 RETURNING submission_id', [submission_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Submission not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};