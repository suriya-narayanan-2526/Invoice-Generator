import express from 'express';
import * as clientController from '../controllers/clientController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateClient } from '../utils/validators.js';
import { checkPlanLimits } from '../middlewares/planEnforcement.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all clients
router.get('/', clientController.getClients);

// Get single client
router.get('/:id', clientController.getClient);

// Create client (check plan limits)
router.post('/', checkPlanLimits, validateClient, clientController.createClient);

// Update client
router.put('/:id', clientController.updateClient);

// Delete client
router.delete('/:id', clientController.deleteClient);

export default router;
