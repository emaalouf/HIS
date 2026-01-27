import { Prisma } from '@prisma/client';
import prisma from '../config/database';

const gastroLiverFunctionInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
        },
    },
};

export class GastroLiverFunctionService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        patientId?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            patientId,
            startDate,
            endDate,
            sortBy = 'testDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.GastroLiverFunctionWhereInput = {};

        if (patientId) where.patientId = patientId;

        if (startDate || endDate) {
            where.testDate = {};
            if (startDate) where.testDate.gte = new Date(startDate);
            if (endDate) where.testDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { diagnosis: { contains: search } },
                { interpretation: { contains: search } },
                { notes: { contains: search } },
            ];
        }

        const [results, total] = await Promise.all([
            prisma.gastroLiverFunction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: gastroLiverFunctionInclude,
            }),
            prisma.gastroLiverFunction.count({ where }),
        ]);

        return { results, total };
    }

    async findById(id: string) {
        return prisma.gastroLiverFunction.findUnique({
            where: { id },
            include: gastroLiverFunctionInclude,
        });
    }

    async create(data: {
        patientId: string;
        testDate: string;
        alt?: number | null;
        ast?: number | null;
        alp?: number | null;
        ggt?: number | null;
        totalBilirubin?: number | null;
        directBilirubin?: number | null;
        indirectBilirubin?: number | null;
        totalProtein?: number | null;
        albumin?: number | null;
        globulin?: number | null;
        agRatio?: number | null;
        pt?: number | null;
        inr?: number | null;
        ptt?: number | null;
        fibroscanScore?: number | null;
        fibrosisStage?: string | null;
        steatosisGrade?: string | null;
        capScore?: number | null;
        diagnosis?: string | null;
        interpretation?: string | null;
        notes?: string | null;
    }) {
        return prisma.gastroLiverFunction.create({
            data: {
                patientId: data.patientId,
                testDate: new Date(data.testDate),
                alt: data.alt ?? undefined,
                ast: data.ast ?? undefined,
                alp: data.alp ?? undefined,
                ggt: data.ggt ?? undefined,
                totalBilirubin: data.totalBilirubin ?? undefined,
                directBilirubin: data.directBilirubin ?? undefined,
                indirectBilirubin: data.indirectBilirubin ?? undefined,
                totalProtein: data.totalProtein ?? undefined,
                albumin: data.albumin ?? undefined,
                globulin: data.globulin ?? undefined,
                agRatio: data.agRatio ?? undefined,
                pt: data.pt ?? undefined,
                inr: data.inr ?? undefined,
                ptt: data.ptt ?? undefined,
                fibroscanScore: data.fibroscanScore ?? undefined,
                fibrosisStage: data.fibrosisStage ?? undefined,
                steatosisGrade: data.steatosisGrade ?? undefined,
                capScore: data.capScore ?? undefined,
                diagnosis: data.diagnosis ?? undefined,
                interpretation: data.interpretation ?? undefined,
                notes: data.notes ?? undefined,
            },
            include: gastroLiverFunctionInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        testDate?: string;
        alt?: number | null;
        ast?: number | null;
        alp?: number | null;
        ggt?: number | null;
        totalBilirubin?: number | null;
        directBilirubin?: number | null;
        indirectBilirubin?: number | null;
        totalProtein?: number | null;
        albumin?: number | null;
        globulin?: number | null;
        agRatio?: number | null;
        pt?: number | null;
        inr?: number | null;
        ptt?: number | null;
        fibroscanScore?: number | null;
        fibrosisStage?: string | null;
        steatosisGrade?: string | null;
        capScore?: number | null;
        diagnosis?: string | null;
        interpretation?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.GastroLiverFunctionUncheckedUpdateInput = {
            patientId: data.patientId,
            alt: data.alt ?? undefined,
            ast: data.ast ?? undefined,
            alp: data.alp ?? undefined,
            ggt: data.ggt ?? undefined,
            totalBilirubin: data.totalBilirubin ?? undefined,
            directBilirubin: data.directBilirubin ?? undefined,
            indirectBilirubin: data.indirectBilirubin ?? undefined,
            totalProtein: data.totalProtein ?? undefined,
            albumin: data.albumin ?? undefined,
            globulin: data.globulin ?? undefined,
            agRatio: data.agRatio ?? undefined,
            pt: data.pt ?? undefined,
            inr: data.inr ?? undefined,
            ptt: data.ptt ?? undefined,
            fibroscanScore: data.fibroscanScore ?? undefined,
            fibrosisStage: data.fibrosisStage ?? undefined,
            steatosisGrade: data.steatosisGrade ?? undefined,
            capScore: data.capScore ?? undefined,
            diagnosis: data.diagnosis ?? undefined,
            interpretation: data.interpretation ?? undefined,
            notes: data.notes ?? undefined,
        };

        if (data.testDate) {
            updateData.testDate = new Date(data.testDate);
        }

        return prisma.gastroLiverFunction.update({
            where: { id },
            data: updateData,
            include: gastroLiverFunctionInclude,
        });
    }

    async delete(id: string) {
        return prisma.gastroLiverFunction.delete({
            where: { id },
        });
    }
}

export const gastroLiverFunctionService = new GastroLiverFunctionService();
