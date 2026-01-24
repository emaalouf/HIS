import { Prisma } from '@prisma/client';
import prisma from '../config/database';

export class DialysisFlowsheetService {
    async list(options: {
        page: number;
        limit: number;
        sessionId?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            sessionId,
            search,
            startDate,
            endDate,
            sortBy = 'recordedAt',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.DialysisFlowsheetEntryWhereInput = {};

        if (sessionId) where.sessionId = sessionId;

        if (startDate || endDate) {
            where.recordedAt = {};
            if (startDate) where.recordedAt.gte = new Date(startDate);
            if (endDate) where.recordedAt.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { sessionId: { contains: search } },
                { notes: { contains: search, mode: 'insensitive' } },
                { alarms: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [entries, total] = await Promise.all([
            prisma.dialysisFlowsheetEntry.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
            }),
            prisma.dialysisFlowsheetEntry.count({ where }),
        ]);

        return { entries, total };
    }

    async findById(id: string) {
        return prisma.dialysisFlowsheetEntry.findUnique({
            where: { id },
        });
    }

    async create(data: {
        sessionId: string;
        recordedAt: string;
        bpSystolic?: number;
        bpDiastolic?: number;
        heartRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        ultrafiltrationVolume?: number;
        arterialPressure?: number;
        venousPressure?: number;
        transmembranePressure?: number;
        alarms?: string | null;
        notes?: string | null;
    }) {
        return prisma.dialysisFlowsheetEntry.create({
            data: {
                sessionId: data.sessionId,
                recordedAt: new Date(data.recordedAt),
                bpSystolic: data.bpSystolic,
                bpDiastolic: data.bpDiastolic,
                heartRate: data.heartRate,
                temperature: data.temperature,
                oxygenSaturation: data.oxygenSaturation,
                bloodFlowRate: data.bloodFlowRate,
                dialysateFlowRate: data.dialysateFlowRate,
                ultrafiltrationVolume: data.ultrafiltrationVolume,
                arterialPressure: data.arterialPressure,
                venousPressure: data.venousPressure,
                transmembranePressure: data.transmembranePressure,
                alarms: data.alarms ?? undefined,
                notes: data.notes ?? undefined,
            },
        });
    }

    async update(id: string, data: {
        sessionId?: string;
        recordedAt?: string;
        bpSystolic?: number;
        bpDiastolic?: number;
        heartRate?: number;
        temperature?: number;
        oxygenSaturation?: number;
        bloodFlowRate?: number;
        dialysateFlowRate?: number;
        ultrafiltrationVolume?: number;
        arterialPressure?: number;
        venousPressure?: number;
        transmembranePressure?: number;
        alarms?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.DialysisFlowsheetEntryUpdateInput = {
            sessionId: data.sessionId,
            bpSystolic: data.bpSystolic,
            bpDiastolic: data.bpDiastolic,
            heartRate: data.heartRate,
            temperature: data.temperature,
            oxygenSaturation: data.oxygenSaturation,
            bloodFlowRate: data.bloodFlowRate,
            dialysateFlowRate: data.dialysateFlowRate,
            ultrafiltrationVolume: data.ultrafiltrationVolume,
            arterialPressure: data.arterialPressure,
            venousPressure: data.venousPressure,
            transmembranePressure: data.transmembranePressure,
            alarms: data.alarms ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.recordedAt) {
            updateData.recordedAt = new Date(data.recordedAt);
        }

        return prisma.dialysisFlowsheetEntry.update({
            where: { id },
            data: updateData,
        });
    }

    async delete(id: string) {
        return prisma.dialysisFlowsheetEntry.delete({
            where: { id },
        });
    }
}

export const dialysisFlowsheetService = new DialysisFlowsheetService();
