
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testEmail() {
    console.log('📧 Testing Resend API...');

    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is missing in .env');
        return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get email from command line or use test address
    const targetEmail = process.argv[2] || 'delivered@resend.dev';
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    try {
        console.log(`Sending test email to "${targetEmail}"...`);
        console.log(`From: ${fromEmail}`);

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [targetEmail],
            subject: 'Invoice Generator Test Email',
            html: '<strong>It works!</strong> Email service is configured correctly with your verified domain.'
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Email Sent Successfully!');
            console.log('ID:', data.id);
            console.log(`\n📬 Check your inbox at: ${targetEmail}`);
        }
    } catch (error) {
        console.error('❌ Unexpected Error:', error);
    }
}

testEmail();
