import { Router } from 'express';
import {
    createCardiologyElectrophysiology,
    deleteCardiologyElectrophysiology,
    getCardiologyElectrophysiologyById,
    getCardiologyElectrophysiologyStudies,
    updateCardiologyElectrophysiology,
} from '../controllers/cardiology-electrophysiology.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyElectrophysiologySchema, updateCardiologyElectrophysiologySchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyElectrophysiologyStudies);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyElectrophysiologySchema),
    createCardiologyElectrophysiology
);
router.get('/:id', getCardiologyElectrophysiologyById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyElectrophysiologySchema),
    updateCardiologyElectrophysiology
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyElectrophysiology);

export default router;
