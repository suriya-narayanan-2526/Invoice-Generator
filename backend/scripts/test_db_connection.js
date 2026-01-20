
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function testConnection() {
    console.log('🔌 Testing connection using .env configuration...');
    // Log masked URL for debugging 
    const dbUrl = process.env.DATABASE_URL || '';
    const parts = dbUrl.split('@');
    console.log('Target Host:', parts[1] || 'INVALID URL FORMAT');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        const res = await pool.query('SELECT NOW() as now');
        console.log('✅ Connection Successful! DB Time:', res.rows[0].now);
    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await pool.end();
    }
}

testConnection();
