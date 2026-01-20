// Vercel Serverless Entry Point
import dotenv from 'dotenv';
dotenv.config();

import app from '../src/app.js';

// Initialize database connection on cold start
import { initDatabase } from '../src/config/database.js';

let dbInitialized = false;

// Initialize database once
(async () => {
    if (!dbInitialized) {
        try {
            await initDatabase();
            dbInitialized = true;
            console.log('✅ Database initialized for serverless');
        } catch (error) {
            console.error('❌ Database initialization error:', error);
        }
    }
})();

// Export the Express app directly for Vercel
export default app;
