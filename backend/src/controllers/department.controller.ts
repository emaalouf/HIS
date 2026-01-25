import { Request, Response } from 'express';
import { departmentService } from '../services/department.service';
import { sendError, sendPaginated, sendSuccess } from '../utils/helpers';
import { CreateDepartmentInput, UpdateDepartmentInput } from '../utils/validators';

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string | undefined;
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
        const sortBy = req.query.sortBy as string | undefined;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

        const { departments, total } = await departmentService.list({
            page,
            limit,
            search,
            isActive,
            sortBy,
            sortOrder,
        });

        sendPaginated(res, departments, { page, limit, total });
    } catch (error) {
        console.error('Get departments error:', error);
        sendError(res, 'Failed to fetch departments', 500);
    }
};

export const getDepartmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const department = await departmentService.findById(id);

        if (!department) {
            sendError(res, 'Department not found', 404);
            return;
        }

        sendSuccess(res, department);
    } catch (error) {
        console.error('Get department error:', error);
        sendError(res, 'Failed to fetch department', 500);
    }
};

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreateDepartmentInput;

        const department = await departmentService.create(data);
        sendSuccess(res, department, 'Department created successfully', 201);
    } catch (error) {
        console.error('Create department error:', error);
        sendError(res, 'Failed to create department', 500);
    }
};

export const updateDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdateDepartmentInput;

        const existing = await departmentService.findById(id);
        if (!existing) {
            sendError(res, 'Department not found', 404);
            return;
        }

        const department = await departmentService.update(id, data);
        sendSuccess(res, department, 'Department updated successfully');
    } catch (error) {
        console.error('Update department error:', error);
        sendError(res, 'Failed to update department', 500);
    }
};

export const deleteDepartment = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        const existing = await departmentService.findById(id);
        if (!existing) {
            sendError(res, 'Department not found', 404);
            return;
        }

        await departmentService.delete(id);
        sendSuccess(res, null, 'Department deleted successfully');
    } catch (error) {
        console.error('Delete department error:', error);
        sendError(res, 'Failed to delete department', 500);
    }
};
