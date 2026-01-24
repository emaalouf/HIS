import { Request, Response } from 'express';
import { patientService } from '../services/patient.service';
import { sendSuccess, sendError, sendPaginated } from '../utils/helpers';
import { CreatePatientInput, UpdatePatientInput, CreateMedicalHistoryInput } from '../utils/validators';

export const createPatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body as CreatePatientInput;
        const patient = await patientService.create(data);
        sendSuccess(res, patient, 'Patient created successfully', 201);
    } catch (error) {
        console.error('Create patient error:', error);
        sendError(res, 'Failed to create patient', 500);
    }
};

export const getPatients = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string;
        const sortBy = req.query.sortBy as string;
        const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';
        const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

        const { patients, total } = await patientService.findAll({
            page,
            limit,
            search,
            sortBy,
            sortOrder,
            isActive,
        });

        sendPaginated(res, patients, { page, limit, total });
    } catch (error) {
        console.error('Get patients error:', error);
        sendError(res, 'Failed to fetch patients', 500);
    }
};

export const getPatientById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const patient = await patientService.findById(id);

        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        sendSuccess(res, patient);
    } catch (error) {
        console.error('Get patient error:', error);
        sendError(res, 'Failed to fetch patient', 500);
    }
};

export const updatePatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as UpdatePatientInput;

        // Check if patient exists
        const existing = await patientService.findById(id);
        if (!existing) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const patient = await patientService.update(id, data);
        sendSuccess(res, patient, 'Patient updated successfully');
    } catch (error) {
        console.error('Update patient error:', error);
        sendError(res, 'Failed to update patient', 500);
    }
};

export const deletePatient = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Check if patient exists
        const existing = await patientService.findById(id);
        if (!existing) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        await patientService.softDelete(id);
        sendSuccess(res, null, 'Patient deleted successfully');
    } catch (error) {
        console.error('Delete patient error:', error);
        sendError(res, 'Failed to delete patient', 500);
    }
};

export const getMedicalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Check if patient exists
        const patient = await patientService.findById(id);
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const history = await patientService.getMedicalHistory(id);
        sendSuccess(res, history);
    } catch (error) {
        console.error('Get medical history error:', error);
        sendError(res, 'Failed to fetch medical history', 500);
    }
};

export const addMedicalHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = req.body as CreateMedicalHistoryInput;

        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        // Check if patient exists
        const patient = await patientService.findById(id);
        if (!patient) {
            sendError(res, 'Patient not found', 404);
            return;
        }

        const history = await patientService.addMedicalHistory(id, req.user.userId, data);
        sendSuccess(res, history, 'Medical history added successfully', 201);
    } catch (error) {
        console.error('Add medical history error:', error);
        sendError(res, 'Failed to add medical history', 500);
    }
};

export const getPatientStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await patientService.getStats();
        sendSuccess(res, stats);
    } catch (error) {
        console.error('Get stats error:', error);
        sendError(res, 'Failed to fetch statistics', 500);
    }
};
