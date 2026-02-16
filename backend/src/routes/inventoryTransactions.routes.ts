import { Router } from 'express';
import { InventoryTransactionController } from '../controllers/inventoryTransaction.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const inventoryTransactionController = new InventoryTransactionController();

// Get all transactions
router.get('/', authenticate, inventoryTransactionController.getAllTransactions);

// Get transaction stats
router.get('/stats', authenticate, inventoryTransactionController.getTransactionStats);

// Get transaction by ID
router.get('/:id', authenticate, inventoryTransactionController.getTransactionById);

// Create new transaction
router.post('/', authenticate, inventoryTransactionController.createTransaction);

// Transfer stock between locations
router.post('/transfer', authenticate, inventoryTransactionController.transferStock);

// Adjust stock
router.post('/adjust', authenticate, inventoryTransactionController.adjustStock);

export default router;
