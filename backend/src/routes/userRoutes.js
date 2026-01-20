import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get profile
router.get('/me', userController.getProfile);

// Update profile
router.put('/profile', userController.updateProfile);

// Complete onboarding
router.post('/onboarding', userController.completeOnboarding);

// Upload logo
router.post('/upload-logo', userController.uploadLogo);

export default router;
