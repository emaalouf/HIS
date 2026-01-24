import prisma from '../config/database';

export class CardiologyReportService {
    async getSummary(options: { startDate?: string; endDate?: string }) {
        const { startDate, endDate } = options;

        const visitWhere: any = {};
        if (startDate || endDate) {
            visitWhere.visitDate = {};
            if (startDate) visitWhere.visitDate.gte = new Date(startDate);
            if (endDate) visitWhere.visitDate.lte = new Date(endDate);
        }

        const ecgWhere: any = {};
        if (startDate || endDate) {
            ecgWhere.recordedAt = {};
            if (startDate) ecgWhere.recordedAt.gte = new Date(startDate);
            if (endDate) ecgWhere.recordedAt.lte = new Date(endDate);
        }

        const echoWhere: any = {};
        if (startDate || endDate) {
            echoWhere.performedAt = {};
            if (startDate) echoWhere.performedAt.gte = new Date(startDate);
            if (endDate) echoWhere.performedAt.lte = new Date(endDate);
        }

        const stressWhere: any = {};
        if (startDate || endDate) {
            stressWhere.performedAt = {};
            if (startDate) stressWhere.performedAt.gte = new Date(startDate);
            if (endDate) stressWhere.performedAt.lte = new Date(endDate);
        }

        const procedureWhere: any = {};
        if (startDate || endDate) {
            procedureWhere.procedureDate = {};
            if (startDate) procedureWhere.procedureDate.gte = new Date(startDate);
            if (endDate) procedureWhere.procedureDate.lte = new Date(endDate);
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
            totalEcgs,
            totalEchos,
            totalStressTests,
            totalProcedures,
            completedProcedures,
            echoAverages,
            labAverages,
            activeDevices,
            activeMedications,
        ] = await Promise.all([
            prisma.cardiologyVisit.count({ where: visitWhere }),
            prisma.cardiologyVisit.count({ where: { ...visitWhere, status: 'COMPLETED' } }),
            prisma.cardiologyVisit.count({ where: { ...visitWhere, status: 'CANCELLED' } }),
            prisma.cardiologyEcg.count({ where: ecgWhere }),
            prisma.cardiologyEcho.count({ where: echoWhere }),
            prisma.cardiologyStressTest.count({ where: stressWhere }),
            prisma.cardiologyProcedure.count({ where: procedureWhere }),
            prisma.cardiologyProcedure.count({ where: { ...procedureWhere, status: 'COMPLETED' } }),
            prisma.cardiologyEcho.aggregate({
                where: echoWhere,
                _avg: { lvef: true },
            }),
            prisma.cardiologyLabResult.aggregate({
                where: labWhere,
                _avg: { troponin: true },
            }),
            prisma.cardiologyDevice.count({ where: { status: 'ACTIVE' } }),
            prisma.cardiologyMedicationOrder.count({ where: { isActive: true } }),
        ]);

        return {
            totalVisits,
            completedVisits,
            cancelledVisits,
            totalEcgs,
            totalEchos,
            totalStressTests,
            totalProcedures,
            completedProcedures,
            averageLvef: echoAverages._avg.lvef ?? undefined,
            averageTroponin: labAverages._avg.troponin ?? undefined,
            activeDevices,
            activeMedications,
        };
    }
}

export const cardiologyReportService = new CardiologyReportService();
