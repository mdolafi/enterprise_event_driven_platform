const db = require('../config/db');

// POST /api/v1/attachments
exports.createAttachment = async (req, res) => {
    const { proposal_id, file_name, file_path } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO attachments (proposal_id, file_name, file_path)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [proposal_id, file_name, file_path]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/attachments/:attachment_id
exports.getAttachmentById = async (req, res) => {
    const { attachment_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM attachments WHERE attachment_id = $1', [attachment_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Attachment not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/attachments/:attachment_id
exports.updateAttachment = async (req, res) => {
    const { attachment_id } = req.params;
    const { file_name, file_path } = req.body;
    try {
        const result = await db.query(
            `UPDATE attachments
       SET file_name = COALESCE($1, file_name),
           file_path = COALESCE($2, file_path),
           updated_at = CURRENT_TIMESTAMP
       WHERE attachment_id = $3
       RETURNING *`,
            [file_name, file_path, attachment_id]
        );
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Attachment not found' });
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/attachments/:attachment_id
exports.deleteAttachment = async (req, res) => {
    const { attachment_id } = req.params;
    try {
        const result = await db.query('DELETE FROM attachments WHERE attachment_id = $1 RETURNING attachment_id', [attachment_id]);
        if (result.rows.length === 0) return res.status(404).json({ detail: 'Attachment not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};