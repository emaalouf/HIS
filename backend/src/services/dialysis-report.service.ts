import prisma from '../config/database';

export class DialysisReportService {
    async getSummary(options: { startDate?: string; endDate?: string }) {
        const { startDate, endDate } = options;

        const sessionWhere: any = {};
        if (startDate || endDate) {
            sessionWhere.startTime = {};
            if (startDate) sessionWhere.startTime.gte = new Date(startDate);
            if (endDate) sessionWhere.startTime.lte = new Date(endDate);
        }

        const labWhere: any = {};
        if (startDate || endDate) {
            labWhere.collectedAt = {};
            if (startDate) labWhere.collectedAt.gte = new Date(startDate);
            if (endDate) labWhere.collectedAt.lte = new Date(endDate);
        }

        const [totalSessions, completedSessions, cancelledSessions, sessionTimes, labAverages, activePatients] =
            await Promise.all([
                prisma.dialysisSession.count({ where: sessionWhere }),
                prisma.dialysisSession.count({ where: { ...sessionWhere, status: 'COMPLETED' } }),
                prisma.dialysisSession.count({ where: { ...sessionWhere, status: 'CANCELLED' } }),
                prisma.dialysisSession.findMany({
                    where: sessionWhere,
                    select: { startTime: true, endTime: true },
                }),
                prisma.dialysisLabResult.aggregate({
                    where: labWhere,
                    _avg: {
                        ktv: true,
                        urr: true,
                    },
                }),
                prisma.dialysisPrescription.findMany({
                    where: { isActive: true },
                    select: { patientId: true },
                }),
            ]);

        const averageDurationMinutes = sessionTimes.length
            ? Math.round(
                sessionTimes.reduce((sum, session) => {
                    const diffMs = session.endTime.getTime() - session.startTime.getTime();
                    return sum + diffMs / 60000;
                }, 0) / sessionTimes.length
            )
            : undefined;

        const uniqueActivePatients = new Set(activePatients.map((entry) => entry.patientId)).size;

        return {
            totalSessions,
            completedSessions,
            cancelledSessions,
            averageDurationMinutes,
            averageKtv: labAverages._avg.ktv ?? undefined,
            averageUrr: labAverages._avg.urr ?? undefined,
            activePatients: uniqueActivePatients,
            chairUtilizationPercent: undefined,
        };
    }
}

export const dialysisReportService = new DialysisReportService();
