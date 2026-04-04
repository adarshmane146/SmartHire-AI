import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('m:/hfuyfiugk/database/nodejs_finaledit/.env') });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'ats_portal'
});

async function updateSchema() {
    try {
        console.log('Connecting to DB...');
        await pool.query('ALTER TABLE resumes ADD COLUMN IF NOT EXISTS live_matches_found INTEGER DEFAULT 0;');
        await pool.query('ALTER TABLE resumes ADD COLUMN IF NOT EXISTS local_matches_found INTEGER DEFAULT 0;');
        console.log('Schema updated successfully');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await pool.end();
    }
}

updateSchema();
