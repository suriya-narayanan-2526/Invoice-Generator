import { validationResult } from 'express-validator';
import { getWrappedDb } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get current user profile
export async function getProfile(req, res, next) {
    try {
        const db = await getWrappedDb();
        const user = await db.get(
            `SELECT id, email, name, business_name, address, city, state, pincode,
              gstin, pan, logo_url, currency, invoice_prefix, terms_conditions,
              email_verified, onboarding_completed, invoice_template,
              bank_name, account_name, account_number, ifsc_code, payment_method, default_notes
       FROM users WHERE id = $1`,
            [req.user.userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
}

// Update profile
export async function updateProfile(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            name, business_name, address, city, state, pincode, gstin, pan,
            invoice_prefix, terms_conditions, invoice_template,
            bank_name, account_name, account_number, ifsc_code, payment_method, default_notes
        } = req.body;

        const db = await getWrappedDb();

        await db.run(
            `UPDATE users SET
        name = COALESCE($1, name),
        business_name = COALESCE($2, business_name),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        pincode = COALESCE($6, pincode),
        gstin = COALESCE($7, gstin),
        pan = COALESCE($8, pan),
        invoice_prefix = COALESCE($9, invoice_prefix),
        terms_conditions = COALESCE($10, terms_conditions),
        invoice_template = COALESCE($11, invoice_template),
        bank_name = COALESCE($12, bank_name),
        account_name = COALESCE($13, account_name),
        account_number = COALESCE($14, account_number),
        ifsc_code = COALESCE($15, ifsc_code),
        payment_method = COALESCE($16, payment_method),
        default_notes = COALESCE($17, default_notes),
        updated_at = NOW()
       WHERE id = $18`,
            [
                name, business_name, address, city, state, pincode, gstin, pan,
                invoice_prefix, terms_conditions, invoice_template,
                bank_name, account_name, account_number, ifsc_code, payment_method, default_notes,
                req.user.userId
            ]
        );

        const user = await db.get(
            `SELECT id, email, name, business_name, address, city, state, pincode,
              gstin, pan, logo_url, currency, invoice_prefix, terms_conditions, invoice_template,
              bank_name, account_name, account_number, ifsc_code, payment_method, default_notes
       FROM users WHERE id = $1`,
            [req.user.userId]
        );

        res.json(user);
    } catch (error) {
        next(error);
    }
}



// Complete onboarding
export async function completeOnboarding(req, res, next) {
    try {
        const { business_name, address, state } = req.body;

        if (!business_name || !address || !state) {
            return res.status(400).json({ error: 'Business name, address, and state are required' });
        }

        const db = await getWrappedDb();

        await db.run(
            `UPDATE users SET
        business_name = $1,
        address = $2,
        state = $3,
        onboarding_completed = true,
        updated_at = NOW()
       WHERE id = $4`,
            [business_name, address, state, req.user.userId]
        );

        res.json({ message: 'Onboarding completed successfully' });
    } catch (error) {
        next(error);
    }
}

// Upload logo
export async function uploadLogo(req, res, next) {
    try {
        if (!req.files || !req.files.logo) {
            return res.status(400).json({ error: 'No logo file uploaded' });
        }

        const logo = req.files.logo;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(logo.mimetype)) {
            return res.status(400).json({ error: 'Only JPG and PNG files are allowed' });
        }

        // Validate file size (max 2MB)
        if (logo.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size must be less than 2MB' });
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const ext = path.extname(logo.name);
        const filename = `logo-${req.user.userId}-${Date.now()}${ext}`;
        const filepath = path.join(uploadsDir, filename);

        // Save file
        await logo.mv(filepath);

        // Update user
        const logoUrl = `/uploads/${filename}`;
        const db = await getWrappedDb();
        await db.run(
            'UPDATE users SET logo_url = $1, updated_at = NOW() WHERE id = $2',
            [logoUrl, req.user.userId]
        );

        res.json({ logoUrl, message: 'Logo uploaded successfully' });
    } catch (error) {
        next(error);
    }
}
