import { Router } from 'express';
import {
    createInvoice,
    deleteInvoice,
    getInvoiceById,
    getInvoices,
    updateInvoice,
} from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createInvoiceSchema, updateInvoiceSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.post('/', authorize('ADMIN', 'RECEPTIONIST'), validate(createInvoiceSchema), createInvoice);
router.get('/:id', getInvoiceById);
router.put('/:id', authorize('ADMIN', 'RECEPTIONIST'), validate(updateInvoiceSchema), updateInvoice);
router.delete('/:id', authorize('ADMIN'), deleteInvoice);

export default router;
