const db = require('../config/db');

const ALLOWED_ROLES = ['ADMIN', 'SUBMITTER', 'INVESTIGATOR', 'DECISION_MAKER', 'VOTER', 'Submitter'];

// POST /api/v1/users
exports.createUser = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ error: 'Request body is required' });
        }

        const name = req.body.name || req.body.user_name || (req.body.first_name ? `${req.body.first_name} ${req.body.last_name || ''}`.trim() : null);
        const email = req.body.email || req.body.user_email_address;
        const role = req.body.role || 'Submitter';

        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required fields' });
        }

        if (!email.endsWith('@dot.gov')) {
            return res.status(400).json({ error: 'User email must belong to @dot.gov domain' });
        }

        const result = await db.query(
            `INSERT INTO users (user_name, user_email_address, role) VALUES ($1, $2, $3) RETURNING user_id AS id, user_id, user_name AS name, user_name, user_email_address AS email, user_email_address, role, is_active, created_at, updated_at`,
            [name, email, role]
        );

        return res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ detail: 'User email address already registered' });
        }
        return res.status(500).json({ detail: error.message });
    }
};

// GET /api/v1/users/:user_id
exports.getUserById = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await db.query(
            'SELECT user_id AS id, user_id, user_name AS name, user_name, user_email_address AS email, user_email_address, role, is_active, created_at, updated_at FROM users WHERE user_id = $1',
            [user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// PUT /api/v1/users/:user_id
exports.updateUser = async (req, res) => {
    const { user_id } = req.params;
    const { user_name, name, role, is_active } = req.body;

    if (role && !ALLOWED_ROLES.includes(role)) {
        return res.status(403).json({ error: 'Unauthorized role update' });
    }

    const targetName = user_name || name;

    try {
        const result = await db.query(
            `UPDATE users SET user_name = COALESCE($1, user_name), role = COALESCE($2, role), is_active = COALESCE($3, is_active), updated_at = CURRENT_TIMESTAMP WHERE user_id = $4 RETURNING user_id AS id, user_id, user_name AS name, user_name, user_email_address AS email, user_email_address, role, is_active, updated_at`,
            [targetName, role, is_active, user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};

// DELETE /api/v1/users/:user_id
exports.deleteUser = async (req, res) => {
    const { user_id } = req.params;
    try {
        const result = await db.query(
            'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING user_id',
            [user_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ detail: 'User profile not found' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ detail: error.message });
    }
};
