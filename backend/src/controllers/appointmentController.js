import { dataService } from '../services/dataService.js';
import { slotService } from '../services/slotService.js';

export const appointmentController = {
  // Create an appointment (Booking)
  async createAppointment(req, res, next) {
    try {
      const { doctorId, date, startTime, endTime, reason } = req.body;
      const patientId = req.patient?.id;

      if (!patientId) {
        return res.status(403).json({
          success: false,
          message: 'Only registered patients can book medical appointments.',
        });
      }

      // 1. Verify doctor status
      const doctor = await dataService.findDoctorById(doctorId);
      if (!doctor || !doctor.isActive || !doctor.isApproved) {
        return res.status(400).json({
          success: false,
          message: 'The selected doctor is currently not available for new bookings.',
        });
      }

      // 2. Verify date is not in past
      const todayStr = new Date().toISOString().split('T')[0];
      if (date < todayStr) {
        return res.status(400).json({
          success: false,
          message: 'Cannot schedule consultations for past dates.',
        });
      }

      // 3. Double-check doctor leave
      const leaves = await dataService.getDoctorLeaves(doctorId);
      const isOnLeave = leaves.some((l) => new Date(l.date).toISOString().split('T')[0] === date);
      if (isOnLeave) {
        return res.status(400).json({
          success: false,
          message: 'The doctor is on approved leave on the selected date.',
        });
      }

      // 4. Overlap & Double-booking prevention
      const conflict = await dataService.findConflictingAppointment({
        doctorId,
        patientId,
        date,
        startTime,
      });

      if (conflict) {
        if (conflict.conflictType === 'DOCTOR') {
          return res.status(409).json({
            success: false,
            message: 'This time slot was just booked by another patient. Please choose another slot.',
          });
        } else if (conflict.conflictType === 'PATIENT') {
          return res.status(409).json({
            success: false,
            message: 'You already have another active appointment scheduled at this time.',
          });
        }
      }

      // 5. Create Appointment
      const appointment = await dataService.createAppointment({
        patientId,
        doctorId,
        date,
        startTime,
        endTime,
        reason,
        status: 'PENDING',
      });

      // 6. Audit log
      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'APPOINTMENT_CREATED',
        entity: 'Appointment',
        entityId: appointment.id,
        details: {
          appointmentNumber: appointment.appointmentNumber,
          doctorId,
          date,
          startTime,
        },
        ipAddress: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Your appointment has been successfully requested!',
        data: appointment,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get current patient's appointments
  async getMyAppointments(req, res, next) {
    try {
      const patientId = req.patient?.id;
      if (!patientId) {
        return res.status(403).json({
          success: false,
          message: 'Patient profile not found.',
        });
      }

      const { status } = req.query;
      const appointments = await dataService.getAllAppointments({
        patientId,
        status,
      });

      return res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get single appointment details
  async getAppointmentById(req, res, next) {
    try {
      const { id } = req.params;
      const appointment = await dataService.findAppointmentById(id);

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found.',
        });
      }

      // Security authorization check:
      // Must be the patient who booked it, the assigned doctor, or an admin
      const isOwnerPatient = req.patient && appointment.patientId === req.patient.id;
      const isAssignedDoctor = req.doctor && appointment.doctorId === req.doctor.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have authorization to view this appointment.',
        });
      }

      return res.status(200).json({
        success: true,
        data: appointment,
      });
    } catch (err) {
      next(err);
    }
  },

  // Patient cancels appointment
  async cancelAppointment(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await dataService.findAppointmentById(id);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment record not found.',
        });
      }

      // Authorization
      const isOwnerPatient = req.patient && appointment.patientId === req.patient.id;
      const isAdmin = req.user.role === 'ADMIN';

      if (!isOwnerPatient && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to cancel this appointment.',
        });
      }

      // Eligibility check
      if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: `Appointment is already marked as ${appointment.status.toLowerCase()} and cannot be cancelled.`,
        });
      }

      const updated = await dataService.updateAppointment(id, {
        status: 'CANCELLED',
        cancellationReason: reason || 'Cancelled by patient',
      });

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'APPOINTMENT_CANCELLED',
        entity: 'Appointment',
        entityId: id,
        details: { reason },
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Appointment has been successfully cancelled.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
