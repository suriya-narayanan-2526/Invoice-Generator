
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
        console.log('🔄 Increasing numeric precision for invoices table...');

        // Update invoices table
        await pool.query(`
            ALTER TABLE invoices 
            ALTER COLUMN subtotal TYPE DECIMAL(20, 2),
            ALTER COLUMN cgst TYPE DECIMAL(20, 2),
            ALTER COLUMN sgst TYPE DECIMAL(20, 2),
            ALTER COLUMN igst TYPE DECIMAL(20, 2),
            ALTER COLUMN total TYPE DECIMAL(20, 2);
        `);

        console.log('🔄 Increasing numeric precision for invoice_items table...');

        // Update invoice_items table
        await pool.query(`
            ALTER TABLE invoice_items 
            ALTER COLUMN quantity TYPE DECIMAL(20, 2),
            ALTER COLUMN rate TYPE DECIMAL(20, 2),
            ALTER COLUMN amount TYPE DECIMAL(20, 2);
        `);

        console.log('✅ Migration successful: Numeric columns updated to DECIMAL(20, 2).');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
