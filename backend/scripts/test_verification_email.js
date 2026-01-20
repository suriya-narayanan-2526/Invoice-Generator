import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendVerificationEmail } from '../src/services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testVerificationEmail() {
    console.log('\n=== Email Configuration Diagnostics ===');
    console.log('EMAIL_MODE:', process.env.EMAIL_MODE);
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set (starts with: ' + process.env.RESEND_API_KEY.substring(0, 10) + '...)' : 'NOT SET');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('=======================================\n');

    const testEmail = process.argv[2] || 'suriyaqwertyuio73@gmail.com';
    const testToken = 'test-token-' + Date.now();

    console.log(`📧 Sending verification email to: ${testEmail}`);
    console.log(`🔑 Using token: ${testToken}\n`);

    try {
        const result = await sendVerificationEmail(testEmail, testToken);
        console.log('✅ Verification email sent successfully!');
        console.log('Result:', result);
    } catch (error) {
        console.error('❌ Error sending verification email:', error);
        console.error('Error details:', error.message);
        console.error('Stack:', error.stack);
    }
}

testVerificationEmail();
