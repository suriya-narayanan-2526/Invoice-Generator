// Add signature_url column to invoices table
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function addSignatureColumn() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/invoice_app'
    });

    try {
        console.log('Adding signature_url column to invoices...');
        await pool.query(`
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS signature_url VARCHAR(500);
        `);
        console.log('✅ Column added successfully!');
    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await pool.end();
    }
}

addSignatureColumn();
