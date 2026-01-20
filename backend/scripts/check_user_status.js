
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function checkUserStatus() {
    const userEmail = 'suriyanarayanan2526@gmail.com';
    console.log(`🔍 Checking status for: ${userEmail}`);

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const res = await pool.query('SELECT id, email, email_verified, created_at FROM users WHERE email = $1', [userEmail]);
        if (res.rows.length === 0) {
            console.log('❌ User not found.');
        } else {
            console.log('User Found:', res.rows[0]);

            // Check for token
            const tokenRes = await pool.query('SELECT * FROM email_verification_tokens WHERE user_id = $1', [res.rows[0].id]);
            if (tokenRes.rows.length > 0) {
                console.log('✅ Verification Token Exists!');
                console.log('Token:', tokenRes.rows[0].token);
            } else {
                console.log('❌ NO Verification Token found!');
            }
        }
    } catch (error) {
        console.error('❌ DB Error:', error);
    } finally {
        await pool.end();
    }
}

checkUserStatus();
