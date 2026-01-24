import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/helpers';

export class AppError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('Error:', err);

    if (err instanceof AppError) {
        sendError(res, err.message, err.statusCode);
        return;
    }

    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        sendError(res, 'Database operation failed', 400);
        return;
    }

    // Default error
    sendError(res, 'Internal server error', 500);
};

export const notFound = (req: Request, res: Response): void => {
    sendError(res, `Route ${req.originalUrl} not found`, 404);
};
