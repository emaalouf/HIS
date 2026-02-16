import { Router } from 'express';
import { RequisitionController } from '../controllers/requisition.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const requisitionController = new RequisitionController();

// Get all requisitions
router.get('/', authenticate, requisitionController.getAllRequisitions);

// Get requisition stats
router.get('/stats', authenticate, requisitionController.getRequisitionStats);

// Get requisition by ID
router.get('/:id', authenticate, requisitionController.getRequisitionById);

// Create new requisition
router.post('/', authenticate, requisitionController.createRequisition);

// Update requisition
router.patch('/:id', authenticate, requisitionController.updateRequisition);

// Submit requisition for approval
router.post('/:id/submit', authenticate, requisitionController.submitRequisition);

// Approve requisition
router.post('/:id/approve', authenticate, requisitionController.approveRequisition);

// Reject requisition
router.post('/:id/reject', authenticate, requisitionController.rejectRequisition);

// Fulfill requisition
router.post('/:id/fulfill', authenticate, requisitionController.fulfillRequisition);

// Cancel requisition
router.post('/:id/cancel', authenticate, requisitionController.cancelRequisition);

export default router;
