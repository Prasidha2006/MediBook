import { dataService } from '../services/dataService.js';
import { hashPassword } from '../utils/auth.js';

export const adminController = {
  // Overall system metrics
  async getDashboard(req, res, next) {
    try {
      const stats = await dataService.getAdminStats();
      const recentLogs = await dataService.getAuditLogs(10);
      const recentAppointments = await dataService.getAllAppointments({});

      return res.status(200).json({
        success: true,
        data: {
          stats,
          recentLogs,
          recentAppointments: recentAppointments.slice(0, 8),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Doctors list for admin
  async getDoctors(req, res, next) {
    try {
      const { search, departmentId } = req.query;
      const doctors = await dataService.getAllDoctors({
        search,
        departmentId,
      });

      return res.status(200).json({
        success: true,
        data: doctors,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin creates a new Doctor
  async createDoctor(req, res, next) {
    try {
      const {
        email,
        password = 'Doctor@123',
        fullName,
        departmentId,
        qualification,
        specialization,
        experienceYears,
        consultationFee,
        biography,
        roomNumber,
        phone,
        avatarUrl,
        isApproved = true,
        isActive = true,
      } = req.body;

      // Check existing email
      const existing = await dataService.findUserByEmail(email);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create User
      const user = await dataService.createUser({
        email: email.toLowerCase(),
        passwordHash,
        role: 'DOCTOR',
        isActive,
      });

      // Create Doctor profile
      const doctor = await dataService.createDoctor({
        userId: user.id,
        departmentId,
        fullName,
        qualification,
        specialization,
        experienceYears: Number(experienceYears) || 1,
        consultationFee: Number(consultationFee) || 50,
        biography,
        roomNumber,
        phone,
        avatarUrl:
          avatarUrl ||
          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
        isApproved,
        isActive,
      });

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DOCTOR_CREATED',
        entity: 'Doctor',
        entityId: doctor.id,
        details: { fullName, email, departmentId },
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Doctor profile created successfully.',
        data: doctor,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin updates doctor
  async updateDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const doctor = await dataService.findDoctorById(id);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found.',
        });
      }

      const updated = await dataService.updateDoctor(id, updates);

      // If isActive updated, also sync user record
      if (updates.isActive !== undefined && doctor.userId) {
        await dataService.updateUser(doctor.userId, { isActive: updates.isActive });
      }

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DOCTOR_UPDATED',
        entity: 'Doctor',
        entityId: id,
        details: updates,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Doctor updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin deletes doctor
  async deleteDoctor(req, res, next) {
    try {
      const { id } = req.params;
      const success = await dataService.deleteDoctor(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Doctor not found.',
        });
      }

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DOCTOR_DELETED',
        entity: 'Doctor',
        entityId: id,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Doctor profile removed and account deactivated.',
      });
    } catch (err) {
      next(err);
    }
  },

  // Patients list for admin
  async getPatients(req, res, next) {
    try {
      const patients = await dataService.getAllPatients();
      return res.status(200).json({
        success: true,
        data: patients,
      });
    } catch (err) {
      next(err);
    }
  },

  // Appointments master list for admin
  async getAppointments(req, res, next) {
    try {
      const { status, doctorId, patientId, date } = req.query;
      const appointments = await dataService.getAllAppointments({
        status,
        doctorId,
        patientId,
        date,
      });

      return res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  },

  // Admin updates appointment status
  async updateAppointmentStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const updated = await dataService.updateAppointment(id, {
        status,
        ...(notes && { notes }),
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found.',
        });
      }

      await dataService.createAuditLog({
        userId: req.user.id,
        action: `ADMIN_APPOINTMENT_STATUS_${status}`,
        entity: 'Appointment',
        entityId: id,
        details: { status },
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: `Appointment status updated to ${status}.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Department CRUD
  async createDepartment(req, res, next) {
    try {
      const { name, description, icon, imageUrl, isActive } = req.body;

      const existing = await dataService.findDepartmentByName(name);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A department with this name already exists.',
        });
      }

      const dept = await dataService.createDepartment({
        name,
        description,
        icon,
        imageUrl,
        isActive,
      });

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DEPARTMENT_CREATED',
        entity: 'Department',
        entityId: dept.id,
        details: { name },
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Department created successfully.',
        data: dept,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await dataService.updateDepartment(id, updates);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Department not found.',
        });
      }

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DEPARTMENT_UPDATED',
        entity: 'Department',
        entityId: id,
        details: updates,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Department updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteDepartment(req, res, next) {
    try {
      const { id } = req.params;
      const success = await dataService.deleteDepartment(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Department not found.',
        });
      }

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DEPARTMENT_DELETED',
        entity: 'Department',
        entityId: id,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Department deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  // Audit logs
  async getAuditLogs(req, res, next) {
    try {
      const logs = await dataService.getAuditLogs(100);
      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (err) {
      next(err);
    }
  },
};
