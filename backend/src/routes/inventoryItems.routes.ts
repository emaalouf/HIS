import { Router } from 'express';
import { InventoryItemController } from '../controllers/inventoryItem.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const inventoryItemController = new InventoryItemController();

// Get all inventory items
router.get('/', authenticate, inventoryItemController.getAllItems);

// Get inventory stats
router.get('/stats', authenticate, inventoryItemController.getInventoryStats);

// Get items needing reorder
router.get('/reorder-needed', authenticate, inventoryItemController.getItemsNeedingReorder);

// Get item by SKU
router.get('/sku/:sku', authenticate, inventoryItemController.getItemBySku);

// Get item by ID
router.get('/:id', authenticate, inventoryItemController.getItemById);

// Create new item
router.post('/', authenticate, inventoryItemController.createItem);

// Update item
router.patch('/:id', authenticate, inventoryItemController.updateItem);

// Delete item
router.delete('/:id', authenticate, inventoryItemController.deleteItem);

export default router;
