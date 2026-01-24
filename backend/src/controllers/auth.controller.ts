import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import config from '../config';
import { sendSuccess, sendError } from '../utils/helpers';
import { RegisterInput, LoginInput } from '../utils/validators';
import { JWTPayload } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName, role } = req.body as RegisterInput;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            sendError(res, 'Email already registered', 400);
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                role: role || 'RECEPTIONIST',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        sendSuccess(res, user, 'User registered successfully', 201);
    } catch (error) {
        console.error('Register error:', error);
        sendError(res, 'Registration failed', 500);
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body as LoginInput;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            sendError(res, 'Invalid credentials', 401);
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            sendError(res, 'Account is disabled', 401);
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            sendError(res, 'Invalid credentials', 401);
            return;
        }

        // Create JWT payload
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        // Generate tokens
        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
        });

        const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
            expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'],
        });

        sendSuccess(res, {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
            accessToken,
            refreshToken,
        }, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        sendError(res, 'Login failed', 500);
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        if (!token) {
            sendError(res, 'Refresh token required', 400);
            return;
        }

        // Verify refresh token
        const decoded = jwt.verify(token, config.jwt.refreshSecret) as JWTPayload;

        // Check if user still exists and is active
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || !user.isActive) {
            sendError(res, 'User not found or inactive', 401);
            return;
        }

        // Generate new access token
        const payload: JWTPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
        });

        sendSuccess(res, { accessToken }, 'Token refreshed successfully');
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            sendError(res, 'Refresh token expired', 401);
            return;
        }
        sendError(res, 'Invalid refresh token', 401);
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            sendError(res, 'Not authenticated', 401);
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });

        if (!user) {
            sendError(res, 'User not found', 404);
            return;
        }

        sendSuccess(res, user);
    } catch (error) {
        console.error('Get me error:', error);
        sendError(res, 'Failed to get user info', 500);
    }
};
