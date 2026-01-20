import initSqlJs from 'sql.js';
import fs from 'fs';

(async () => {
    try {
        const SQL = await initSqlJs();
        const dbPath = './database/invoice.db';
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Get all users
        console.log('=== Current Users ===');
        const users = db.exec('SELECT id, email, is_verified FROM users');
        if (users[0]) {
            users[0].values.forEach(row => {
                console.log(`Email: ${row[1]}, Verified: ${row[2] === 1 ? 'YES' : 'NO'}`);
            });
        }

        // Verify all unverified users
        db.run('UPDATE users SET is_verified = 1 WHERE is_verified = 0');

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));

        console.log('\n✅ All users have been verified!');
        console.log('You can now login with your email and password.');

    } catch (error) {
        console.error('Error:', error.message);
    }
})();
