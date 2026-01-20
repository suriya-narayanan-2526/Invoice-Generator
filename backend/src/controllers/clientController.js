import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { getWrappedDb } from '../config/database.js';

// Get all clients for user
export async function getClients(req, res, next) {
    try {
        const db = await getWrappedDb();
        const clients = await db.all(
            `SELECT * FROM clients 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
            [req.user.userId]
        );

        res.json(clients);
    } catch (error) {
        next(error);
    }
}

// Get single client
export async function getClient(req, res, next) {
    try {
        const db = await getWrappedDb();
        const client = await db.get(
            `SELECT * FROM clients WHERE id = $1 AND user_id = $2`,
            [req.params.id, req.user.userId]
        );

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        next(error);
    }
}

// Create client
export async function createClient(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, address, city, state, pincode, gstin } = req.body;

        const clientId = uuidv4();
        const db = await getWrappedDb();

        await db.run(
            `INSERT INTO clients (id, user_id, name, email, phone, address, city, state, pincode, gstin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [clientId, req.user.userId, name, email || null, phone || null, address || null,
                city || null, state || null, pincode || null, gstin || null]
        );

        const client = await db.get('SELECT * FROM clients WHERE id = $1', [clientId]);
        res.status(201).json(client);
    } catch (error) {
        next(error);
    }
}

// Update client
export async function updateClient(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, address, city, state, pincode, gstin } = req.body;

        const db = await getWrappedDb();
        const result = await db.run(
            `UPDATE clients SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        pincode = COALESCE($7, pincode),
        gstin = COALESCE($8, gstin),
        updated_at = NOW()
       WHERE id = $9 AND user_id = $10`,
            [name, email, phone, address, city, state, pincode, gstin, req.params.id, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const client = await db.get('SELECT * FROM clients WHERE id = $1', [req.params.id]);
        res.json(client);
    } catch (error) {
        next(error);
    }
}

// Delete client
export async function deleteClient(req, res, next) {
    try {
        const db = await getWrappedDb();
        const result = await db.run(
            'DELETE FROM clients WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        next(error);
    }
}
