import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getWrappedDb } from '../config/database.js';
import { calculateGST } from '../services/gstService.js';
import { generateInvoicePDF, generatePDFBuffer } from '../services/pdfService.js';
import { sendInvoiceEmail } from '../services/emailService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all invoices for user
export async function getInvoices(req, res, next) {
    try {
        const { status, clientId, search, page = 1, limit = 20 } = req.query;
        const db = await getWrappedDb();

        let query = `
      SELECT i.*, c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.user_id = $1
    `;
        const params = [req.user.userId];
        let paramIndex = 2;

        if (status) {
            query += ` AND i.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (clientId) {
            query += ` AND i.client_id = $${paramIndex}`;
            params.push(clientId);
            paramIndex++;
        }

        if (search) {
            query += ` AND (i.invoice_number ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex + 1})`;
            params.push(`%${search}%`, `%${search}%`);
            paramIndex += 2;
        }

        query += ` ORDER BY i.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        const invoices = await db.all(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM invoices WHERE user_id = $1';
        const countParams = [req.user.userId];
        let countParamIndex = 2;

        if (status) {
            countQuery += ` AND status = $${countParamIndex}`;
            countParams.push(status);
        }

        const countResult = await db.get(countQuery, countParams);
        const total = parseInt(countResult.total);

        res.json({
            invoices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
}

// Get single invoice with items
export async function getInvoice(req, res, next) {
    try {
        const db = await getWrappedDb();
        const invoice = await db.get(
            `SELECT i.*, c.name as client_name, c.email as client_email,
              c.address as client_address, c.city as client_city,
              c.state as client_state, c.pincode as client_pincode,
              c.gstin as client_gstin
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       WHERE i.id = $1 AND i.user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Get items
        const items = await db.all('SELECT * FROM invoice_items WHERE invoice_id = $1', [invoice.id]);

        res.json({ ...invoice, items });
    } catch (error) {
        next(error);
    }
}

// Create invoice
export async function createInvoice(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { clientId, invoiceDate, dueDate, items, notes, terms_conditions, signature_url } = req.body;
        const db = await getWrappedDb();

        console.log('Received items:', items);
        console.log('Items type:', typeof items);
        console.log('Is array?:', Array.isArray(items));

        // Validate items is an array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items must be a non-empty array' });
        }

        // Get user and client
        const user = await db.get('SELECT state, business_name FROM users WHERE id = $1', [req.user.userId]);
        const client = await db.get('SELECT state FROM clients WHERE id = $1', [clientId]);

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        // Calculate GST
        const gst = calculateGST(items, user.state, client.state);
        const subtotal = gst.subtotal;
        const total = gst.total;

        // Create invoice
        const invoiceId = uuidv4();

        // Generate invoice number (format: INV-YYYYMMDD-XXXX)
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

        // Get ALL invoice numbers for this user and find the max trailing number
        const allInvoices = await db.all(
            `SELECT invoice_number FROM invoices WHERE user_id = $1`,
            [req.user.userId]
        );

        let maxNumber = 0;
        for (const inv of allInvoices) {
            if (inv.invoice_number) {
                const match = inv.invoice_number.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            }
        }

        const nextNumber = maxNumber + 1;
        const invoiceNumber = `INV-${dateStr}-${String(nextNumber).padStart(4, '0')}`;

        await db.run(
            `INSERT INTO invoices (id, user_id, client_id, invoice_number, invoice_date, due_date, status,
                             subtotal, cgst, sgst, igst, total, notes, terms_conditions, signature_url)
       VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, $9, $10, $11, $12, $13, $14)`,
            [invoiceId, req.user.userId, clientId, invoiceNumber, invoiceDate, dueDate, subtotal,
                gst.cgst, gst.sgst, gst.igst, total, notes || null, terms_conditions || null, signature_url || null]
        );

        // Create invoice items
        for (const item of items) {
            const itemId = uuidv4();
            const amount = parseFloat(item.quantity) * parseFloat(item.rate);
            await db.run(
                `INSERT INTO invoice_items (id, invoice_id, name, description, quantity, rate, amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [itemId, invoiceId, item.name || item.description, item.description || '', item.quantity, item.rate, amount]
            );
        }

        const invoice = await db.get('SELECT * FROM invoices WHERE id = $1', [invoiceId]);
        res.status(201).json(invoice);
    } catch (error) {
        next(error);
    }
}

// Get dashboard statistics
export async function getStats(req, res, next) {
    try {
        const db = await getWrappedDb();

        // Total invoices
        const totalResult = await db.get(
            'SELECT COUNT(*) as count FROM invoices WHERE user_id = $1',
            [req.user.userId]
        );

        // This month's invoices
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthResult = await db.get(
            'SELECT COUNT(*) as count FROM invoices WHERE user_id = $1 AND created_at >= $2',
            [req.user.userId, startOfMonth]
        );

        // Total revenue
        const revenueResult = await db.get(
            'SELECT SUM(total) as total FROM invoices WHERE user_id = $1 AND status != \'cancelled\'',
            [req.user.userId]
        );

        // Total clients
        const clientResult = await db.get(
            'SELECT COUNT(*) as count FROM clients WHERE user_id = $1',
            [req.user.userId]
        );

        // Get subscription
        const subscription = await db.get(
            `SELECT plan_type, created_at FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );

        const planType = (subscription?.plan_type || 'free').toLowerCase();
        let remainingInvoices = 'unlimited';
        let remainingClients = 'unlimited';

        // Count invoices since plan started for 'extra 10' logic
        const planStartDate = subscription?.created_at || '1970-01-01';
        const invoicesSinceStart = await db.get(
            'SELECT COUNT(*) as count FROM invoices WHERE user_id = $1 AND created_at >= $2',
            [req.user.userId, planStartDate]
        );
        const clientsSinceStart = await db.get(
            'SELECT COUNT(*) as count FROM clients WHERE user_id = $1 AND created_at >= $2',
            [req.user.userId, planStartDate]
        );

        if (planType === 'free') {
            remainingInvoices = Math.max(0, 5 - parseInt(totalResult.count));
            remainingClients = Math.max(0, 1 - parseInt(clientResult.count));
        } else if (planType === 'pro') {
            remainingInvoices = Math.max(0, 10 - parseInt(invoicesSinceStart.count));
            remainingClients = Math.max(0, 5 - parseInt(clientsSinceStart.count));
        }

        res.json({
            totalInvoices: parseInt(totalResult.count),
            monthInvoices: parseInt(monthResult.count),
            totalClients: parseInt(clientResult.count),
            totalRevenue: parseFloat(revenueResult.total) || 0,
            remainingInvoices,
            remainingClients,
            planType
        });
    } catch (error) {
        next(error);
    }
}

// Finalize invoice
export async function finalizeInvoice(req, res, next) {
    try {
        const db = await getWrappedDb();
        const invoice = await db.get(
            'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.userId]
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'draft') {
            return res.status(400).json({ error: 'Only draft invoices can be finalized' });
        }

        // Generate invoice number using MAX of all existing numbers
        const prefix = await db.get('SELECT invoice_prefix FROM users WHERE id = $1', [req.user.userId]);
        const invoicePrefix = prefix?.invoice_prefix || 'INV-';

        // Get ALL invoice numbers for this user and find the max trailing number
        const allInvoices = await db.all(
            `SELECT invoice_number FROM invoices WHERE user_id = $1 AND invoice_number IS NOT NULL`,
            [req.user.userId]
        );

        let maxNumber = 0;
        for (const inv of allInvoices) {
            if (inv.invoice_number) {
                const match = inv.invoice_number.match(/(\d+)$/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            }
        }

        const nextNumber = maxNumber + 1;
        const invoiceNumber = `${invoicePrefix}${String(nextNumber).padStart(4, '0')}`;

        await db.run(
            'UPDATE invoices SET invoice_number = $1, status = \'finalized\', updated_at = NOW() WHERE id = $2',
            [invoiceNumber, req.params.id]
        );

        const updated = await db.get('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
        res.json(updated);
    } catch (error) {
        next(error);
    }
}

// Update invoice
export async function updateInvoice(req, res, next) {
    try {
        const db = await getWrappedDb();
        const invoice = await db.get(
            'SELECT status FROM invoices WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.userId]
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        if (invoice.status !== 'draft') {
            return res.status(400).json({ error: 'Only draft invoices can be updated' });
        }

        const { clientId, invoiceDate, dueDate, items, notes, terms_conditions } = req.body;

        // Get user and client
        const user = await db.get('SELECT state FROM users WHERE id = $1', [req.user.userId]);
        const client = await db.get('SELECT state FROM clients WHERE id = $1', [clientId]);

        // Calculate totals
        let subtotal = 0;
        items.forEach(item => {
            subtotal += parseFloat(item.quantity) * parseFloat(item.rate);
        });

        const gst = calculateGST(subtotal, user.state, client.state);
        const total = subtotal + gst.cgst + gst.sgst + gst.igst;

        // Update invoice
        await db.run(
            `UPDATE invoices SET
        client_id = $1, invoice_date = $2, due_date = $3,
        subtotal = $4, cgst = $5, sgst = $6, igst = $7, total = $8,
        notes = $9, terms_conditions = $10, updated_at = NOW()
       WHERE id = $11`,
            [clientId, invoiceDate, dueDate, subtotal, gst.cgst, gst.sgst, gst.igst, total,
                notes || null, terms_conditions || null, req.params.id]
        );

        // Delete old items
        await db.run('DELETE FROM invoice_items WHERE invoice_id = $1', [req.params.id]);

        // Create new items
        for (const item of items) {
            const itemId = uuidv4();
            const amount = parseFloat(item.quantity) * parseFloat(item.rate);
            await db.run(
                `INSERT INTO invoice_items (id, invoice_id, name, description, quantity, rate, amount)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [itemId, req.params.id, item.name || item.description, item.description || '', item.quantity, item.rate, amount]
            );
        }

        const updated = await db.get('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
        res.json(updated);
    } catch (error) {
        next(error);
    }
}

// Delete invoice
export async function deleteInvoice(req, res, next) {
    try {
        const db = await getWrappedDb();
        const result = await db.run(
            'DELETE FROM invoices WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        next(error);
    }
}

// Generate PDF
export async function generatePDF(req, res, next) {
    try {
        const db = await getWrappedDb();

        // Get invoice with all details
        const invoice = await db.get(
            `SELECT i.*, c.name as client_name, c.email as client_email,
              c.address as client_address, c.city as client_city,
              c.state as client_state, c.pincode as client_pincode,
              c.gstin as client_gstin,
              u.business_name, u.address as user_address, u.city as user_city,
              u.state as user_state, u.pincode as user_pincode, u.gstin as user_gstin,
              u.logo_url
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1 AND i.user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Get items
        const items = await db.all('SELECT * FROM invoice_items WHERE invoice_id = $1', [invoice.id]);
        console.log('Fetched items from DB:', items);
        console.log('Invoice ID used:', invoice.id);

        // Get client data for PDF
        const client = await db.get('SELECT * FROM clients WHERE id = $1', [invoice.client_id]);

        // Get user/business data for PDF
        const user = await db.get('SELECT * FROM users WHERE id = $1', [req.user.userId]);

        // Get subscription for watermark
        const subscription = await db.get(
            `SELECT plan_type FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );

        const showWatermark = subscription?.plan_type === 'free';

        // Helper to read file as base64
        let logoBase64 = null;
        if (user.logo_url) {
            try {
                // Remove /uploads/ prefix to get filename
                const filename = user.logo_url.replace('/uploads/', '');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const filepath = path.join(uploadsDir, filename);

                if (fs.existsSync(filepath)) {
                    const bitmap = fs.readFileSync(filepath);
                    const ext = path.extname(filename).substring(1).toUpperCase(); // PNG or JPG
                    logoBase64 = `data:image/${ext === 'JPG' ? 'JPEG' : ext};base64,${bitmap.toString('base64')}`;
                    user.logo_url = logoBase64; // Override with base64 for PDF
                }
            } catch (err) {
                console.error('Error reading logo file:', err);
            }
        }

        // Convert signature to base64 if exists
        let signatureBase64 = null;
        if (invoice.signature_url) {
            try {
                const filename = invoice.signature_url.replace('/uploads/', '');
                const uploadsDir = path.join(__dirname, '../../uploads');
                const filepath = path.join(uploadsDir, filename);

                if (fs.existsSync(filepath)) {
                    const bitmap = fs.readFileSync(filepath);
                    const ext = path.extname(filename).substring(1).toUpperCase();
                    signatureBase64 = `data:image/${ext === 'JPG' ? 'JPEG' : ext};base64,${bitmap.toString('base64')}`;
                }
            } catch (err) {
                console.error('Error reading signature file:', err);
            }
        }

        // Generate PDF buffer with correct parameter order: (invoiceData, businessData, clientData, isPaidPlan)
        const invoiceWithItems = { ...invoice, items, signature_url: signatureBase64 };
        console.log('Items for PDF:', items);
        console.log('Invoice with items:', JSON.stringify(invoiceWithItems, null, 2));
        const pdfBuffer = generatePDFBuffer(invoiceWithItems, user, client, !showWatermark);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number || invoice.id}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('PDF Generation Error:', error);
        console.error('Error stack:', error.stack);
        next(error);
    }
}

// Email invoice
export async function emailInvoice(req, res, next) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Client email required' });
        }

        const db = await getWrappedDb();

        // Get invoice
        const invoice = await db.get(
            `SELECT i.*, c.name as client_name, u.business_name
       FROM invoices i
       LEFT JOIN clients c ON i.client_id = c.id
       LEFT JOIN users u ON i.user_id = u.id
       WHERE i.id = $1 AND i.user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (!invoice) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        // Get items
        const items = await db.all('SELECT * FROM invoice_items WHERE invoice_id = $1', [invoice.id]);

        // Generate PDF
        const pdfBuffer = await generateInvoicePDF({ ...invoice, items }, false);

        // Send email
        await sendInvoiceEmail(email, {
            invoiceNumber: invoice.invoice_number,
            clientName: invoice.client_name,
            businessName: invoice.business_name,
            total: invoice.total,
            dueDate: invoice.due_date
        }, pdfBuffer);

        res.json({ message: 'Invoice sent successfully' });
    } catch (error) {
        next(error);
    }
}
