import { Router } from 'express';
import {
    createSpecialty,
    deleteSpecialty,
    getSpecialties,
    getSpecialtyById,
    updateSpecialty,
} from '../controllers/specialty.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createSpecialtySchema, updateSpecialtySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getSpecialties);
router.post('/', authorize('ADMIN'), validate(createSpecialtySchema), createSpecialty);
router.get('/:id', getSpecialtyById);
router.put('/:id', authorize('ADMIN'), validate(updateSpecialtySchema), updateSpecialty);
router.delete('/:id', authorize('ADMIN'), deleteSpecialty);

export default router;
