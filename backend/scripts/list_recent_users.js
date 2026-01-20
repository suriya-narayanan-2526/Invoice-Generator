import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWrappedDb } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkRecentUsers() {
    console.log(`\n🔍 Checking recent users in PostgreSQL...`);

    try {
        const db = await getWrappedDb();

        const users = await db.all('SELECT id, email, name, email_verified, created_at FROM users ORDER BY created_at DESC LIMIT 5');

        if (users.length === 0) {
            console.log('⚠️ No users found in the database.');
            return;
        }

        console.log(`✅ Found ${users.length} recent users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (ID: ${u.id}, Verified: ${u.email_verified}, Created: ${u.created_at})`);

            // For each user, check tokens
            // (We'll do this in a separate query to keep it clean)
        });

    } catch (error) {
        console.error('❌ Error checking users:', error);
    }
}

checkRecentUsers();
