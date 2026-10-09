const { Pool } = require('pg');
const path = require('path');

// Load .env from root voter_service/ directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
    console.log('Connected to PostgreSQL database (Voter Service)');
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};