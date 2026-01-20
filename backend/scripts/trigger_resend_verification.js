
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars FIRST
dotenv.config({ path: path.join(__dirname, '../.env') });

async function triggerResend() {
    // Dynamic import after env vars are loaded
    const { sendVerificationEmail } = await import('../src/services/emailService.js');

    const email = 'suriyanarayanan2526@gmail.com';
    const token = '5da7795a-4485-4f46-9d46-79a96355b04f';

    console.log(`📧 Re-sending Verification Email to ${email}...`);
    try {
        const result = await sendVerificationEmail(email, token);
        console.log('✅ Result:', result);
    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

triggerResend();
