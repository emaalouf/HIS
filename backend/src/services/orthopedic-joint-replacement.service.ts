import { JointType, Prisma } from '@prisma/client';
import prisma from '../config/database';

const orthopedicJointReplacementInclude = {
    patient: {
        select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            phone: true,
        },
    },
    provider: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
        },
    },
};

export class OrthopedicJointReplacementService {
    async list(options: {
        page: number;
        limit: number;
        search?: string;
        jointType?: JointType;
        patientId?: string;
        providerId?: string;
        startDate?: string;
        endDate?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            page,
            limit,
            search,
            jointType,
            patientId,
            providerId,
            startDate,
            endDate,
            sortBy = 'surgeryDate',
            sortOrder = 'desc',
        } = options;
        const skip = (page - 1) * limit;

        const where: Prisma.OrthopedicJointReplacementWhereInput = {};

        if (jointType) where.jointType = jointType;
        if (patientId) where.patientId = patientId;
        if (providerId) where.providerId = providerId;

        if (startDate || endDate) {
            where.surgeryDate = {};
            if (startDate) where.surgeryDate.gte = new Date(startDate);
            if (endDate) where.surgeryDate.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { patient: { firstName: { contains: search } } },
                { patient: { lastName: { contains: search } } },
                { patient: { mrn: { contains: search } } },
                { provider: { firstName: { contains: search } } },
                { provider: { lastName: { contains: search } } },
                { implantManufacturer: { contains: search } },
                { implantModel: { contains: search } },
                { diagnosis: { contains: search } },
            ];
        }

        const [replacements, total] = await Promise.all([
            prisma.orthopedicJointReplacement.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: orthopedicJointReplacementInclude,
            }),
            prisma.orthopedicJointReplacement.count({ where }),
        ]);

        return { replacements, total };
    }

    async findById(id: string) {
        return prisma.orthopedicJointReplacement.findUnique({
            where: { id },
            include: orthopedicJointReplacementInclude,
        });
    }

    async create(data: {
        patientId: string;
        providerId: string;
        surgeryDate: string;
        jointType: JointType;
        side?: string | null;
        approach?: string | null;
        implantManufacturer?: string | null;
        implantModel?: string | null;
        implantSize?: string | null;
        bearingSurface?: string | null;
        fixation?: string | null;
        anesthesiaType?: string | null;
        tourniquetTime?: string | null;
        estimatedBloodLoss?: string | null;
        complications?: string | null;
        preOpHarrisHipScore?: string | null;
        postOpHarrisHipScore?: string | null;
        preOpKssScore?: string | null;
        postOpKssScore?: string | null;
        rangeOfMotion?: string | null;
        infection?: boolean;
        dislocation?: boolean;
        revisionNeeded?: boolean;
        revisionDate?: string | null;
        notes?: string | null;
    }) {
        return prisma.orthopedicJointReplacement.create({
            data: {
                patientId: data.patientId,
                providerId: data.providerId,
                surgeryDate: new Date(data.surgeryDate),
                jointType: data.jointType,
                side: data.side ?? undefined,
                approach: data.approach ?? undefined,
                implantManufacturer: data.implantManufacturer ?? undefined,
                implantModel: data.implantModel ?? undefined,
                implantSize: data.implantSize ?? undefined,
                bearingSurface: data.bearingSurface ?? undefined,
                fixation: data.fixation ?? undefined,
                anesthesiaType: data.anesthesiaType ?? undefined,
                tourniquetTime: data.tourniquetTime ?? undefined,
                estimatedBloodLoss: data.estimatedBloodLoss ?? undefined,
                complications: data.complications ?? undefined,
                preOpHarrisHipScore: data.preOpHarrisHipScore ?? undefined,
                postOpHarrisHipScore: data.postOpHarrisHipScore ?? undefined,
                preOpKssScore: data.preOpKssScore ?? undefined,
                postOpKssScore: data.postOpKssScore ?? undefined,
                rangeOfMotion: data.rangeOfMotion ?? undefined,
                infection: data.infection,
                dislocation: data.dislocation,
                revisionNeeded: data.revisionNeeded,
                revisionDate: data.revisionDate ? new Date(data.revisionDate) : undefined,
                notes: data.notes ?? undefined,
            },
            include: orthopedicJointReplacementInclude,
        });
    }

    async update(id: string, data: {
        patientId?: string;
        providerId?: string;
        surgeryDate?: string;
        jointType?: JointType;
        side?: string | null;
        approach?: string | null;
        implantManufacturer?: string | null;
        implantModel?: string | null;
        implantSize?: string | null;
        bearingSurface?: string | null;
        fixation?: string | null;
        anesthesiaType?: string | null;
        tourniquetTime?: string | null;
        estimatedBloodLoss?: string | null;
        complications?: string | null;
        preOpHarrisHipScore?: string | null;
        postOpHarrisHipScore?: string | null;
        preOpKssScore?: string | null;
        postOpKssScore?: string | null;
        rangeOfMotion?: string | null;
        infection?: boolean;
        dislocation?: boolean;
        revisionNeeded?: boolean;
        revisionDate?: string | null;
        notes?: string | null;
    }) {
        const updateData: Prisma.OrthopedicJointReplacementUncheckedUpdateInput = {
            patientId: data.patientId,
            providerId: data.providerId,
            jointType: data.jointType,
            side: data.side ?? undefined,
            approach: data.approach ?? undefined,
            implantManufacturer: data.implantManufacturer ?? undefined,
            implantModel: data.implantModel ?? undefined,
            implantSize: data.implantSize ?? undefined,
            bearingSurface: data.bearingSurface ?? undefined,
            fixation: data.fixation ?? undefined,
            anesthesiaType: data.anesthesiaType ?? undefined,
            tourniquetTime: data.tourniquetTime ?? undefined,
            estimatedBloodLoss: data.estimatedBloodLoss ?? undefined,
            complications: data.complications ?? undefined,
            preOpHarrisHipScore: data.preOpHarrisHipScore ?? undefined,
            postOpHarrisHipScore: data.postOpHarrisHipScore ?? undefined,
            preOpKssScore: data.preOpKssScore ?? undefined,
            postOpKssScore: data.postOpKssScore ?? undefined,
            rangeOfMotion: data.rangeOfMotion ?? undefined,
            infection: data.infection,
            dislocation: data.dislocation,
            revisionNeeded: data.revisionNeeded,
            notes: data.notes ?? undefined,
        };

        if (data.surgeryDate) {
            updateData.surgeryDate = new Date(data.surgeryDate);
        }
        if (data.revisionDate) {
            updateData.revisionDate = new Date(data.revisionDate);
        }

        return prisma.orthopedicJointReplacement.update({
            where: { id },
            data: updateData,
            include: orthopedicJointReplacementInclude,
        });
    }

    async delete(id: string) {
        return prisma.orthopedicJointReplacement.delete({
            where: { id },
        });
    }
}

export const orthopedicJointReplacementService = new OrthopedicJointReplacementService();
