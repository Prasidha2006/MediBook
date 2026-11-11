import { dataService } from '../services/dataService.js';

export const doctorPortalController = {
  // Doctor Dashboard Overview
  async getDashboard(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      if (!doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile not associated with this account.',
        });
      }

      const stats = await dataService.getDoctorStats(doctorId);
      const today = new Date().toISOString().split('T')[0];

      // Get upcoming 5 appointments
      const upcoming = await dataService.getAllAppointments({
        doctorId,
      });

      const pendingList = upcoming.filter((a) => a.status === 'PENDING').slice(0, 5);
      const upcomingConfirmed = upcoming
        .filter((a) => a.status === 'CONFIRMED' && a.date >= today)
        .slice(0, 5);

      return res.status(200).json({
        success: true,
        data: {
          doctor: req.doctor,
          stats,
          pendingRequests: pendingList,
          upcomingConfirmed,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Doctor view all appointments
  async getDoctorAppointments(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      if (!doctorId) {
        return res.status(403).json({
          success: false,
          message: 'Doctor profile required.',
        });
      }

      const { status, date } = req.query;
      const appointments = await dataService.getAllAppointments({
        doctorId,
        status,
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

  // Doctor updates appointment status: CONFIRMED, REJECTED, COMPLETED, CANCELLED
  async updateAppointmentStatus(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const { id } = req.params;
      const { status, notes, rejectionReason } = req.body;

      const allowedStatuses = ['CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`,
        });
      }

      const appointment = await dataService.findAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found.',
        });
      }

      if (appointment.doctorId !== doctorId && req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'You can only update appointments assigned to you.',
        });
      }

      const updates = { status };
      if (notes !== undefined) updates.notes = notes;
      if (rejectionReason !== undefined) updates.cancellationReason = rejectionReason;

      const updated = await dataService.updateAppointment(id, updates);

      await dataService.createAuditLog({
        userId: req.user.id,
        action: `APPOINTMENT_${status}`,
        entity: 'Appointment',
        entityId: id,
        details: { status, notes, rejectionReason },
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: `Appointment has been updated to ${status}.`,
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get doctor availability schedules and leaves
  async getAvailability(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const schedules = await dataService.getDoctorSchedules(doctorId);
      const leaves = await dataService.getDoctorLeaves(doctorId);

      return res.status(200).json({
        success: true,
        data: {
          schedules,
          leaves,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Save weekly recurring schedule
  async updateAvailability(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const { schedules } = req.body;

      if (!Array.isArray(schedules)) {
        return res.status(400).json({
          success: false,
          message: 'Schedules must be provided as an array.',
        });
      }

      const updated = await dataService.updateDoctorSchedules(doctorId, schedules);

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DOCTOR_SCHEDULE_UPDATED',
        entity: 'DoctorSchedule',
        entityId: doctorId,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Weekly schedule updated successfully.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Add a scheduled leave date
  async addLeave(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const { date, reason } = req.body;

      const leave = await dataService.addDoctorLeave(doctorId, date, reason);

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'DOCTOR_LEAVE_ADDED',
        entity: 'DoctorLeave',
        entityId: leave.id,
        details: { date, reason },
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Leave date recorded successfully.',
        data: leave,
      });
    } catch (err) {
      next(err);
    }
  },

  // Delete leave date
  async deleteLeave(req, res, next) {
    try {
      const { id } = req.params;
      const success = await dataService.removeDoctorLeave(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Leave record not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Leave date removed successfully.',
      });
    } catch (err) {
      next(err);
    }
  },

  // Get list of unique patients seen or scheduled
  async getDoctorPatients(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const appointments = await dataService.getAllAppointments({ doctorId });

      const patientMap = new Map();
      for (const apt of appointments) {
        if (apt.patient && !patientMap.has(apt.patient.id)) {
          patientMap.set(apt.patient.id, {
            ...apt.patient,
            totalVisits: 1,
            lastVisit: apt.date,
            lastStatus: apt.status,
            lastReason: apt.reason,
          });
        } else if (apt.patient) {
          const entry = patientMap.get(apt.patient.id);
          entry.totalVisits += 1;
        }
      }

      return res.status(200).json({
        success: true,
        data: Array.from(patientMap.values()),
      });
    } catch (err) {
      next(err);
    }
  },

  // Update doctor personal profile
  async updateProfile(req, res, next) {
    try {
      const doctorId = req.doctor?.id;
      const updates = req.body;

      // Prevent doctor from changing their approval status directly
      delete updates.isApproved;
      delete updates.id;
      delete updates.userId;

      const updatedDoctor = await dataService.updateDoctor(doctorId, updates);

      return res.status(200).json({
        success: true,
        message: 'Doctor profile updated successfully.',
        data: updatedDoctor,
      });
    } catch (err) {
      next(err);
    }
  },
};
