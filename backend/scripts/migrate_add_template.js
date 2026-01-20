
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function migrate() {
    console.log('🔌 Connecting to database...');
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔄 Adding invoice_template column...');
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS invoice_template VARCHAR(50) DEFAULT 'classic';
        `);
        console.log('✅ Migration successful: invoice_template column added.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
