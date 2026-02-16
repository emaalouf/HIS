import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const supplierController = new SupplierController();

// Get all suppliers
router.get('/', authenticate, supplierController.getAllSuppliers);

// Get supplier stats
router.get('/stats', authenticate, supplierController.getSupplierStats);

// Get suppliers for an item
router.get('/item/:itemId', authenticate, supplierController.getSuppliersForItem);

// Get supplier by code
router.get('/code/:code', authenticate, supplierController.getSupplierByCode);

// Get supplier by ID
router.get('/:id', authenticate, supplierController.getSupplierById);

// Create new supplier
router.post('/', authenticate, supplierController.createSupplier);

// Update supplier
router.patch('/:id', authenticate, supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', authenticate, supplierController.deleteSupplier);

// Add item to supplier
router.post('/items', authenticate, supplierController.addSupplierItem);

// Update supplier item
router.patch('/items/:id', authenticate, supplierController.updateSupplierItem);

// Remove item from supplier
router.delete('/items/:id', authenticate, supplierController.removeSupplierItem);

export default router;
