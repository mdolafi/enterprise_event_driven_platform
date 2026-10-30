const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'marad_ccb_postgres',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'ccb_admin',
        password: process.env.DB_PASSWORD || 'ccb_password123',
        database: process.env.DB_NAME || 'marad_ccb_db',
      }
);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
