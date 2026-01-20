// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file from backend root directory
dotenv.config({ path: join(__dirname, '../.env') });

console.log('Environment loaded - PAYMENT_MODE:', process.env.PAYMENT_MODE);

import app from './app.js';
import { initDatabase } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Initialize database and start server
(async () => {
    try {
        await initDatabase();
        console.log('✅ Database initialized');

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`\n🚀 Invoice Generator API Server`);
            console.log(`📍 Running on: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📧 Email mode: ${process.env.EMAIL_MODE || 'console'}`);
            console.log(`💳 Payment mode: ${process.env.PAYMENT_MODE || 'mock'}`);
            console.log(`\n✨ Server is ready!\n`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\n⚠️  SIGINT received, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
})();
