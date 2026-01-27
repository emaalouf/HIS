import { Router } from 'express';
import {
    createGastroLiverFunction,
    deleteGastroLiverFunction,
    getGastroLiverFunctionById,
    getGastroLiverFunctions,
    updateGastroLiverFunction,
} from '../controllers/gastro-liver-function.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGastroLiverFunctionSchema, updateGastroLiverFunctionSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getGastroLiverFunctions);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createGastroLiverFunctionSchema),
    createGastroLiverFunction
);
router.get('/:id', getGastroLiverFunctionById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateGastroLiverFunctionSchema),
    updateGastroLiverFunction
);
router.delete('/:id', authorize('ADMIN'), deleteGastroLiverFunction);

export default router;
