import { Router } from 'express';
import {
    createPedsVaccination,
    deletePedsVaccination,
    getPedsVaccinationById,
    getPedsVaccinations,
    updatePedsVaccination,
} from '../controllers/pediatrics-vaccination.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createPedsVaccinationSchema, updatePedsVaccinationSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getPedsVaccinations);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createPedsVaccinationSchema),
    createPedsVaccination
);
router.get('/:id', getPedsVaccinationById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updatePedsVaccinationSchema),
    updatePedsVaccination
);
router.delete('/:id', authorize('ADMIN'), deletePedsVaccination);

export default router;
