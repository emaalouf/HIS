import { Router } from 'express';
import {
    createNeurologyCognitive,
    deleteNeurologyCognitive,
    getNeurologyCognitiveById,
    getNeurologyCognitives,
    updateNeurologyCognitive,
} from '../controllers/neurology-cognitive.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createNeurologyCognitiveSchema, updateNeurologyCognitiveSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getNeurologyCognitives);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createNeurologyCognitiveSchema),
    createNeurologyCognitive
);
router.get('/:id', getNeurologyCognitiveById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateNeurologyCognitiveSchema),
    updateNeurologyCognitive
);
router.delete('/:id', authorize('ADMIN'), deleteNeurologyCognitive);

export default router;
