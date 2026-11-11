import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initialAdmin,
  initialDepartments,
  initialDoctors,
  initialPatients,
  generateDefaultSchedules,
  initialAppointments,
} from '../../prisma/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/medibook_db.json');

class LocalStore {
  constructor() {
    this.data = {
      users: [],
      patients: [],
      departments: [],
      doctors: [],
      doctorSchedules: [],
      doctorLeaves: [],
      appointments: [],
      passwordResets: [],
      auditLogs: [],
    };
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.warn('[LocalStore] Warning loading data file, re-initializing seed data:', err.message);
      this.seedInitialData();
      this.save();
    }
  }

  seedInitialData() {
    // 1. Admin
    this.data.users = [
      {
        ...initialAdmin.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // 2. Departments
    this.data.departments = initialDepartments.map((d) => ({
      ...d,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // 3. Doctors & Schedules
    this.data.doctors = [];
    this.data.doctorSchedules = [];
    this.data.doctorLeaves = [];

    for (const d of initialDoctors) {
      this.data.users.push({
        ...d.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.data.doctors.push({
        ...d.doctor,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const schedules = generateDefaultSchedules(d.doctor.id).map((s) => ({
        ...s,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      this.data.doctorSchedules.push(...schedules);
    }

    // 4. Patients
    this.data.patients = [];
    for (const p of initialPatients) {
      this.data.users.push({
        ...p.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.data.patients.push({
        ...p.patient,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 5. Appointments
    this.data.appointments = initialAppointments.map((a) => ({
      ...a,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    this.data.passwordResets = [];
    this.data.auditLogs = [
      {
        id: 'log-01',
        userId: 'usr-admin-01',
        action: 'SYSTEM_INITIALIZED',
        entity: 'System',
        entityId: 'init',
        details: { message: 'MediBook database initialized with default seed data.' },
        createdAt: new Date().toISOString(),
      },
    ];
  }

  save() {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[LocalStore] Error saving store:', err.message);
    }
  }

  // --- User Operations ---
  findUserById(id) {
    return this.data.users.find((u) => u.id === id) || null;
  }

  findUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  createUser(userData) {
    const user = {
      id: userData.id || `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      role: userData.role || 'PATIENT',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = {
      ...this.data.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.users[idx];
  }

  // --- Patient Operations ---
  findPatientById(id) {
    return this.data.patients.find((p) => p.id === id) || null;
  }

  findPatientByUserId(userId) {
    return this.data.patients.find((p) => p.userId === userId) || null;
  }

  getAllPatients() {
    return this.data.patients.map((p) => {
      const user = this.findUserById(p.userId);
      const appointments = this.data.appointments.filter((a) => a.patientId === p.id);
      return {
        ...p,
        user: user ? { id: user.id, email: user.email, isActive: user.isActive } : null,
        totalAppointments: appointments.length,
      };
    });
  }

  createPatient(patientData) {
    const patient = {
      id: patientData.id || `pat-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: patientData.userId,
      fullName: patientData.fullName,
      phone: patientData.phone,
      dateOfBirth: patientData.dateOfBirth || null,
      gender: patientData.gender || null,
      bloodGroup: patientData.bloodGroup || null,
      address: patientData.address || null,
      emergencyContact: patientData.emergencyContact || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.patients.push(patient);
    this.save();
    return patient;
  }

  updatePatient(idOrUserId, updates) {
    const idx = this.data.patients.findIndex(
      (p) => p.id === idOrUserId || p.userId === idOrUserId
    );
    if (idx === -1) return null;
    this.data.patients[idx] = {
      ...this.data.patients[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.patients[idx];
  }

  // --- Doctor Operations ---
  findDoctorById(id) {
    const doc = this.data.doctors.find((d) => d.id === id) || null;
    if (!doc) return null;
    return this.populateDoctor(doc);
  }

  findDoctorByUserId(userId) {
    const doc = this.data.doctors.find((d) => d.userId === userId) || null;
    if (!doc) return null;
    return this.populateDoctor(doc);
  }

  populateDoctor(doc) {
    const dept = this.data.departments.find((dep) => dep.id === doc.departmentId) || null;
    const user = this.findUserById(doc.userId);
    const schedules = this.data.doctorSchedules.filter((s) => s.doctorId === doc.id);
    const leaves = this.data.doctorLeaves.filter((l) => l.doctorId === doc.id);
    return {
      ...doc,
      department: dept,
      user: user ? { id: user.id, email: user.email, isActive: user.isActive } : null,
      schedules,
      leaves,
    };
  }

  getAllDoctors(filters = {}) {
    let result = this.data.doctors.map((d) => this.populateDoctor(d));

    if (filters.departmentId) {
      result = result.filter((d) => d.departmentId === filters.departmentId);
    }
    if (filters.specialization) {
      const q = filters.specialization.toLowerCase();
      result = result.filter(
        (d) =>
          d.specialization.toLowerCase().includes(q) ||
          d.department?.name.toLowerCase().includes(q)
      );
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.department?.name.toLowerCase().includes(q)
      );
    }
    if (filters.isActive !== undefined) {
      result = result.filter((d) => d.isActive === filters.isActive);
    }
    if (filters.isApproved !== undefined) {
      result = result.filter((d) => d.isApproved === filters.isApproved);
    }
    if (filters.minExp) {
      result = result.filter((d) => d.experienceYears >= Number(filters.minExp));
    }
    if (filters.maxFee) {
      result = result.filter((d) => Number(d.consultationFee) <= Number(filters.maxFee));
    }

    return result;
  }

  createDoctor(doctorData) {
    const doctor = {
      id: doctorData.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: doctorData.userId,
      departmentId: doctorData.departmentId,
      fullName: doctorData.fullName,
      qualification: doctorData.qualification,
      specialization: doctorData.specialization,
      experienceYears: Number(doctorData.experienceYears) || 1,
      consultationFee: Number(doctorData.consultationFee) || 50,
      biography: doctorData.biography || '',
      roomNumber: doctorData.roomNumber || '',
      phone: doctorData.phone || '',
      avatarUrl: doctorData.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
      isApproved: doctorData.isApproved !== undefined ? doctorData.isApproved : true,
      isActive: doctorData.isActive !== undefined ? doctorData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.doctors.push(doctor);

    // Generate default weekly schedules for doctor
    const schedules = generateDefaultSchedules(doctor.id).map((s) => ({
      ...s,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.data.doctorSchedules.push(...schedules);

    this.save();
    return this.populateDoctor(doctor);
  }

  updateDoctor(id, updates) {
    const idx = this.data.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.doctors[idx] = {
      ...this.data.doctors[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.populateDoctor(this.data.doctors[idx]);
  }

  deleteDoctor(id) {
    const idx = this.data.doctors.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    const doc = this.data.doctors[idx];
    // Remove doctor schedules and leaves
    this.data.doctorSchedules = this.data.doctorSchedules.filter((s) => s.doctorId !== id);
    this.data.doctorLeaves = this.data.doctorLeaves.filter((l) => l.doctorId !== id);
    this.data.doctors.splice(idx, 1);
    // Deactivate associated user
    if (doc.userId) {
      this.updateUser(doc.userId, { isActive: false });
    }
    this.save();
    return true;
  }

  // --- Department Operations ---
  getAllDepartments(onlyActive = false) {
    let list = this.data.departments;
    if (onlyActive) {
      list = list.filter((d) => d.isActive);
    }
    return list.map((dept) => {
      const docs = this.data.doctors.filter(
        (doc) => doc.departmentId === dept.id && doc.isActive && doc.isApproved
      );
      return {
        ...dept,
        doctorsCount: docs.length,
        doctors: docs.map((d) => ({
          id: d.id,
          fullName: d.fullName,
          specialization: d.specialization,
          avatarUrl: d.avatarUrl,
          consultationFee: d.consultationFee,
        })),
      };
    });
  }

  findDepartmentById(id) {
    return this.data.departments.find((d) => d.id === id) || null;
  }

  findDepartmentByName(name) {
    return this.data.departments.find((d) => d.name.toLowerCase() === name.toLowerCase()) || null;
  }

  createDepartment(deptData) {
    const dept = {
      id: deptData.id || `dept-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: deptData.name,
      description: deptData.description,
      icon: deptData.icon || 'Activity',
      imageUrl: deptData.imageUrl || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
      isActive: deptData.isActive !== undefined ? deptData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.departments.push(dept);
    this.save();
    return dept;
  }

  updateDepartment(id, updates) {
    const idx = this.data.departments.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.departments[idx] = {
      ...this.data.departments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.departments[idx];
  }

  deleteDepartment(id) {
    const idx = this.data.departments.findIndex((d) => d.id === id);
    if (idx === -1) return false;
    this.data.departments.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Doctor Schedule & Leaves ---
  getDoctorSchedules(doctorId) {
    return this.data.doctorSchedules.filter((s) => s.doctorId === doctorId);
  }

  updateDoctorSchedules(doctorId, schedulesList) {
    // Replace existing schedules for doctor
    this.data.doctorSchedules = this.data.doctorSchedules.filter((s) => s.doctorId !== doctorId);
    const newSchedules = schedulesList.map((s) => ({
      id: s.id || `sched-${doctorId}-${s.dayOfWeek}`,
      doctorId,
      dayOfWeek: Number(s.dayOfWeek),
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMinutes: Number(s.slotDurationMinutes) || 30,
      isActive: s.isActive !== undefined ? s.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.data.doctorSchedules.push(...newSchedules);
    this.save();
    return newSchedules;
  }

  getDoctorLeaves(doctorId) {
    return this.data.doctorLeaves.filter((l) => l.doctorId === doctorId);
  }

  addDoctorLeave(doctorId, date, reason = '') {
    const dateStr = new Date(date).toISOString().split('T')[0];
    const existing = this.data.doctorLeaves.find(
      (l) => l.doctorId === doctorId && l.date.startsWith(dateStr)
    );
    if (existing) {
      return existing;
    }
    const leave = {
      id: `leave-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      doctorId,
      date: new Date(date).toISOString(),
      reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.doctorLeaves.push(leave);
    this.save();
    return leave;
  }

  removeDoctorLeave(leaveId) {
    const idx = this.data.doctorLeaves.findIndex((l) => l.id === leaveId);
    if (idx === -1) return false;
    this.data.doctorLeaves.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Appointments Operations ---
  populateAppointment(apt) {
    const patient = this.findPatientById(apt.patientId);
    const doctor = this.findDoctorById(apt.doctorId);
    return {
      ...apt,
      patient: patient
        ? {
            id: patient.id,
            fullName: patient.fullName,
            phone: patient.phone,
            gender: patient.gender,
            bloodGroup: patient.bloodGroup,
            dateOfBirth: patient.dateOfBirth,
          }
        : null,
      doctor: doctor
        ? {
            id: doctor.id,
            fullName: doctor.fullName,
            specialization: doctor.specialization,
            qualification: doctor.qualification,
            consultationFee: doctor.consultationFee,
            roomNumber: doctor.roomNumber,
            avatarUrl: doctor.avatarUrl,
            department: doctor.department,
          }
        : null,
    };
  }

  findAppointmentById(id) {
    const apt = this.data.appointments.find((a) => a.id === id || a.appointmentNumber === id);
    if (!apt) return null;
    return this.populateAppointment(apt);
  }

  getAllAppointments(filters = {}) {
    let result = this.data.appointments;

    if (filters.patientId) {
      result = result.filter((a) => a.patientId === filters.patientId);
    }
    if (filters.doctorId) {
      result = result.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters.status && filters.status !== 'ALL') {
      result = result.filter((a) => a.status === filters.status);
    }
    if (filters.date) {
      const dStr = new Date(filters.date).toISOString().split('T')[0];
      result = result.filter((a) => a.date.startsWith(dStr));
    }

    result.sort((a, b) => new Date(b.date + 'T' + b.startTime) - new Date(a.date + 'T' + a.startTime));
    return result.map((a) => this.populateAppointment(a));
  }

  createAppointment(data) {
    const aptNumber = `MED-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
      this.data.appointments.length + 1
    ).padStart(4, '0')}`;

    const appointment = {
      id: data.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      appointmentNumber: aptNumber,
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: new Date(data.date).toISOString(),
      startTime: data.startTime,
      endTime: data.endTime,
      status: data.status || 'PENDING',
      reason: data.reason,
      notes: data.notes || null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.appointments.push(appointment);
    this.save();
    return this.populateAppointment(appointment);
  }

  updateAppointment(id, updates) {
    const idx = this.data.appointments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.appointments[idx] = {
      ...this.data.appointments[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.populateAppointment(this.data.appointments[idx]);
  }

  // --- Password Resets ---
  createPasswordReset(userId, token, expiresAt) {
    const reset = {
      id: `pr-${Date.now()}`,
      userId,
      token,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    };
    this.data.passwordResets.push(reset);
    this.save();
    return reset;
  }

  findPasswordReset(token) {
    return this.data.passwordResets.find((r) => r.token === token && !r.used) || null;
  }

  markPasswordResetUsed(id) {
    const idx = this.data.passwordResets.findIndex((r) => r.id === id);
    if (idx !== -1) {
      this.data.passwordResets[idx].used = true;
      this.save();
    }
  }

  // --- Audit Logs ---
  createAuditLog(logData) {
    const log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId: logData.userId || null,
      action: logData.action,
      entity: logData.entity,
      entityId: logData.entityId || null,
      details: logData.details || null,
      ipAddress: logData.ipAddress || null,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs.pop();
    }
    this.save();
    return log;
  }

  getAuditLogs(limit = 50) {
    return this.data.auditLogs.slice(0, limit);
  }

  // --- Metrics for Dashboards ---
  getAdminStats() {
    const totalPatients = this.data.patients.length;
    const totalDoctors = this.data.doctors.filter((d) => d.isActive).length;
    const totalDepartments = this.data.departments.filter((d) => d.isActive).length;
    const totalAppointments = this.data.appointments.length;
    const pendingAppointments = this.data.appointments.filter((a) => a.status === 'PENDING').length;
    const confirmedAppointments = this.data.appointments.filter((a) => a.status === 'CONFIRMED').length;
    const completedAppointments = this.data.appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelledAppointments = this.data.appointments.filter((a) => a.status === 'CANCELLED').length;

    // Estimate revenue based on completed and confirmed appointments
    const revenue = this.data.appointments
      .filter((a) => a.status === 'COMPLETED' || a.status === 'CONFIRMED')
      .reduce((sum, a) => {
        const doc = this.data.doctors.find((d) => d.id === a.doctorId);
        return sum + (doc ? Number(doc.consultationFee) : 50);
      }, 0);

    return {
      totalPatients,
      totalDoctors,
      totalDepartments,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      estimatedRevenue: revenue,
    };
  }

  getDoctorStats(doctorId) {
    const apts = this.data.appointments.filter((a) => a.doctorId === doctorId);
    const today = new Date().toISOString().split('T')[0];

    const total = apts.length;
    const todayApts = apts.filter((a) => a.date.startsWith(today)).length;
    const pending = apts.filter((a) => a.status === 'PENDING').length;
    const confirmed = apts.filter((a) => a.status === 'CONFIRMED').length;
    const completed = apts.filter((a) => a.status === 'COMPLETED').length;

    // Unique patients count
    const uniquePatients = new Set(apts.map((a) => a.patientId)).size;

    return {
      total,
      today: todayApts,
      pending,
      confirmed,
      completed,
      uniquePatients,
    };
  }

  getPatientStats(patientId) {
    const apts = this.data.appointments.filter((a) => a.patientId === patientId);
    const today = new Date();
    const upcoming = apts.filter(
      (a) =>
        (a.status === 'CONFIRMED' || a.status === 'PENDING') &&
        new Date(a.date) >= new Date(today.toISOString().split('T')[0])
    );
    const completed = apts.filter((a) => a.status === 'COMPLETED');
    const cancelled = apts.filter((a) => a.status === 'CANCELLED' || a.status === 'REJECTED');

    upcoming.sort((a, b) => new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime));
    const nextAppointment = upcoming.length > 0 ? this.populateAppointment(upcoming[0]) : null;

    return {
      total: apts.length,
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      cancelledCount: cancelled.length,
      nextAppointment,
    };
  }
}

export const localStore = new LocalStore();
