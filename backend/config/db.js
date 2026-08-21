const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/anime_hub';

// Enable SSL if connecting to cloud database
const isProduction = process.env.NODE_ENV === 'production' || connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') || connectionString.includes('supabase.co');

const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
});

// Helper for database queries
const query = (text, params) => pool.query(text, params);

module.exports = {
    pool,
    query,
};
