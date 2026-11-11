import { getPrisma, isPrismaActive, localStore } from '../config/db.js';

export const dataService = {
  // --- USERS ---
  async findUserByEmail(email) {
    if (isPrismaActive()) {
      return getPrisma().user.findUnique({
        where: { email: email.toLowerCase() },
        include: { patient: true, doctor: true },
      });
    }
    const user = localStore.findUserByEmail(email);
    if (!user) return null;
    const patient = localStore.findPatientByUserId(user.id);
    const doctor = localStore.findDoctorByUserId(user.id);
    return { ...user, patient, doctor };
  },

  async findUserById(id) {
    if (isPrismaActive()) {
      return getPrisma().user.findUnique({
        where: { id },
        include: { patient: true, doctor: true },
      });
    }
    const user = localStore.findUserById(id);
    if (!user) return null;
    const patient = localStore.findPatientByUserId(user.id);
    const doctor = localStore.findDoctorByUserId(user.id);
    return { ...user, patient, doctor };
  },

  async createUser(data) {
    if (isPrismaActive()) {
      return getPrisma().user.create({ data });
    }
    return localStore.createUser(data);
  },

  async updateUser(id, updates) {
    if (isPrismaActive()) {
      return getPrisma().user.update({ where: { id }, data: updates });
    }
    return localStore.updateUser(id, updates);
  },

  // --- PATIENTS ---
  async findPatientByUserId(userId) {
    if (isPrismaActive()) {
      return getPrisma().patient.findUnique({
        where: { userId },
        include: { user: true },
      });
    }
    return localStore.findPatientByUserId(userId);
  },

  async findPatientById(id) {
    if (isPrismaActive()) {
      return getPrisma().patient.findUnique({
        where: { id },
        include: { user: true },
      });
    }
    return localStore.findPatientById(id);
  },

  async getAllPatients() {
    if (isPrismaActive()) {
      const patients = await getPrisma().patient.findMany({
        include: {
          user: { select: { id: true, email: true, isActive: true } },
          appointments: { select: { id: true } },
        },
      });
      return patients.map((p) => ({
        ...p,
        totalAppointments: p.appointments.length,
      }));
    }
    return localStore.getAllPatients();
  },

  async createPatient(data) {
    if (isPrismaActive()) {
      return getPrisma().patient.create({ data });
    }
    return localStore.createPatient(data);
  },

  async updatePatient(idOrUserId, data) {
    if (isPrismaActive()) {
      return getPrisma().patient.update({
        where: idOrUserId.startsWith('usr-') ? { userId: idOrUserId } : { id: idOrUserId },
        data,
      });
    }
    return localStore.updatePatient(idOrUserId, data);
  },

  // --- DOCTORS ---
  async getAllDoctors(filters = {}) {
    if (isPrismaActive()) {
      const where = {};
      if (filters.departmentId) where.departmentId = filters.departmentId;
      if (filters.isActive !== undefined) where.isActive = filters.isActive;
      if (filters.isApproved !== undefined) where.isApproved = filters.isApproved;
      if (filters.search) {
        where.OR = [
          { fullName: { contains: filters.search, mode: 'insensitive' } },
          { specialization: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      return getPrisma().doctor.findMany({
        where,
        include: {
          department: true,
          user: { select: { id: true, email: true, isActive: true } },
          schedules: true,
          leaves: true,
        },
        orderBy: { experienceYears: 'desc' },
      });
    }
    return localStore.getAllDoctors(filters);
  },

  async findDoctorById(id) {
    if (isPrismaActive()) {
      return getPrisma().doctor.findUnique({
        where: { id },
        include: {
          department: true,
          user: { select: { id: true, email: true, isActive: true } },
          schedules: true,
          leaves: true,
        },
      });
    }
    return localStore.findDoctorById(id);
  },

  async findDoctorByUserId(userId) {
    if (isPrismaActive()) {
      return getPrisma().doctor.findUnique({
        where: { userId },
        include: {
          department: true,
          user: { select: { id: true, email: true, isActive: true } },
          schedules: true,
          leaves: true,
        },
      });
    }
    return localStore.findDoctorByUserId(userId);
  },

  async createDoctor(data) {
    if (isPrismaActive()) {
      const doc = await getPrisma().doctor.create({ data });
      return this.findDoctorById(doc.id);
    }
    return localStore.createDoctor(data);
  },

  async updateDoctor(id, updates) {
    if (isPrismaActive()) {
      await getPrisma().doctor.update({ where: { id }, data: updates });
      return this.findDoctorById(id);
    }
    return localStore.updateDoctor(id, updates);
  },

  async deleteDoctor(id) {
    if (isPrismaActive()) {
      const doc = await getPrisma().doctor.findUnique({ where: { id } });
      if (doc) {
        await getPrisma().doctor.delete({ where: { id } });
        await getPrisma().user.update({ where: { id: doc.userId }, data: { isActive: false } });
        return true;
      }
      return false;
    }
    return localStore.deleteDoctor(id);
  },

  // --- DEPARTMENTS ---
  async getAllDepartments(onlyActive = false) {
    if (isPrismaActive()) {
      const where = onlyActive ? { isActive: true } : {};
      return getPrisma().department.findMany({
        where,
        include: {
          doctors: {
            where: { isActive: true, isApproved: true },
            select: {
              id: true,
              fullName: true,
              specialization: true,
              avatarUrl: true,
              consultationFee: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    }
    return localStore.getAllDepartments(onlyActive);
  },

  async findDepartmentById(id) {
    if (isPrismaActive()) {
      return getPrisma().department.findUnique({
        where: { id },
        include: { doctors: true },
      });
    }
    return localStore.findDepartmentById(id);
  },

  async findDepartmentByName(name) {
    if (isPrismaActive()) {
      return getPrisma().department.findUnique({
        where: { name },
      });
    }
    return localStore.findDepartmentByName(name);
  },

  async createDepartment(data) {
    if (isPrismaActive()) {
      return getPrisma().department.create({ data });
    }
    return localStore.createDepartment(data);
  },

  async updateDepartment(id, updates) {
    if (isPrismaActive()) {
      return getPrisma().department.update({ where: { id }, data: updates });
    }
    return localStore.updateDepartment(id, updates);
  },

  async deleteDepartment(id) {
    if (isPrismaActive()) {
      await getPrisma().department.delete({ where: { id } });
      return true;
    }
    return localStore.deleteDepartment(id);
  },

  // --- SCHEDULES & LEAVES ---
  async getDoctorSchedules(doctorId) {
    if (isPrismaActive()) {
      return getPrisma().doctorSchedule.findMany({
        where: { doctorId },
        orderBy: { dayOfWeek: 'asc' },
      });
    }
    return localStore.getDoctorSchedules(doctorId);
  },

  async updateDoctorSchedules(doctorId, schedulesList) {
    if (isPrismaActive()) {
      await getPrisma().doctorSchedule.deleteMany({ where: { doctorId } });
      await getPrisma().doctorSchedule.createMany({
        data: schedulesList.map((s) => ({
          doctorId,
          dayOfWeek: Number(s.dayOfWeek),
          startTime: s.startTime,
          endTime: s.endTime,
          slotDurationMinutes: Number(s.slotDurationMinutes) || 30,
          isActive: s.isActive !== undefined ? s.isActive : true,
        })),
      });
      return this.getDoctorSchedules(doctorId);
    }
    return localStore.updateDoctorSchedules(doctorId, schedulesList);
  },

  async getDoctorLeaves(doctorId) {
    if (isPrismaActive()) {
      return getPrisma().doctorLeave.findMany({
        where: { doctorId },
        orderBy: { date: 'asc' },
      });
    }
    return localStore.getDoctorLeaves(doctorId);
  },

  async addDoctorLeave(doctorId, date, reason = '') {
    if (isPrismaActive()) {
      return getPrisma().doctorLeave.create({
        data: {
          doctorId,
          date: new Date(date),
          reason,
        },
      });
    }
    return localStore.addDoctorLeave(doctorId, date, reason);
  },

  async removeDoctorLeave(leaveId) {
    if (isPrismaActive()) {
      await getPrisma().doctorLeave.delete({ where: { id: leaveId } });
      return true;
    }
    return localStore.removeDoctorLeave(leaveId);
  },

  // --- APPOINTMENTS ---
  async getAllAppointments(filters = {}) {
    if (isPrismaActive()) {
      const where = {};
      if (filters.patientId) where.patientId = filters.patientId;
      if (filters.doctorId) where.doctorId = filters.doctorId;
      if (filters.status && filters.status !== 'ALL') where.status = filters.status;
      if (filters.date) where.date = new Date(filters.date);

      return getPrisma().appointment.findMany({
        where,
        include: {
          patient: true,
          doctor: { include: { department: true } },
        },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
      });
    }
    return localStore.getAllAppointments(filters);
  },

  async findAppointmentById(id) {
    if (isPrismaActive()) {
      return getPrisma().appointment.findFirst({
        where: { OR: [{ id }, { appointmentNumber: id }] },
        include: {
          patient: true,
          doctor: { include: { department: true } },
        },
      });
    }
    return localStore.findAppointmentById(id);
  },

  async findConflictingAppointment({ doctorId, patientId, date, startTime }) {
    if (isPrismaActive()) {
      const dateObj = new Date(date);
      // Check if doctor is already booked at that slot
      const doctorConflict = await getPrisma().appointment.findFirst({
        where: {
          doctorId,
          date: dateObj,
          startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (doctorConflict) return { conflictType: 'DOCTOR', appointment: doctorConflict };

      // Check if patient already has an appointment at that slot
      const patientConflict = await getPrisma().appointment.findFirst({
        where: {
          patientId,
          date: dateObj,
          startTime,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (patientConflict) return { conflictType: 'PATIENT', appointment: patientConflict };

      return null;
    }

    const dateStr = new Date(date).toISOString().split('T')[0];
    const docConflict = localStore.data.appointments.find(
      (a) =>
        a.doctorId === doctorId &&
        a.date.startsWith(dateStr) &&
        a.startTime === startTime &&
        (a.status === 'PENDING' || a.status === 'CONFIRMED')
    );
    if (docConflict) return { conflictType: 'DOCTOR', appointment: docConflict };

    const patConflict = localStore.data.appointments.find(
      (a) =>
        a.patientId === patientId &&
        a.date.startsWith(dateStr) &&
        a.startTime === startTime &&
        (a.status === 'PENDING' || a.status === 'CONFIRMED')
    );
    if (patConflict) return { conflictType: 'PATIENT', appointment: patConflict };

    return null;
  },

  async createAppointment(data) {
    if (isPrismaActive()) {
      const count = await getPrisma().appointment.count();
      const aptNumber = `MED-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
        count + 1
      ).padStart(4, '0')}`;

      const created = await getPrisma().appointment.create({
        data: {
          appointmentNumber: aptNumber,
          patientId: data.patientId,
          doctorId: data.doctorId,
          date: new Date(data.date),
          startTime: data.startTime,
          endTime: data.endTime,
          status: data.status || 'PENDING',
          reason: data.reason,
          notes: data.notes || null,
        },
        include: {
          patient: true,
          doctor: { include: { department: true } },
        },
      });
      return created;
    }
    return localStore.createAppointment(data);
  },

  async updateAppointment(id, updates) {
    if (isPrismaActive()) {
      return getPrisma().appointment.update({
        where: { id },
        data: updates,
        include: {
          patient: true,
          doctor: { include: { department: true } },
        },
      });
    }
    return localStore.updateAppointment(id, updates);
  },

  // --- PASSWORD RESETS ---
  async createPasswordReset(userId, token, expiresAt) {
    if (isPrismaActive()) {
      return getPrisma().passwordReset.create({
        data: { userId, token, expiresAt },
      });
    }
    return localStore.createPasswordReset(userId, token, expiresAt);
  },

  async findPasswordReset(token) {
    if (isPrismaActive()) {
      return getPrisma().passwordReset.findFirst({
        where: { token, used: false, expiresAt: { gt: new Date() } },
      });
    }
    return localStore.findPasswordReset(token);
  },

  async markPasswordResetUsed(id) {
    if (isPrismaActive()) {
      return getPrisma().passwordReset.update({
        where: { id },
        data: { used: true },
      });
    }
    return localStore.markPasswordResetUsed(id);
  },

  // --- AUDIT LOGS ---
  async createAuditLog(logData) {
    if (isPrismaActive()) {
      return getPrisma().auditLog.create({
        data: {
          userId: logData.userId || null,
          action: logData.action,
          entity: logData.entity,
          entityId: logData.entityId || null,
          details: logData.details || {},
          ipAddress: logData.ipAddress || null,
        },
      });
    }
    return localStore.createAuditLog(logData);
  },

  async getAuditLogs(limit = 50) {
    if (isPrismaActive()) {
      return getPrisma().auditLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    }
    return localStore.getAuditLogs(limit);
  },

  // --- DASHBOARD STATS ---
  async getAdminStats() {
    return localStore.getAdminStats();
  },

  async getDoctorStats(doctorId) {
    return localStore.getDoctorStats(doctorId);
  },

  async getPatientStats(patientId) {
    return localStore.getPatientStats(patientId);
  },
};
