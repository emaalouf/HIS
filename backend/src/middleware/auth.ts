import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import config from '../config';
import { JWTPayload } from '../types';
import { sendError } from '../utils/helpers';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            sendError(res, 'Access token required', 401);
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
        req.user = decoded;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            sendError(res, 'Token expired', 401);
            return;
        }
        sendError(res, 'Invalid token', 401);
    }
};

export const authorize = (...allowedRoles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendError(res, 'Authentication required', 401);
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            sendError(res, 'Insufficient permissions', 403);
            return;
        }

        next();
    };
};
