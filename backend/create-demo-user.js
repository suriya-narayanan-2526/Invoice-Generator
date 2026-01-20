import initSqlJs from 'sql.js';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

(async () => {
    try {
        const SQL = await initSqlJs();
        const dbPath = './database/invoice.db';
        const buffer = fs.readFileSync(dbPath);
        const db = new SQL.Database(buffer);

        // Create a test user with known credentials
        const email = 'demo@invoice.com';
        const password = 'Demo@123456';
        const name = 'Demo User';

        // Check if user exists
        const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`);

        if (existing[0] && existing[0].values.length > 0) {
            console.log('Updating existing demo user...');
            const userId = existing[0].values[0][0];

            // Hash new password
            const passwordHash = await bcrypt.hash(password, 10);

            // Update user with onboarding completed
            db.run(`
        UPDATE users SET 
          password_hash = '${passwordHash}',
          is_verified = 1,
          onboarding_completed = 1,
          business_name = 'Demo Business',
          address = '123 Demo Street',
          city = 'Mumbai',
          state = 'Maharashtra',
          pincode = '400001',
          invoice_prefix = 'INV-'
        WHERE id = '${userId}'
      `);
        } else {
            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);
            const userId = uuidv4();
            const subscriptionId = uuidv4();

            // Create user with onboarding completed
            db.run(`
        INSERT INTO users (
          id, email, password_hash, name, is_verified, onboarding_completed,
          business_name, address, city, state, pincode, invoice_prefix
        )
        VALUES (
          '${userId}', '${email}', '${passwordHash}', '${name}', 1, 1,
          'Demo Business', '123 Demo Street', 'Mumbai', 'Maharashtra', '400001', 'INV-'
        )
      `);

            // Create free subscription
            db.run(`
        INSERT INTO subscriptions (id, user_id, plan_type, status)
        VALUES ('${subscriptionId}', '${userId}', 'free', 'active')
      `);
        }

        // Save database
        const data = db.export();
        fs.writeFileSync(dbPath, Buffer.from(data));

        console.log('\n✅ Demo account ready!');
        console.log('\n📧 Login Credentials:');
        console.log('   Email: demo@invoice.com');
        console.log('   Password: Demo@123456');
        console.log('\n🌐 Go to: http://localhost:5173/login');
        console.log('   You will be redirected to the Dashboard after login\n');

    } catch (error) {
        console.error('Error:', error.message);
    }
})();
