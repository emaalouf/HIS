import { Router } from 'express';
import {
    createWard,
    deleteWard,
    getWardById,
    getWards,
    updateWard,
} from '../controllers/ward.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createWardSchema, updateWardSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getWards);
router.post('/', authorize('ADMIN'), validate(createWardSchema), createWard);
router.get('/:id', getWardById);
router.put('/:id', authorize('ADMIN'), validate(updateWardSchema), updateWard);
router.delete('/:id', authorize('ADMIN'), deleteWard);

export default router;
