// Run this script to add the name column to invoice_items
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function addNameColumn() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/invoice_app'
    });

    try {
        console.log('Adding name column to invoice_items...');
        await pool.query(`
            ALTER TABLE invoice_items 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255);
        `);
        console.log('✅ Column added successfully!');

        // Update existing records to use description as name if name is null
        await pool.query(`
            UPDATE invoice_items 
            SET name = description 
            WHERE name IS NULL;
        `);
        console.log('✅ Existing records updated!');
    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await pool.end();
    }
}

addNameColumn();
