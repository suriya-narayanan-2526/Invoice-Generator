import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import { getWrappedDb } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Register new user
export async function register(req, res, next) {
    try {
        console.log('📝 Registration attempt:', req.body.email);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ Validation errors:', errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name } = req.body;
        const db = await getWrappedDb();

        console.log('🔍 Checking for existing user:', email);

        // Check if user already exists
        const existingUser = await db.get('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(409).json({ error: 'Email already registered' });
        }

        console.log('✅ User does not exist, hashing password...');

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const userId = uuidv4();
        console.log('🔄 Inserting user into database...');
        await db.run(
            `INSERT INTO users (id, email, password, name)
       VALUES ($1, $2, $3, $4)`,
            [userId, email, passwordHash, name]
        );
        console.log('✅ User created with ID:', userId);

        // Create free subscription
        const subscriptionId = uuidv4();
        console.log('🔄 Creating subscription for user...');
        await db.run(
            `INSERT INTO subscriptions (id, user_id, plan_type, status)
       VALUES ($1, $2, 'free', 'active')`,
            [subscriptionId, userId]
        );
        console.log('✅ Subscription created');

        // Generate verification token
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

        console.log('🔄 Creating verification token...');
        await db.run(
            `INSERT INTO email_verification_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
            [uuidv4(), userId, token, expiresAt]
        );
        console.log('✅ Token created');

        // Send verification email
        console.log('🔄 Sending verification email to:', email);
        await sendVerificationEmail(email, token);
        console.log('✅ Verification email sent');

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            userId
        });
    } catch (error) {
        console.error('❌ Detailed registration error:', error);
        // Include more error info if available
        if (error.code) console.error('   Error Code:', error.code);
        if (error.detail) console.error('   Error Detail:', error.detail);

        // Don't leak DB errors to frontend normally, but for now we might want to return something more useful
        res.status(500).json({ error: 'Registration failed. ' + (error.message || 'Please try again.') });
    }
}

// Verify email
export async function verifyEmail(req, res, next) {
    try {
        const { token } = req.query;
        console.log('🧪 Verification attempt with token:', token);

        if (!token) {
            console.log('❌ Token missing in request');
            return res.status(400).json({ error: 'Verification token required' });
        }

        const db = await getWrappedDb();

        // Find token
        const tokenRecord = await db.get(
            `SELECT user_id, expires_at FROM email_verification_tokens WHERE token = $1`,
            [token]
        );

        if (!tokenRecord) {
            console.log('❌ Token not found in database:', token);
            return res.status(400).json({ error: 'Invalid verification token' });
        }

        console.log('🔍 Found token record for user:', tokenRecord.user_id);
        console.log('📅 Token expires at:', tokenRecord.expires_at);

        // Check if expired
        if (new Date(tokenRecord.expires_at) < new Date()) {
            console.log('❌ Token expired');
            return res.status(400).json({ error: 'Verification token expired' });
        }

        // Update user
        console.log('🔄 Updating user status to verified...');
        await db.run('UPDATE users SET email_verified = true WHERE id = $1', [tokenRecord.user_id]);

        // Delete token
        console.log('🗑️ Deleting used verification token...');
        await db.run('DELETE FROM email_verification_tokens WHERE token = $1', [token]);

        console.log('✅ Email verified successfully for user:', tokenRecord.user_id);
        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('❌ Verification controller error:', error);
        next(error);
    }
}

// Login
export async function login(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const db = await getWrappedDb();

        // Find user
        const user = await db.get(
            `SELECT id, email, password, name, email_verified, onboarding_completed
       FROM users WHERE email = $1`,
            [email]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if verified
        if (!user.email_verified) {
            return res.status(403).json({ error: 'Please verify your email before logging in' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get subscription
        const subscription = await db.get(
            `SELECT plan_type FROM subscriptions 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [user.id]
        );

        // Generate JWT
        const token = generateToken({
            userId: user.id,
            email: user.email,
            plan: subscription?.plan_type || 'free'
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                onboardingCompleted: Boolean(user.onboarding_completed),
                plan: subscription?.plan_type || 'free'
            }
        });
    } catch (error) {
        next(error);
    }
}

// Forgot password
export async function forgotPassword(req, res, next) {
    try {
        const { email } = req.body;
        const db = await getWrappedDb();

        const user = await db.get('SELECT id FROM users WHERE email = $1', [email]);

        // Always return success to prevent email enumeration
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been sent.' });
        }

        // Generate reset token
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

        // Delete old tokens
        await db.run('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

        // Create new token
        await db.run(
            `INSERT INTO password_reset_tokens (id, user_id, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
            [uuidv4(), user.id, token, expiresAt]
        );

        await sendPasswordResetEmail(email, token);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        next(error);
    }
}

// Reset password
export async function resetPassword(req, res, next) {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and password required' });
        }

        const db = await getWrappedDb();

        // Find token
        const tokenRecord = await db.get(
            `SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1`,
            [token]
        );

        if (!tokenRecord) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }

        // Check if expired
        if (new Date(tokenRecord.expires_at) < new Date()) {
            return res.status(400).json({ error: 'Reset token expired' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update password
        await db.run('UPDATE users SET password = $1 WHERE id = $2', [passwordHash, tokenRecord.user_id]);

        // Delete token
        await db.run('DELETE FROM password_reset_tokens WHERE token = $1', [token]);

        res.json({ message: 'Password reset successful! You can now log in.' });
    } catch (error) {
        next(error);
    }
}
