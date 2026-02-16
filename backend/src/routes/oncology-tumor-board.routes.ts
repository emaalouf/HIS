import { Router } from 'express';
import {
    createOncologyTumorBoard,
    deleteOncologyTumorBoard,
    getOncologyTumorBoardById,
    getOncologyTumorBoards,
    updateOncologyTumorBoard,
} from '../controllers/oncology-tumor-board.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOncologyTumorBoardSchema, updateOncologyTumorBoardSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getOncologyTumorBoards);
router.post(
    '/',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(createOncologyTumorBoardSchema),
    createOncologyTumorBoard
);
router.get('/:id', getOncologyTumorBoardById);
router.put(
    '/:id',
    authorize('ADMIN', 'DOCTOR', 'NURSE'),
    validate(updateOncologyTumorBoardSchema),
    updateOncologyTumorBoard
);
router.delete('/:id', authorize('ADMIN'), deleteOncologyTumorBoard);

export default router;
