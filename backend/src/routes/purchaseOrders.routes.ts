import { Router } from 'express';
import { PurchaseOrderController } from '../controllers/purchaseOrder.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const purchaseOrderController = new PurchaseOrderController();

// Get all purchase orders
router.get('/', authenticate, purchaseOrderController.getAllPurchaseOrders);

// Get purchase order stats
router.get('/stats', authenticate, purchaseOrderController.getPurchaseOrderStats);

// Get purchase order by ID
router.get('/:id', authenticate, purchaseOrderController.getPurchaseOrderById);

// Create new purchase order
router.post('/', authenticate, purchaseOrderController.createPurchaseOrder);

// Update purchase order
router.patch('/:id', authenticate, purchaseOrderController.updatePurchaseOrder);

// Approve purchase order
router.post('/:id/approve', authenticate, purchaseOrderController.approvePurchaseOrder);

// Send purchase order to supplier
router.post('/:id/send', authenticate, purchaseOrderController.sendToSupplier);

// Receive purchase order items
router.post('/:id/receive', authenticate, purchaseOrderController.receivePurchaseOrder);

// Cancel purchase order
router.post('/:id/cancel', authenticate, purchaseOrderController.cancelPurchaseOrder);

// Close purchase order
router.post('/:id/close', authenticate, purchaseOrderController.closePurchaseOrder);

export default router;
