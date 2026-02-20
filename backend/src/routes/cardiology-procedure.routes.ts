import { Router } from 'express';
import {
    createCardiologyProcedure,
    deleteCardiologyProcedure,
    getCardiologyProcedureById,
    getCardiologyProcedures,
    updateCardiologyProcedure,
} from '../controllers/cardiology-procedure.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createCardiologyProcedureSchema, updateCardiologyProcedureSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getCardiologyProcedures);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createCardiologyProcedureSchema),
    createCardiologyProcedure
);
router.get('/:id', getCardiologyProcedureById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateCardiologyProcedureSchema),
    updateCardiologyProcedure
);
router.delete('/:id', authorize('ADMIN'), deleteCardiologyProcedure);

export default router;
