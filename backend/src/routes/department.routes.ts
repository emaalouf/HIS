import { Router } from 'express';
import {
    createDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartments,
    updateDepartment,
} from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import { createDepartmentSchema, updateDepartmentSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorize('ADMIN'), validate(createDepartmentSchema), createDepartment);
router.get('/:id', getDepartmentById);
router.put('/:id', authorize('ADMIN'), validate(updateDepartmentSchema), updateDepartment);
router.delete('/:id', authorize('ADMIN'), deleteDepartment);

export default router;
