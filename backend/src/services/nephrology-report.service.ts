import prisma from '../config/database';

export class NephrologyReportService {
    async getSummary(options: { startDate?: string; endDate?: string }) {
        const { startDate, endDate } = options;

        const visitWhere: any = {};
        if (startDate || endDate) {
            visitWhere.visitDate = {};
            if (startDate) visitWhere.visitDate.gte = new Date(startDate);
            if (endDate) visitWhere.visitDate.lte = new Date(endDate);
        }

        const imagingWhere: any = {};
        if (startDate || endDate) {
            imagingWhere.performedAt = {};
            if (startDate) imagingWhere.performedAt.gte = new Date(startDate);
            if (endDate) imagingWhere.performedAt.lte = new Date(endDate);
        }

        const biopsyWhere: any = {};
        if (startDate || endDate) {
            biopsyWhere.performedAt = {};
            if (startDate) biopsyWhere.performedAt.gte = new Date(startDate);
            if (endDate) biopsyWhere.performedAt.lte = new Date(endDate);
        }

        const labWhere: any = {};
        if (startDate || endDate) {
            labWhere.collectedAt = {};
            if (startDate) labWhere.collectedAt.gte = new Date(startDate);
            if (endDate) labWhere.collectedAt.lte = new Date(endDate);
        }

        const [
            totalVisits,
            completedVisits,
            cancelledVisits,
            totalImaging,
            completedImaging,
            totalBiopsies,
            completedBiopsies,
            labAverages,
            activeMedications,
        ] = await Promise.all([
            prisma.nephrologyVisit.count({ where: visitWhere }),
            prisma.nephrologyVisit.count({ where: { ...visitWhere, status: 'COMPLETED' } }),
            prisma.nephrologyVisit.count({ where: { ...visitWhere, status: 'CANCELLED' } }),
            prisma.nephrologyImaging.count({ where: imagingWhere }),
            prisma.nephrologyImaging.count({ where: { ...imagingWhere, status: 'COMPLETED' } }),
            prisma.nephrologyBiopsy.count({ where: biopsyWhere }),
            prisma.nephrologyBiopsy.count({ where: { ...biopsyWhere, status: 'COMPLETED' } }),
            prisma.nephrologyLabResult.aggregate({
                where: labWhere,
                _avg: { egfr: true, creatinine: true, uacr: true },
            }),
            prisma.nephrologyMedicationOrder.count({ where: { isActive: true } }),
        ]);

        return {
            totalVisits,
            completedVisits,
            cancelledVisits,
            totalImaging,
            completedImaging,
            totalBiopsies,
            completedBiopsies,
            averageEgfr: labAverages._avg.egfr ?? undefined,
            averageCreatinine: labAverages._avg.creatinine ?? undefined,
            averageUacr: labAverages._avg.uacr ?? undefined,
            activeMedications,
        };
    }
}

export const nephrologyReportService = new NephrologyReportService();
