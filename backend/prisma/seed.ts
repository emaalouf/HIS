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
