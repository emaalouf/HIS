import { Router } from 'express';
import {
    createEncounter,
    deleteEncounter,
    getEncounterById,
    getEncounters,
    updateEncounter,
} from '../controllers/encounter.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createEncounterSchema, updateEncounterSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getEncounters);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createEncounterSchema),
    createEncounter
);
router.get('/:id', getEncounterById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateEncounterSchema),
    updateEncounter
);
router.delete('/:id', authorize('ADMIN'), deleteEncounter);

export default router;
