const db = require('../config/db');

// POST /api/v1/users - Add User
exports.createUser = async (req, res) => {
    const { user_name, user_email_address, role } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO users (user_name, user_email_address, role)
       VALUES ($1, $2, $3)
       RETURNING user_id, user_name, user_email_address, role, is_active, created_at, updated_at`,
            [user_name, user_email_address, role || 'Submitter']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ detail: 'User email address already registered' });
        }
        res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/users/:user_id - Fetch User
exports.getUserById = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/users/:user_id - Edit User
exports.updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { user_name, role, is_active } = req.body;
    try {
        const result = await db.query(
            `UPDATE users
       SET user_name = COALESCE($1, user_name),
           role = COALESCE($2, role),
           is_active = COALESCE($3, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING *`,
            [user_name, role, is_active, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/users/:user_id - Soft Delete / Deactivate User
exports.deleteUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await db.query(
            `UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING user_id`,
            [user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ detail: error.message });
    }
};