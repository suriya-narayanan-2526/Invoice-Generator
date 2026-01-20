import initSqlJs from 'sql.js';
import fs from 'fs';

(async () => {
    try {
        const SQL = await initSqlJs();
        const dbPath = './database/invoice.db';
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        console.log('\n=== Latest Password Reset Tokens ===');
        const tokens = db.exec(`
      SELECT user_id, token, expires_at, created_at 
      FROM password_reset_tokens 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

        if (tokens[0] && tokens[0].values.length > 0) {
            tokens[0].values.forEach((row, i) => {
                console.log(`\nToken ${i + 1}:`);
                console.log('  User ID:', row[0]);
                console.log('  Token:', row[1]);
                console.log('  Expires:', row[2]);
                console.log('  Reset URL: http://localhost:5173/reset-password?token=' + row[1]);
            });
        } else {
            console.log('No reset tokens found yet.');
            console.log('\nTo create one:');
            console.log('1. Go to http://localhost:5173/forgot-password');
            console.log('2. Enter: demo@invoice.com');
            console.log('3. Click "Send Reset Link"');
            console.log('4. Run this script again to see the token');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
})();
