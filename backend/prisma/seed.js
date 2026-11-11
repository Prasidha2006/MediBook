import { PrismaClient } from '@prisma/client';
import {
  initialAdmin,
  initialDepartments,
  initialDoctors,
  initialPatients,
  generateDefaultSchedules,
  initialAppointments,
} from './seedData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MediBook database seed...');

  // 1. Seed Admin
  const adminUser = await prisma.user.upsert({
    where: { email: initialAdmin.user.email },
    update: {},
    create: {
      id: initialAdmin.user.id,
      email: initialAdmin.user.email,
      passwordHash: initialAdmin.user.passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Admin provisioned: ${adminUser.email}`);

  // 2. Seed Departments
  for (const dept of initialDepartments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {
        description: dept.description,
        icon: dept.icon,
        imageUrl: dept.imageUrl,
        isActive: dept.isActive,
      },
      create: dept,
    });
  }
  console.log(`✅ ${initialDepartments.length} Departments seeded.`);

  // 3. Seed Doctors and their user accounts
  for (const item of initialDoctors) {
    const user = await prisma.user.upsert({
      where: { email: item.user.email },
      update: {},
      create: item.user,
    });

    const doctor = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        ...item.doctor,
        userId: user.id,
      },
      create: {
        ...item.doctor,
        userId: user.id,
      },
    });

    // Seed weekly schedules for doctor
    const schedules = generateDefaultSchedules(doctor.id);
    for (const sched of schedules) {
      await prisma.doctorSchedule.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: doctor.id,
            dayOfWeek: sched.dayOfWeek,
          },
        },
        update: {
          startTime: sched.startTime,
          endTime: sched.endTime,
          slotDurationMinutes: sched.slotDurationMinutes,
          isActive: sched.isActive,
        },
        create: sched,
      });
    }
  }
  console.log(`✅ ${initialDoctors.length} Doctors & Weekly Schedules seeded.`);

  // 4. Seed Patients and their user accounts
  for (const item of initialPatients) {
    const user = await prisma.user.upsert({
      where: { email: item.user.email },
      update: {},
      create: item.user,
    });

    await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        ...item.patient,
        userId: user.id,
      },
      create: {
        ...item.patient,
        userId: user.id,
      },
    });
  }
  console.log(`✅ ${initialPatients.length} Patients seeded.`);

  // 5. Seed Appointments
  for (const apt of initialAppointments) {
    await prisma.appointment.upsert({
      where: { appointmentNumber: apt.appointmentNumber },
      update: {
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        cancellationReason: apt.cancellationReason,
      },
      create: {
        id: apt.id,
        appointmentNumber: apt.appointmentNumber,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        date: new Date(apt.date),
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        reason: apt.reason,
        notes: apt.notes,
        cancellationReason: apt.cancellationReason,
      },
    });
  }
  console.log(`✅ ${initialAppointments.length} Appointments seeded.`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
