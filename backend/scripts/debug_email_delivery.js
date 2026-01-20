
import { Resend } from 'resend';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;

async function debugEmail() {
    console.log('🔍 Debugging Email Delivery...');

    // 1. Get latest user
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    let userEmail;
    try {
        const res = await pool.query('SELECT email, name, created_at FROM users ORDER BY created_at DESC LIMIT 1');
        if (res.rows.length === 0) {
            console.log('❌ No users found in database.');
            await pool.end();
            return;
        }
        userEmail = res.rows[0].email;
        console.log(`👤 Latest User: ${res.rows[0].name} (${userEmail})`);
        console.log(`🕒 Registered at: ${res.rows[0].created_at}`);
    } catch (error) {
        console.error('❌ DB Error:', error);
        await pool.end();
        return;
    }
    await pool.end();

    // 2. Try sending email to this user
    console.log(`\n📧 Attempting to send test email to: ${userEmail}`);
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [userEmail],
            subject: 'Debug Test Email',
            html: 'If you see this, email delivery is working for this address!'
        });

        if (error) {
            console.error('❌ RESEND API ERROR:', error);
            if (error.message.includes('test mode') || error.name === 'validation_error') {
                console.log('\n⚠️  ROOT CAUSE FOUND:');
                console.log('You are in Resend "Test Mode". You can ONLY send emails to your own account email.');
                console.log(`The email "${userEmail}" is NOT verified in your Resend dashboard.`);
            }
        } else {
            console.log('✅ Email Sent Successfully to user!');
            console.log('ID:', data.id);
            console.log('👉 Please check your SPAM folder.');
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

debugEmail();
