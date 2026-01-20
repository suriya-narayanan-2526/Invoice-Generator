import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWrappedDb } from '../src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUserStatus() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address');
        process.exit(1);
    }

    console.log(`\n🔍 Checking status for user: ${email}`);

    try {
        const db = await getWrappedDb();

        // 1. Find User
        const user = await db.get('SELECT id, email, name, email_verified, created_at FROM users WHERE email = $1', [email]);

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('✅ User Found:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Verified: ${user.email_verified}`);
        console.log(`   Created At: ${user.created_at}`);

        // 2. Check Tokens
        const tokens = await db.all('SELECT token, expires_at FROM email_verification_tokens WHERE user_id = $1', [user.id]);

        if (tokens.length === 0) {
            console.log('\n⚠️ No pending verification tokens found for this user.');
        } else {
            console.log(`\n🎫 Found ${tokens.length} pending tokens:`);
            tokens.forEach(t => {
                const expired = new Date(t.expires_at) < new Date();
                console.log(`   Token: ${t.token}`);
                console.log(`   Expires: ${t.expires_at} ${expired ? '(EXPIRED ❌)' : '(VALID ✅)'}`);
            });
        }

        // 3. Check Subscriptions
        const subs = await db.all('SELECT plan_type, status FROM subscriptions WHERE user_id = $1', [user.id]);
        console.log('\n💳 Subscriptions:');
        subs.forEach(s => {
            console.log(`   Plan: ${s.plan_type}, Status: ${s.status}`);
        });

    } catch (error) {
        console.error('❌ Error checking status:', error);
    }
}

checkUserStatus();
