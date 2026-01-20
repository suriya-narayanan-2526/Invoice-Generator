import express from 'express';
import * as subscriptionController from '../controllers/subscriptionController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create subscription
router.post('/create', subscriptionController.createSubscription);

// Get current subscription
router.get('/current', subscriptionController.getCurrentSubscription);

// Verify payment
router.post('/verify', subscriptionController.verifyPayment);

// Get subscription status
router.get('/status', subscriptionController.getSubscriptionStatus);

// Cancel subscription
router.post('/cancel', subscriptionController.cancelSubscription);

export default router;
