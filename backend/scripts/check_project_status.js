
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkProject() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;

    console.log(`Checking URL: ${url}`);

    try {
        const response = await fetch(`${url}/rest/v1/`, {
            method: 'GET',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`
            }
        });

        console.log(`Status Code: ${response.status}`);
        if (response.ok) {
            console.log('✅ Project REST API is ACTIVE and reachable!');
            const json = await response.json();
            console.log('Response:', JSON.stringify(json).substring(0, 100) + '...');
        } else {
            console.log('❌ Project reachable but returned error:', response.statusText);
        }
    } catch (error) {
        console.error('❌ Network Error (Unreachable):', error.message);
    }
}

checkProject();
