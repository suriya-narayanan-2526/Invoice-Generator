
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting migration: Add Payment Details to Users table...');

        // Add columns if they don't exist
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS account_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS account_number VARCHAR(100),
            ADD COLUMN IF NOT EXISTS ifsc_code VARCHAR(50),
            ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) DEFAULT 'Bank Transfer',
            ADD COLUMN IF NOT EXISTS default_notes TEXT;
        `);

        console.log('✅ Migration successful: Added payment columns to users table.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
