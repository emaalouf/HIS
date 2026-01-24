import { PrismaClient, Role } from '@prisma/client';
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

    // Sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setMinutes(tomorrow.getMinutes() + 45);

    await prisma.appointment.createMany({
        data: [
            {
                patientId: (await prisma.patient.findUniqueOrThrow({ where: { mrn: 'MRN-001' } })).id,
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
                patientId: (await prisma.patient.findUniqueOrThrow({ where: { mrn: 'MRN-002' } })).id,
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
