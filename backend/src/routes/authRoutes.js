import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateEmail, validatePassword, validateName } from '../utils/validators.js';

const router = express.Router();

// Register
router.post('/register',
    authLimiter,
    validateEmail,
    validatePassword,
    validateName,
    authController.register
);

// Verify email
router.get('/verify-email', authController.verifyEmail);

// Login
router.post('/login',
    authLimiter,
    validateEmail,
    body('password').notEmpty().withMessage('Password is required'),
    authController.login
);

// Forgot password
router.post('/forgot-password',
    authLimiter,
    validateEmail,
    authController.forgotPassword
);

// Reset password
router.post('/reset-password',
    authLimiter,
    body('token').notEmpty().withMessage('Token is required'),
    validatePassword,
    authController.resetPassword
);

export default router;
