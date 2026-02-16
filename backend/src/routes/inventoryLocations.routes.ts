import { Router } from 'express';
import { InventoryLocationController } from '../controllers/inventoryLocation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const inventoryLocationController = new InventoryLocationController();

// Get all locations
router.get('/', authenticate, inventoryLocationController.getAllLocations);

// Get locations tree structure
router.get('/tree', authenticate, inventoryLocationController.getAllLocationsTree);

// Get location stats
router.get('/stats', authenticate, inventoryLocationController.getLocationStats);

// Get location by code
router.get('/code/:code', authenticate, inventoryLocationController.getLocationByCode);

// Get location by ID
router.get('/:id', authenticate, inventoryLocationController.getLocationById);

// Create new location
router.post('/', authenticate, inventoryLocationController.createLocation);

// Update location
router.patch('/:id', authenticate, inventoryLocationController.updateLocation);

// Delete location
router.delete('/:id', authenticate, inventoryLocationController.deleteLocation);

export default router;
