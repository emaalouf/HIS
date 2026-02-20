import { Router } from 'express';
import {
    createBed,
    deleteBed,
    getBedById,
    getBeds,
    updateBed,
} from '../controllers/bed.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createBedSchema, updateBedSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getBeds);
router.post('/', authorize('ADMIN'), validate(createBedSchema), createBed);
router.get('/:id', getBedById);
router.put('/:id', authorize('ADMIN'), validate(updateBedSchema), updateBed);
router.delete('/:id', authorize('ADMIN'), deleteBed);

export default router;
