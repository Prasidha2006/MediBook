import { dataService } from '../services/dataService.js';
import { hashPassword, comparePassword } from '../utils/auth.js';

export const patientController = {
  // Patient Dashboard Stats & Next Appointment
  async getDashboard(req, res, next) {
    try {
      const patientId = req.patient?.id;
      if (!patientId) {
        return res.status(403).json({
          success: false,
          message: 'Patient profile not found.',
        });
      }

      const stats = await dataService.getPatientStats(patientId);
      const recentAppointments = await dataService.getAllAppointments({
        patientId,
      });

      return res.status(200).json({
        success: true,
        data: {
          patient: req.patient,
          stats,
          recentAppointments: recentAppointments.slice(0, 5),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Get current patient profile
  async getProfile(req, res, next) {
    try {
      const patientId = req.patient?.id;
      const patient = await dataService.findPatientById(patientId);

      return res.status(200).json({
        success: true,
        data: {
          ...patient,
          email: req.user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Update patient personal profile
  async updateProfile(req, res, next) {
    try {
      const patientId = req.patient?.id;
      const updates = req.body;

      const updated = await dataService.updatePatient(patientId, updates);

      await dataService.createAuditLog({
        userId: req.user.id,
        action: 'PATIENT_PROFILE_UPDATED',
        entity: 'Patient',
        entityId: patientId,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Your personal health profile has been updated.',
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  // Update password
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await dataService.findUserById(req.user.id);
      const isMatch = await comparePassword(currentPassword, user.passwordHash);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Incorrect current password.',
        });
      }

      const passwordHash = await hashPassword(newPassword);
      await dataService.updateUser(user.id, { passwordHash });

      await dataService.createAuditLog({
        userId: user.id,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: user.id,
        ipAddress: req.ip,
      });

      return res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};
