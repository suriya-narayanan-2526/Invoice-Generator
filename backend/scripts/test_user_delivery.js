
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testUserDelivery() {
    const targetEmail = 'suriyaqwertyuio73@gmail.com';
    console.log(`📧 Testing direct delivery to: ${targetEmail}`);

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        // Try sending with NO custom name, just the raw email
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: [targetEmail],
            subject: 'Final Test from Invoice App',
            html: '<p>If you get this, the configuration is working!</p>'
        });

        if (error) {
            console.error('❌ FAILED:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ SUCCESS! Email ID:', data.id);
        }
    } catch (err) {
        console.error('❌ EXCEPTION:', err);
    }
}

testUserDelivery();
