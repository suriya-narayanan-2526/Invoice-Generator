import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { checkPlanLimits } from '../middlewares/planEnforcement.js';
import { validateInvoice } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', invoiceController.getStats);

// Get all invoices
router.get('/', invoiceController.getInvoices);

// Get single invoice
router.get('/:id', invoiceController.getInvoice);

// Create invoice (check plan limits)
router.post('/', checkPlanLimits, validateInvoice, invoiceController.createInvoice);

// Update invoice
router.put('/:id', invoiceController.updateInvoice);

// Finalize invoice
router.post('/:id/finalize', invoiceController.finalizeInvoice);

// Delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

// Generate PDF
router.get('/:id/pdf', checkPlanLimits, invoiceController.generatePDF);

// Email invoice
router.post('/:id/email', invoiceController.emailInvoice);

export default router;
