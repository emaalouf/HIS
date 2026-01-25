import {
    CardiologyDeviceStatus,
    CardiologyMedicationRoute,
    CardiologyProcedureStatus,
    CardiologyTestStatus,
    CardiologyVisitStatus,
    DialysisMedicationRoute,
    DialysisScheduleRecurrence,
    DialysisStationStatus,
    DialysisStatus,
    CkdStage,
    NephrologyImagingModality,
    NephrologyMedicationRoute,
    NephrologyProcedureStatus,
    NephrologyTestStatus,
    NephrologyVisitStatus,
    NeurologyVisitStatus,
    AdmissionStatus,
    BedStatus,
    EncounterStatus,
    OrderStatus,
    OrderType,
    OrderPriority,
    ResultStatus,
    ResultFlag,
    MedicationOrderStatus,
    MedicationRoute,
    MedicationAdministrationStatus,
    InvoiceStatus,
    PaymentMethod,
    ClaimStatus,
    PrismaClient,
    Role,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@hospital.com' },
        update: {},
        create: {
            email: 'admin@hospital.com',
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Administrator',
            role: Role.ADMIN,
        },
    });
    console.log('✅ Created admin user:', admin.email);

    // Create a doctor
    const doctor = await prisma.user.upsert({
        where: { email: 'doctor@hospital.com' },
        update: {},
        create: {
            email: 'doctor@hospital.com',
            password: hashedPassword,
            firstName: 'John',
            lastName: 'Smith',
            role: Role.DOCTOR,
        },
    });
    console.log('✅ Created doctor user:', doctor.email);

    // Create a nurse
    const nurse = await prisma.user.upsert({
        where: { email: 'nurse@hospital.com' },
        update: {},
        create: {
            email: 'nurse@hospital.com',
            password: hashedPassword,
            firstName: 'Jane',
            lastName: 'Doe',
            role: Role.NURSE,
        },
    });
    console.log('✅ Created nurse user:', nurse.email);

    // Create a receptionist
    const receptionist = await prisma.user.upsert({
        where: { email: 'reception@hospital.com' },
        update: {},
        create: {
            email: 'reception@hospital.com',
            password: hashedPassword,
            firstName: 'Mary',
            lastName: 'Johnson',
            role: Role.RECEPTIONIST,
        },
    });
    console.log('✅ Created receptionist user:', receptionist.email);

    // Departments
    const department = await prisma.department.upsert({
        where: { name: 'General Medicine' },
        update: {},
        create: {
            name: 'General Medicine',
            description: 'Primary care and internal medicine',
        },
    });
    console.log('✅ Upserted department:', department.name);

    // Locations
    const location = await prisma.location.upsert({
        where: { id: 'loc-clinic-1' },
        update: {},
        create: {
            id: 'loc-clinic-1',
            name: 'Clinic Room 1',
            type: 'Clinic',
            departmentId: department.id,
        },
    });

    const telehealthLocation = await prisma.location.upsert({
        where: { id: 'loc-virtual' },
        update: {},
        create: {
            id: 'loc-virtual',
            name: 'Telehealth',
            type: 'Virtual',
            departmentId: department.id,
        },
    });
    console.log('✅ Upserted locations:', location.name, telehealthLocation.name);

    // Visit types
    const visitTypeNew = await prisma.visitType.upsert({
        where: { name: 'New Patient Visit' },
        update: {},
        create: {
            name: 'New Patient Visit',
            description: 'Initial consult',
            durationMinutes: 45,
        },
    });

    const visitTypeFollowUp = await prisma.visitType.upsert({
        where: { name: 'Follow Up' },
        update: {},
        create: {
            name: 'Follow Up',
            description: 'Established patient follow-up',
            durationMinutes: 30,
        },
    });
    console.log('✅ Upserted visit types:', visitTypeNew.name, visitTypeFollowUp.name);

    // Create sample patients
    const patients = [
        {
            mrn: 'MRN-001',
            firstName: 'Alice',
            lastName: 'Williams',
            dateOfBirth: new Date('1985-03-15'),
            gender: 'FEMALE' as const,
            bloodType: 'A_POSITIVE' as const,
            phone: '+1234567890',
            email: 'alice@email.com',
            address: '123 Main St',
            city: 'New York',
            country: 'USA',
            allergies: JSON.stringify(['Penicillin']),
            chronicConditions: JSON.stringify(['Hypertension']),
        },
        {
            mrn: 'MRN-002',
            firstName: 'Bob',
            lastName: 'Brown',
            dateOfBirth: new Date('1990-07-22'),
            gender: 'MALE' as const,
            bloodType: 'O_POSITIVE' as const,
            phone: '+1234567891',
            email: 'bob@email.com',
            address: '456 Oak Ave',
            city: 'Los Angeles',
            country: 'USA',
            allergies: JSON.stringify([]),
            chronicConditions: JSON.stringify(['Diabetes Type 2']),
        },
    ];

    for (const patientData of patients) {
        const patient = await prisma.patient.upsert({
            where: { mrn: patientData.mrn },
            update: {},
            create: patientData,
        });
        console.log('✅ Created patient:', patient.firstName, patient.lastName);
    }

    const patientOne = await prisma.patient.findUniqueOrThrow({ where: { mrn: 'MRN-001' } });
    const patientTwo = await prisma.patient.findUniqueOrThrow({ where: { mrn: 'MRN-002' } });

    // Sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setMinutes(tomorrow.getMinutes() + 45);

    await prisma.appointment.createMany({
        data: [
            {
                patientId: patientOne.id,
                providerId: doctor.id,
                createdById: receptionist.id,
                visitTypeId: visitTypeNew.id,
                locationId: location.id,
                startTime: tomorrow,
                endTime: tomorrowEnd,
                status: 'SCHEDULED',
                reason: 'New patient visit',
            },
            {
                patientId: patientTwo.id,
                providerId: doctor.id,
                createdById: receptionist.id,
                visitTypeId: visitTypeFollowUp.id,
                locationId: telehealthLocation.id,
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 60 * 1000),
                status: 'CONFIRMED',
                reason: 'Follow-up on labs',
            },
        ],
        skipDuplicates: true,
    });
    console.log('✅ Seeded sample appointments');

    // Dialysis stations
    const stationOne = await prisma.dialysisStation.upsert({
        where: { id: 'dialysis-station-1' },
        update: {},
        create: {
            id: 'dialysis-station-1',
            name: 'Station A',
            room: 'Dialysis Bay 1',
            machineNumber: 'HD-1001',
            status: DialysisStationStatus.AVAILABLE,
            lastServiceDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextServiceDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            notes: 'Routine maintenance scheduled every 90 days.',
        },
    });

    const stationTwo = await prisma.dialysisStation.upsert({
        where: { id: 'dialysis-station-2' },
        update: {},
        create: {
            id: 'dialysis-station-2',
            name: 'Station B',
            room: 'Dialysis Bay 1',
            machineNumber: 'HD-1002',
            status: DialysisStationStatus.IN_USE,
            lastServiceDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            nextServiceDate: new Date(Date.now() + 76 * 24 * 60 * 60 * 1000),
            notes: 'Dialyzer filter replaced recently.',
        },
    });
    const stationThree = await prisma.dialysisStation.upsert({
        where: { id: 'dialysis-station-3' },
        update: {},
        create: {
            id: 'dialysis-station-3',
            name: 'Station C',
            room: 'Dialysis Bay 2',
            machineNumber: 'HD-1003',
            status: DialysisStationStatus.MAINTENANCE,
            lastServiceDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            nextServiceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            notes: 'Valve inspection in progress.',
        },
    });

    const stationFour = await prisma.dialysisStation.upsert({
        where: { id: 'dialysis-station-4' },
        update: {},
        create: {
            id: 'dialysis-station-4',
            name: 'Station D',
            room: 'Dialysis Bay 2',
            machineNumber: 'HD-1004',
            status: DialysisStationStatus.OUT_OF_SERVICE,
            lastServiceDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            nextServiceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            isActive: false,
            notes: 'Awaiting replacement pump.',
        },
    });
    console.log(
        'Seeded dialysis stations:',
        stationOne.name,
        stationTwo.name,
        stationThree.name,
        stationFour.name
    );

    // Dialysis prescriptions
    await prisma.dialysisPrescription.upsert({
        where: { id: 'dialysis-prescription-1' },
        update: {},
        create: {
            id: 'dialysis-prescription-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            dryWeight: 70.5,
            targetUltrafiltration: 2.4,
            durationMinutes: 240,
            dialyzer: 'FX 80',
            dialysate: 'K2/Ca2.5',
            bloodFlowRate: 350,
            dialysateFlowRate: 500,
            accessType: 'AV Fistula',
            frequency: '3x/week',
            isActive: true,
            notes: 'Standard hemodialysis prescription.',
            startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        },
    });

    await prisma.dialysisPrescription.upsert({
        where: { id: 'dialysis-prescription-2' },
        update: {},
        create: {
            id: 'dialysis-prescription-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            dryWeight: 82.0,
            targetUltrafiltration: 2.0,
            durationMinutes: 210,
            dialyzer: 'FX 60',
            dialysate: 'K3/Ca2.0',
            bloodFlowRate: 300,
            dialysateFlowRate: 500,
            accessType: 'AV Graft',
            frequency: '2x/week',
            isActive: true,
            notes: 'Focus on fluid control.',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
    });
    await prisma.dialysisPrescription.upsert({
        where: { id: 'dialysis-prescription-3' },
        update: {},
        create: {
            id: 'dialysis-prescription-3',
            patientId: patientOne.id,
            providerId: doctor.id,
            dryWeight: 72.0,
            targetUltrafiltration: 2.8,
            durationMinutes: 240,
            dialyzer: 'FX 80',
            dialysate: 'K2/Ca2.5',
            bloodFlowRate: 350,
            dialysateFlowRate: 500,
            accessType: 'AV Fistula',
            frequency: '3x/week',
            isActive: false,
            notes: 'Prior prescription before dry weight adjustment.',
            startDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        },
    });
    console.log('Seeded dialysis prescriptions');

    // Dialysis schedules
    const scheduleOneStart = new Date();
    scheduleOneStart.setDate(scheduleOneStart.getDate() + 1);
    scheduleOneStart.setHours(8, 0, 0, 0);

    const scheduleTwoStart = new Date();
    scheduleTwoStart.setDate(scheduleTwoStart.getDate() + 2);
    scheduleTwoStart.setHours(13, 30, 0, 0);

    const scheduleThreeStart = new Date();
    scheduleThreeStart.setDate(scheduleThreeStart.getDate() - 20);
    scheduleThreeStart.setHours(6, 30, 0, 0);

    await prisma.dialysisSchedule.upsert({
        where: { id: 'dialysis-schedule-1' },
        update: {},
        create: {
            id: 'dialysis-schedule-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            stationId: stationOne.id,
            startTime: scheduleOneStart,
            durationMinutes: 240,
            recurrence: DialysisScheduleRecurrence.WEEKLY,
            daysOfWeek: [1, 3, 5],
            notes: 'M/W/F morning chair time.',
        },
    });

    await prisma.dialysisSchedule.upsert({
        where: { id: 'dialysis-schedule-2' },
        update: {},
        create: {
            id: 'dialysis-schedule-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            stationId: stationTwo.id,
            startTime: scheduleTwoStart,
            durationMinutes: 210,
            recurrence: DialysisScheduleRecurrence.WEEKLY,
            daysOfWeek: [2, 4],
            notes: 'T/Th afternoon chair time.',
        },
    });
    await prisma.dialysisSchedule.upsert({
        where: { id: 'dialysis-schedule-3' },
        update: {},
        create: {
            id: 'dialysis-schedule-3',
            patientId: patientOne.id,
            providerId: doctor.id,
            stationId: stationOne.id,
            startTime: scheduleThreeStart,
            durationMinutes: 240,
            recurrence: DialysisScheduleRecurrence.WEEKLY,
            daysOfWeek: [2, 4, 6],
            endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            isActive: false,
            notes: 'Former schedule before moving to mornings.',
        },
    });
    console.log('Seeded dialysis schedules');

    // Dialysis sessions
    const sessionOneStart = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    sessionOneStart.setHours(8, 0, 0, 0);
    const sessionOneEnd = new Date(sessionOneStart.getTime() + 4 * 60 * 60 * 1000);

    const sessionTwoStart = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    sessionTwoStart.setHours(9, 0, 0, 0);
    const sessionTwoEnd = new Date(sessionTwoStart.getTime() + 3.5 * 60 * 60 * 1000);

    const sessionThreeStart = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    sessionThreeStart.setHours(14, 0, 0, 0);
    const sessionThreeEnd = new Date(sessionThreeStart.getTime() + 3 * 60 * 60 * 1000);

    const sessionFourStart = new Date(Date.now() - 90 * 60 * 1000);
    const sessionFourEnd = new Date(Date.now() + 2.5 * 60 * 60 * 1000);

    await prisma.dialysisSession.upsert({
        where: { id: 'dialysis-session-1' },
        update: {},
        create: {
            id: 'dialysis-session-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            status: DialysisStatus.COMPLETED,
            startTime: sessionOneStart,
            endTime: sessionOneEnd,
            machineNumber: stationOne.machineNumber,
            accessType: 'AV Fistula',
            dialyzer: 'FX 80',
            dialysate: 'K2/Ca2.5',
            bloodFlowRate: 350,
            dialysateFlowRate: 500,
            ultrafiltrationVolume: 2.4,
            weightPre: 73.1,
            weightPost: 70.7,
            notes: 'Stable session, no complications.',
        },
    });

    await prisma.dialysisSession.upsert({
        where: { id: 'dialysis-session-2' },
        update: {},
        create: {
            id: 'dialysis-session-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: DialysisStatus.SCHEDULED,
            startTime: sessionTwoStart,
            endTime: sessionTwoEnd,
            machineNumber: stationTwo.machineNumber,
            accessType: 'AV Graft',
            dialyzer: 'FX 60',
            dialysate: 'K3/Ca2.0',
            bloodFlowRate: 300,
            dialysateFlowRate: 500,
            ultrafiltrationVolume: 2.0,
            weightPre: 84.0,
            weightPost: 82.0,
            notes: 'Planned dry weight adjustment.',
        },
    });
    await prisma.dialysisSession.upsert({
        where: { id: 'dialysis-session-3' },
        update: {},
        create: {
            id: 'dialysis-session-3',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: DialysisStatus.CANCELLED,
            startTime: sessionThreeStart,
            endTime: sessionThreeEnd,
            machineNumber: stationTwo.machineNumber,
            accessType: 'AV Graft',
            dialyzer: 'FX 60',
            dialysate: 'K3/Ca2.0',
            bloodFlowRate: 300,
            dialysateFlowRate: 500,
            ultrafiltrationVolume: 1.8,
            weightPre: 83.2,
            weightPost: 82.0,
            notes: 'Session cancelled due to patient illness.',
        },
    });
    await prisma.dialysisSession.upsert({
        where: { id: 'dialysis-session-4' },
        update: {},
        create: {
            id: 'dialysis-session-4',
            patientId: patientOne.id,
            providerId: nurse.id,
            status: DialysisStatus.IN_PROGRESS,
            startTime: sessionFourStart,
            endTime: sessionFourEnd,
            machineNumber: stationOne.machineNumber,
            accessType: 'AV Fistula',
            dialyzer: 'FX 80',
            dialysate: 'K2/Ca2.5',
            bloodFlowRate: 350,
            dialysateFlowRate: 500,
            ultrafiltrationVolume: 1.2,
            weightPre: 72.4,
            weightPost: 71.2,
            notes: 'Monitoring closely for cramps.',
        },
    });
    console.log('Seeded dialysis sessions');

    // Dialysis flowsheet entries
    await prisma.dialysisFlowsheetEntry.createMany({
        data: [
            {
                id: 'dialysis-flowsheet-1',
                sessionId: 'dialysis-session-1',
                recordedAt: new Date(sessionOneStart.getTime() + 30 * 60 * 1000),
                bpSystolic: 142,
                bpDiastolic: 86,
                heartRate: 78,
                temperature: 36.8,
                oxygenSaturation: 97,
                bloodFlowRate: 350,
                dialysateFlowRate: 500,
                ultrafiltrationVolume: 0.6,
                arterialPressure: -180,
                venousPressure: 160,
                transmembranePressure: 90,
                notes: 'Patient comfortable.',
            },
            {
                id: 'dialysis-flowsheet-2',
                sessionId: 'dialysis-session-1',
                recordedAt: new Date(sessionOneStart.getTime() + 2 * 60 * 60 * 1000),
                bpSystolic: 136,
                bpDiastolic: 82,
                heartRate: 74,
                temperature: 36.7,
                oxygenSaturation: 98,
                bloodFlowRate: 350,
                dialysateFlowRate: 500,
                ultrafiltrationVolume: 1.6,
                arterialPressure: -170,
                venousPressure: 155,
                transmembranePressure: 88,
                notes: 'No alarms, stable vitals.',
            },
            {
                id: 'dialysis-flowsheet-3',
                sessionId: 'dialysis-session-4',
                recordedAt: new Date(sessionFourStart.getTime() + 45 * 60 * 1000),
                bpSystolic: 148,
                bpDiastolic: 90,
                heartRate: 82,
                temperature: 36.9,
                oxygenSaturation: 96,
                bloodFlowRate: 350,
                dialysateFlowRate: 500,
                ultrafiltrationVolume: 0.5,
                arterialPressure: -185,
                venousPressure: 165,
                transmembranePressure: 92,
                notes: 'Mild leg cramping reported.',
            },
            {
                id: 'dialysis-flowsheet-4',
                sessionId: 'dialysis-session-4',
                recordedAt: new Date(sessionFourStart.getTime() + 90 * 60 * 1000),
                bpSystolic: 140,
                bpDiastolic: 84,
                heartRate: 78,
                temperature: 36.7,
                oxygenSaturation: 97,
                bloodFlowRate: 350,
                dialysateFlowRate: 500,
                ultrafiltrationVolume: 1.1,
                arterialPressure: -175,
                venousPressure: 158,
                transmembranePressure: 90,
                notes: 'Symptoms improved after UF adjustment.',
            },
        ],
        skipDuplicates: true,
    });
    console.log('Seeded dialysis flowsheet entries');

    // Dialysis lab results
    await prisma.dialysisLabResult.upsert({
        where: { id: 'dialysis-lab-1' },
        update: {},
        create: {
            id: 'dialysis-lab-1',
            patientId: patientOne.id,
            collectedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            ktv: 1.4,
            urr: 68,
            hemoglobin: 10.8,
            potassium: 4.8,
            sodium: 138,
            calcium: 8.9,
            phosphorus: 4.5,
            bicarbonate: 22,
            albumin: 3.6,
            creatinine: 7.8,
            notes: 'Adequate clearance.',
        },
    });

    await prisma.dialysisLabResult.upsert({
        where: { id: 'dialysis-lab-2' },
        update: {},
        create: {
            id: 'dialysis-lab-2',
            patientId: patientTwo.id,
            collectedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            ktv: 1.2,
            urr: 62,
            hemoglobin: 11.4,
            potassium: 5.2,
            sodium: 136,
            calcium: 8.7,
            phosphorus: 5.0,
            bicarbonate: 20,
            albumin: 3.4,
            creatinine: 8.5,
            notes: 'Monitor potassium trends.',
        },
    });
    await prisma.dialysisLabResult.upsert({
        where: { id: 'dialysis-lab-3' },
        update: {},
        create: {
            id: 'dialysis-lab-3',
            patientId: patientOne.id,
            collectedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
            ktv: 1.3,
            urr: 65,
            hemoglobin: 10.4,
            potassium: 5.0,
            sodium: 137,
            calcium: 8.6,
            phosphorus: 4.9,
            bicarbonate: 21,
            albumin: 3.5,
            creatinine: 7.9,
            notes: 'Slightly reduced adequacy.',
        },
    });
    await prisma.dialysisLabResult.upsert({
        where: { id: 'dialysis-lab-4' },
        update: {},
        create: {
            id: 'dialysis-lab-4',
            patientId: patientTwo.id,
            collectedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            ktv: 1.1,
            urr: 60,
            hemoglobin: 11.1,
            potassium: 5.4,
            sodium: 135,
            calcium: 8.5,
            phosphorus: 5.3,
            bicarbonate: 19,
            albumin: 3.2,
            creatinine: 8.9,
            notes: 'Dietary counseling recommended.',
        },
    });
    console.log('Seeded dialysis lab results');

    // Dialysis medication orders
    await prisma.dialysisMedicationOrder.upsert({
        where: { id: 'dialysis-med-1' },
        update: {},
        create: {
            id: 'dialysis-med-1',
            patientId: patientOne.id,
            medicationName: 'Epoetin alfa',
            dose: '4000 units',
            route: DialysisMedicationRoute.IV,
            frequency: '3x/week',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            lastAdministeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            isActive: true,
            notes: 'Administer post-dialysis.',
        },
    });

    await prisma.dialysisMedicationOrder.upsert({
        where: { id: 'dialysis-med-2' },
        update: {},
        create: {
            id: 'dialysis-med-2',
            patientId: patientTwo.id,
            medicationName: 'Iron sucrose',
            dose: '100 mg',
            route: DialysisMedicationRoute.IV,
            frequency: 'Weekly',
            startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            lastAdministeredAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            isActive: true,
            notes: 'Reassess ferritin next labs.',
        },
    });
    await prisma.dialysisMedicationOrder.upsert({
        where: { id: 'dialysis-med-3' },
        update: {},
        create: {
            id: 'dialysis-med-3',
            patientId: patientOne.id,
            medicationName: 'Sevelamer carbonate',
            dose: '800 mg',
            route: DialysisMedicationRoute.PO,
            frequency: 'TID with meals',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            lastAdministeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            isActive: true,
            notes: 'Phosphate binder.',
        },
    });
    await prisma.dialysisMedicationOrder.upsert({
        where: { id: 'dialysis-med-4' },
        update: {},
        create: {
            id: 'dialysis-med-4',
            patientId: patientTwo.id,
            medicationName: 'Darbepoetin alfa',
            dose: '25 mcg',
            route: DialysisMedicationRoute.SC,
            frequency: 'Weekly',
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            lastAdministeredAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            isActive: false,
            notes: 'Held after hemoglobin improved.',
        },
    });
    console.log('Seeded dialysis medication orders');

    // Cardiology visits
    const visitOne = await prisma.cardiologyVisit.upsert({
        where: { id: 'cardiology-visit-1' },
        update: {},
        create: {
            id: 'cardiology-visit-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            status: CardiologyVisitStatus.COMPLETED,
            visitDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            reason: 'Chest pain with exertion',
            symptoms: 'Chest tightness, shortness of breath, fatigue',
            diagnosis: 'Stable angina',
            assessment: 'Likely ischemic heart disease, moderate risk factors.',
            plan: 'Start beta blocker, order stress test, follow-up in 2 weeks.',
            notes: 'Discussed lifestyle modifications and medication adherence.',
        },
    });

    const visitTwo = await prisma.cardiologyVisit.upsert({
        where: { id: 'cardiology-visit-2' },
        update: {},
        create: {
            id: 'cardiology-visit-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: CardiologyVisitStatus.SCHEDULED,
            visitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            reason: 'Palpitations and dizziness',
            symptoms: 'Intermittent palpitations, lightheadedness',
            notes: 'Holter monitor planned.',
        },
    });

    const visitThree = await prisma.cardiologyVisit.upsert({
        where: { id: 'cardiology-visit-3' },
        update: {},
        create: {
            id: 'cardiology-visit-3',
            patientId: patientOne.id,
            providerId: nurse.id,
            status: CardiologyVisitStatus.CANCELLED,
            visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            reason: 'Follow-up visit',
            notes: 'Cancelled due to patient illness.',
        },
    });
    console.log('Seeded cardiology visits');

    // Cardiology ECGs
    await prisma.cardiologyEcg.upsert({
        where: { id: 'cardiology-ecg-1' },
        update: {},
        create: {
            id: 'cardiology-ecg-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: visitOne.id,
            status: CardiologyTestStatus.COMPLETED,
            recordedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            type: 'Resting ECG',
            rhythm: 'Normal sinus rhythm',
            heartRate: 72,
            prInterval: 160,
            qrsDuration: 92,
            qtInterval: 380,
            qtc: 410,
            interpretation: 'No acute ischemic changes.',
        },
    });

    await prisma.cardiologyEcg.upsert({
        where: { id: 'cardiology-ecg-2' },
        update: {},
        create: {
            id: 'cardiology-ecg-2',
            patientId: patientTwo.id,
            providerId: nurse.id,
            status: CardiologyTestStatus.COMPLETED,
            recordedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            type: 'Holter (24h)',
            rhythm: 'Frequent PVCs',
            heartRate: 88,
            interpretation: 'Occasional ventricular ectopy.',
            notes: 'Consider beta blocker if symptomatic.',
        },
    });
    console.log('Seeded cardiology ECGs');

    // Cardiology echos
    await prisma.cardiologyEcho.upsert({
        where: { id: 'cardiology-echo-1' },
        update: {},
        create: {
            id: 'cardiology-echo-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: visitOne.id,
            status: CardiologyTestStatus.COMPLETED,
            performedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            type: 'Transthoracic',
            lvef: 55,
            lvEndDiastolicDia: 5.1,
            lvEndSystolicDia: 3.2,
            rvFunction: 'Normal',
            valveFindings: 'Mild mitral regurgitation.',
            wallMotion: 'No regional wall motion abnormalities.',
            pericardialEffusion: false,
            summary: 'Normal LV size and function.',
        },
    });
    console.log('Seeded cardiology echos');

    // Cardiology stress tests
    await prisma.cardiologyStressTest.upsert({
        where: { id: 'cardiology-stress-1' },
        update: {},
        create: {
            id: 'cardiology-stress-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: visitOne.id,
            status: CardiologyTestStatus.COMPLETED,
            performedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            type: 'Treadmill',
            protocol: 'Bruce',
            durationMinutes: 9,
            mets: 10.1,
            maxHeartRate: 148,
            maxBpSystolic: 168,
            maxBpDiastolic: 82,
            symptoms: 'Mild chest pressure at peak exertion.',
            result: 'Positive for inducible ischemia.',
        },
    });
    console.log('Seeded cardiology stress tests');

    // Cardiology procedures
    await prisma.cardiologyProcedure.upsert({
        where: { id: 'cardiology-procedure-1' },
        update: {},
        create: {
            id: 'cardiology-procedure-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: visitOne.id,
            status: CardiologyProcedureStatus.COMPLETED,
            procedureDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            type: 'Coronary angiography',
            indication: 'Positive stress test',
            findings: 'Moderate LAD stenosis',
            outcome: 'Medical management recommended',
            notes: 'No complications.',
        },
    });

    await prisma.cardiologyProcedure.upsert({
        where: { id: 'cardiology-procedure-2' },
        update: {},
        create: {
            id: 'cardiology-procedure-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: CardiologyProcedureStatus.SCHEDULED,
            procedureDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            type: 'Electrophysiology study',
            indication: 'Recurrent palpitations',
            notes: 'Pre-op labs pending.',
        },
    });
    console.log('Seeded cardiology procedures');

    // Cardiology devices
    await prisma.cardiologyDevice.upsert({
        where: { id: 'cardiology-device-1' },
        update: {},
        create: {
            id: 'cardiology-device-1',
            patientId: patientTwo.id,
            providerId: doctor.id,
            deviceType: 'Dual chamber pacemaker',
            manufacturer: 'Medtronic',
            model: 'Azure XT',
            serialNumber: 'MDT-88901',
            implantDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            status: CardiologyDeviceStatus.ACTIVE,
            lastInterrogationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextFollowUpDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            batteryStatus: 'Good',
            notes: 'No arrhythmic events detected.',
        },
    });
    console.log('Seeded cardiology devices');

    // Cardiology medication orders
    await prisma.cardiologyMedicationOrder.upsert({
        where: { id: 'cardiology-med-1' },
        update: {},
        create: {
            id: 'cardiology-med-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            medicationName: 'Metoprolol succinate',
            dose: '50 mg',
            route: CardiologyMedicationRoute.PO,
            frequency: 'Daily',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            indication: 'Angina control',
        },
    });

    await prisma.cardiologyMedicationOrder.upsert({
        where: { id: 'cardiology-med-2' },
        update: {},
        create: {
            id: 'cardiology-med-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            medicationName: 'Atorvastatin',
            dose: '40 mg',
            route: CardiologyMedicationRoute.PO,
            frequency: 'Nightly',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            isActive: true,
            indication: 'Hyperlipidemia',
        },
    });

    await prisma.cardiologyMedicationOrder.upsert({
        where: { id: 'cardiology-med-3' },
        update: {},
        create: {
            id: 'cardiology-med-3',
            patientId: patientOne.id,
            providerId: doctor.id,
            medicationName: 'Aspirin',
            dose: '81 mg',
            route: CardiologyMedicationRoute.PO,
            frequency: 'Daily',
            startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            isActive: false,
            indication: 'Primary prevention',
            notes: 'Stopped due to GI upset.',
        },
    });
    console.log('Seeded cardiology medication orders');

    // Cardiology lab results
    await prisma.cardiologyLabResult.upsert({
        where: { id: 'cardiology-lab-1' },
        update: {},
        create: {
            id: 'cardiology-lab-1',
            patientId: patientOne.id,
            collectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            troponin: 0.02,
            bnp: 180,
            ntProBnp: 420,
            ckmb: 3.2,
            totalCholesterol: 190,
            ldl: 112,
            hdl: 48,
            triglycerides: 140,
            crp: 2.1,
            inr: 1.0,
            notes: 'Mildly elevated BNP.',
        },
    });

    await prisma.cardiologyLabResult.upsert({
        where: { id: 'cardiology-lab-2' },
        update: {},
        create: {
            id: 'cardiology-lab-2',
            patientId: patientTwo.id,
            collectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            troponin: 0.01,
            bnp: 230,
            ntProBnp: 520,
            ckmb: 2.6,
            totalCholesterol: 225,
            ldl: 142,
            hdl: 42,
            triglycerides: 180,
            crp: 3.4,
            inr: 1.1,
            notes: 'LDL above goal.',
        },
    });
    console.log('Seeded cardiology lab results');

    // Nephrology visits
    const nephrologyVisitOne = await prisma.nephrologyVisit.upsert({
        where: { id: 'nephrology-visit-1' },
        update: {},
        create: {
            id: 'nephrology-visit-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            status: NephrologyVisitStatus.COMPLETED,
            visitDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            reason: 'CKD follow-up',
            symptoms: 'Fatigue and lower extremity edema',
            ckdStage: CkdStage.STAGE_4,
            egfr: 24,
            bpSystolic: 146,
            bpDiastolic: 88,
            diagnosis: 'Chronic kidney disease stage 4',
            assessment: 'Progressive CKD with proteinuria.',
            plan: 'Optimize BP control, dietary counseling, dialysis education.',
            notes: 'Discussed transplant referral timing.',
        },
    });

    const nephrologyVisitTwo = await prisma.nephrologyVisit.upsert({
        where: { id: 'nephrology-visit-2' },
        update: {},
        create: {
            id: 'nephrology-visit-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: NephrologyVisitStatus.SCHEDULED,
            visitDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
            reason: 'Proteinuria evaluation',
            symptoms: 'Foamy urine, mild hypertension',
            ckdStage: CkdStage.STAGE_2,
            egfr: 78,
            bpSystolic: 132,
            bpDiastolic: 82,
            notes: 'Plan urine protein quantification and imaging.',
        },
    });

    const nephrologyVisitThree = await prisma.nephrologyVisit.upsert({
        where: { id: 'nephrology-visit-3' },
        update: {},
        create: {
            id: 'nephrology-visit-3',
            patientId: patientOne.id,
            providerId: nurse.id,
            status: NephrologyVisitStatus.CANCELLED,
            visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            reason: 'Blood pressure check',
            notes: 'Cancelled due to patient illness.',
        },
    });
    console.log('Seeded nephrology visits');

    // Nephrology imaging
    await prisma.nephrologyImaging.upsert({
        where: { id: 'nephrology-imaging-1' },
        update: {},
        create: {
            id: 'nephrology-imaging-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: nephrologyVisitOne.id,
            status: NephrologyTestStatus.COMPLETED,
            performedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
            modality: NephrologyImagingModality.ULTRASOUND,
            studyType: 'Renal ultrasound',
            findings: 'Bilateral small echogenic kidneys with cortical thinning.',
            impression: 'Findings consistent with chronic medical renal disease.',
        },
    });

    await prisma.nephrologyImaging.upsert({
        where: { id: 'nephrology-imaging-2' },
        update: {},
        create: {
            id: 'nephrology-imaging-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            visitId: nephrologyVisitTwo.id,
            status: NephrologyTestStatus.ORDERED,
            performedAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            modality: NephrologyImagingModality.CT,
            studyType: 'CT urogram',
            notes: 'Evaluate for structural causes of proteinuria.',
        },
    });
    console.log('Seeded nephrology imaging');

    // Nephrology biopsies
    await prisma.nephrologyBiopsy.upsert({
        where: { id: 'nephrology-biopsy-1' },
        update: {},
        create: {
            id: 'nephrology-biopsy-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            visitId: nephrologyVisitOne.id,
            status: NephrologyProcedureStatus.COMPLETED,
            performedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            indication: 'Nephrotic range proteinuria',
            specimenType: 'Native kidney',
            pathologySummary: 'FSGS with interstitial fibrosis and tubular atrophy.',
            complications: 'None',
            notes: 'Discussed immunosuppression risks.',
        },
    });

    await prisma.nephrologyBiopsy.upsert({
        where: { id: 'nephrology-biopsy-2' },
        update: {},
        create: {
            id: 'nephrology-biopsy-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            status: NephrologyProcedureStatus.SCHEDULED,
            performedAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
            indication: 'Persistent hematuria',
            specimenType: 'Native kidney',
            notes: 'Hold anticoagulation 5 days prior.',
        },
    });
    console.log('Seeded nephrology biopsies');

    // Nephrology lab results
    await prisma.nephrologyLabResult.upsert({
        where: { id: 'nephrology-lab-1' },
        update: {},
        create: {
            id: 'nephrology-lab-1',
            patientId: patientOne.id,
            collectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            creatinine: 3.2,
            bun: 48,
            egfr: 22,
            potassium: 5.2,
            sodium: 138,
            chloride: 102,
            bicarbonate: 18,
            calcium: 8.6,
            phosphorus: 5.4,
            albumin: 3.2,
            hemoglobin: 10.4,
            pth: 320,
            vitaminD: 18,
            uricAcid: 7.8,
            urineProtein: 450,
            urineAlbumin: 320,
            urineCreatinine: 95,
            uacr: 337,
            upcr: 4.7,
            notes: 'Metabolic acidosis and secondary hyperparathyroidism.',
        },
    });

    await prisma.nephrologyLabResult.upsert({
        where: { id: 'nephrology-lab-2' },
        update: {},
        create: {
            id: 'nephrology-lab-2',
            patientId: patientTwo.id,
            collectedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            creatinine: 1.3,
            bun: 18,
            egfr: 78,
            potassium: 4.3,
            sodium: 139,
            chloride: 104,
            bicarbonate: 23,
            calcium: 9.1,
            phosphorus: 3.7,
            albumin: 3.8,
            hemoglobin: 13.2,
            pth: 62,
            vitaminD: 28,
            uricAcid: 6.1,
            urineProtein: 120,
            urineAlbumin: 80,
            urineCreatinine: 110,
            uacr: 73,
            upcr: 1.1,
            notes: 'Mild proteinuria, monitor trend.',
        },
    });
    console.log('Seeded nephrology lab results');

    // Nephrology medication orders
    await prisma.nephrologyMedicationOrder.upsert({
        where: { id: 'nephrology-med-1' },
        update: {},
        create: {
            id: 'nephrology-med-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            medicationName: 'Sodium bicarbonate',
            dose: '650 mg',
            route: NephrologyMedicationRoute.PO,
            frequency: 'TID',
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            isActive: true,
            indication: 'Metabolic acidosis',
            notes: 'Recheck bicarbonate in 4 weeks.',
        },
    });

    await prisma.nephrologyMedicationOrder.upsert({
        where: { id: 'nephrology-med-2' },
        update: {},
        create: {
            id: 'nephrology-med-2',
            patientId: patientTwo.id,
            providerId: doctor.id,
            medicationName: 'Lisinopril',
            dose: '10 mg',
            route: NephrologyMedicationRoute.PO,
            frequency: 'Daily',
            startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            isActive: true,
            indication: 'Proteinuria control',
        },
    });

    await prisma.nephrologyMedicationOrder.upsert({
        where: { id: 'nephrology-med-3' },
        update: {},
        create: {
            id: 'nephrology-med-3',
            patientId: patientOne.id,
            providerId: doctor.id,
            medicationName: 'Calcitriol',
            dose: '0.25 mcg',
            route: NephrologyMedicationRoute.PO,
            frequency: 'Three times weekly',
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            isActive: false,
            indication: 'Secondary hyperparathyroidism',
            notes: 'Held due to hypercalcemia.',
        },
    });
    console.log('Seeded nephrology medication orders');

    const neurologyVisitOne = await prisma.neurologyVisit.upsert({
        where: { id: 'neurology-visit-1' },
        update: {},
        create: {
            id: 'neurology-visit-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            status: NeurologyVisitStatus.COMPLETED,
            visitDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            reason: 'New onset headaches',
            symptoms: 'Occipital headache with photophobia and nausea',
            mentalStatus: 'Alert and oriented x4.',
            cranialNerves: 'II-XII intact.',
            motorExam: '5/5 strength in all extremities.',
            sensoryExam: 'Intact to light touch and pinprick.',
            reflexes: '2+ symmetric.',
            coordination: 'No dysmetria on finger-to-nose.',
            gait: 'Normal steady gait.',
            speech: 'Fluent with normal comprehension.',
            nihssScore: 0,
            gcsScore: 15,
            diagnosis: 'Migraine without aura',
            assessment: 'Symptoms consistent with migraine.',
            plan: 'Start prophylactic therapy and lifestyle modification.',
            notes: 'Return precautions reviewed.',
        },
    });

    await prisma.neurologyVisit.upsert({
        where: { id: 'neurology-visit-2' },
        update: {},
        create: {
            id: 'neurology-visit-2',
            patientId: patientTwo.id,
            providerId: nurse.id,
            status: NeurologyVisitStatus.SCHEDULED,
            visitDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            reason: 'Post-concussion follow-up',
            symptoms: 'Intermittent dizziness, mild memory issues',
            notes: `Scheduled for neurologic exam and cognitive screening.`,
        },
    });

    console.log('Seeded neurology visits');

    const wardGeneral = await prisma.ward.upsert({
        where: { name: 'General Ward' },
        update: {},
        create: {
            name: 'General Ward',
            departmentId: department.id,
            notes: 'General inpatient ward.',
        },
    });

    const wardNeuro = await prisma.ward.upsert({
        where: { name: 'Neuro Ward' },
        update: {},
        create: {
            name: 'Neuro Ward',
            departmentId: department.id,
            notes: 'Neurology inpatient ward.',
        },
    });

    const bedA1 = await prisma.bed.upsert({
        where: { id: 'bed-a1' },
        update: {},
        create: {
            id: 'bed-a1',
            wardId: wardGeneral.id,
            roomNumber: '101',
            bedLabel: 'A1',
            status: BedStatus.OCCUPIED,
        },
    });

    const bedN1 = await prisma.bed.upsert({
        where: { id: 'bed-n1' },
        update: {},
        create: {
            id: 'bed-n1',
            wardId: wardNeuro.id,
            roomNumber: '201',
            bedLabel: 'N1',
            status: BedStatus.AVAILABLE,
        },
    });

    const admissionOne = await prisma.admission.upsert({
        where: { id: 'admission-1' },
        update: {},
        create: {
            id: 'admission-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            wardId: wardGeneral.id,
            bedId: bedA1.id,
            departmentId: department.id,
            status: AdmissionStatus.ADMITTED,
            admitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            reason: 'Observation for headache',
            diagnosis: 'Migraine',
            notes: 'Monitor neuro status overnight.',
        },
    });

    console.log('Seeded wards, beds, and admissions');

    const encounterOne = await prisma.encounter.upsert({
        where: { id: 'encounter-1' },
        update: {},
        create: {
            id: 'encounter-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            createdById: doctor.id,
            admissionId: admissionOne.id,
            status: EncounterStatus.IN_PROGRESS,
            reasonForVisit: 'Headache evaluation',
            diagnosis: 'Migraine',
            assessment: 'Likely migraine without red flags.',
            plan: 'Analgesia and follow-up in clinic.',
            startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
    });

    const orderOne = await prisma.clinicalOrder.upsert({
        where: { id: 'order-1' },
        update: {},
        create: {
            id: 'order-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            encounterId: encounterOne.id,
            orderType: OrderType.LAB,
            status: OrderStatus.COMPLETED,
            priority: OrderPriority.ROUTINE,
            orderedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
            orderName: 'CBC',
            description: 'Complete blood count',
            notes: 'Baseline labs.',
        },
    });

    await prisma.clinicalResult.upsert({
        where: { id: 'result-1' },
        update: {},
        create: {
            id: 'result-1',
            orderId: orderOne.id,
            patientId: patientOne.id,
            reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            resultName: 'WBC',
            value: '7.2',
            unit: 'x10^3/uL',
            referenceRange: '4.0-10.0',
            status: ResultStatus.FINAL,
            flag: ResultFlag.NORMAL,
            notes: 'Within normal range.',
        },
    });

    const medOrder = await prisma.medicationOrder.upsert({
        where: { id: 'med-order-1' },
        update: {},
        create: {
            id: 'med-order-1',
            patientId: patientOne.id,
            providerId: doctor.id,
            encounterId: encounterOne.id,
            status: MedicationOrderStatus.ACTIVE,
            medicationName: 'Sumatriptan',
            dose: '50 mg',
            route: MedicationRoute.PO,
            frequency: 'Once',
            startDate: new Date(),
            indication: 'Migraine abortive',
        },
    });

    await prisma.medicationAdministration.upsert({
        where: { id: 'med-admin-1' },
        update: {},
        create: {
            id: 'med-admin-1',
            medicationOrderId: medOrder.id,
            patientId: patientOne.id,
            administeredById: nurse.id,
            administeredAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            doseGiven: '50 mg',
            status: MedicationAdministrationStatus.GIVEN,
            notes: 'Patient tolerated dose.',
        },
    });

    const invoiceOne = await prisma.invoice.upsert({
        where: { id: 'invoice-1' },
        update: {},
        create: {
            id: 'invoice-1',
            invoiceNumber: 'INV-0001',
            patientId: patientOne.id,
            encounterId: encounterOne.id,
            status: InvoiceStatus.ISSUED,
            totalAmount: 320,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            notes: 'Observation stay charges.',
            createdById: receptionist.id,
            items: {
                create: [
                    {
                        description: 'Observation bed',
                        quantity: 1,
                        unitPrice: 200,
                        totalPrice: 200,
                    },
                    {
                        description: 'Lab panel',
                        quantity: 1,
                        unitPrice: 120,
                        totalPrice: 120,
                    },
                ],
            },
        },
    });

    await prisma.payment.upsert({
        where: { id: 'payment-1' },
        update: {},
        create: {
            id: 'payment-1',
            invoiceId: invoiceOne.id,
            patientId: patientOne.id,
            amount: 120,
            method: PaymentMethod.CARD,
            paidAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            reference: 'AUTH-12345',
            receivedById: receptionist.id,
        },
    });

    await prisma.claim.upsert({
        where: { id: 'claim-1' },
        update: {},
        create: {
            id: 'claim-1',
            invoiceId: invoiceOne.id,
            patientId: patientOne.id,
            payerName: 'Blue Shield',
            status: ClaimStatus.SUBMITTED,
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            notes: 'Submitted via clearinghouse.',
        },
    });

    console.log('Seeded encounters, orders, pharmacy, and billing');

    console.log('🎉 Database seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
