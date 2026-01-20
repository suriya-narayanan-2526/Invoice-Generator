// Quick script to verify email in Supabase
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: 'postgresql://postgres:Suriya@2526@db.cazmhywurqrsrjwxccqb.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
});

const email = process.argv[2];

if (!email) {
    console.log('Usage: node verify-email.js YOUR_EMAIL');
    process.exit(1);
}

async function verifyEmail() {
    try {
        const result = await pool.query(
            'UPDATE users SET email_verified = true, onboarding_completed = true WHERE email = $1 RETURNING email',
            [email]
        );

        if (result.rows.length > 0) {
            console.log('✅ Email verified successfully for:', result.rows[0].email);
            console.log('✅ Onboarding marked as completed');
            console.log('You can now login and access the dashboard!');
        } else {
            console.log('❌ No user found with email:', email);
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

verifyEmail();
