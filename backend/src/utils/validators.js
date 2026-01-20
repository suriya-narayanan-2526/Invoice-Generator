import { body, param, query } from 'express-validator';

// Email validation
export const validateEmail = body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address');

// Password validation
export const validatePassword = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number');

// Name validation
export const validateName = body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters');

// GSTIN validation (optional)
export const validateGSTIN = body('gstin')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .withMessage('Invalid GSTIN format');

// UUID validation
export const validateUUID = param('id')
    .isUUID()
    .withMessage('Invalid ID format');

// Invoice validation
export const validateInvoice = [
    body('clientId').isUUID().withMessage('Invalid client ID'),
    body('invoiceDate').isISO8601().withMessage('Invalid invoice date'),
    body('dueDate').isISO8601().withMessage('Invalid due date'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.description').trim().notEmpty().withMessage('Item description is required'),
    body('items.*.quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be greater than 0'),
    body('items.*.rate').isFloat({ min: 0.01 }).withMessage('Rate must be greater than 0'),
];

// Client validation
export const validateClient = [
    body('name').trim().notEmpty().withMessage('Client name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('state').trim().notEmpty().withMessage('State is required for GST calculation'),
];
