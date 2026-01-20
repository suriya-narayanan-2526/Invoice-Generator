// Vercel Serverless Entry Point
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

import app from './app.js';
import { initDatabase } from './config/database.js';

// Initialize database connection
let dbInitialized = false;

async function ensureDbInitialized() {
    if (!dbInitialized) {
        await initDatabase();
        dbInitialized = true;
        console.log('✅ Database initialized for serverless');
    }
}

// Export the Express app for Vercel
export default async function handler(req, res) {
    try {
        await ensureDbInitialized();
        return app(req, res);
    } catch (error) {
        console.error('❌ Serverless function error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
