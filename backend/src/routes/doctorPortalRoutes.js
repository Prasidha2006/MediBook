import { Router } from 'express';
import { doctorPortalController } from '../controllers/doctorPortalController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  doctorAvailabilitySchema,
  doctorLeaveSchema,
  updateDoctorProfileSchema,
} from '../validators/index.js';

const router = Router();

// Restricted to DOCTOR role (or ADMIN)
router.use(authenticate, authorize('DOCTOR', 'ADMIN'));

router.get('/dashboard', doctorPortalController.getDashboard);
router.get('/appointments', doctorPortalController.getDoctorAppointments);
router.patch('/appointments/:id/status', doctorPortalController.updateAppointmentStatus);
router.get('/availability', doctorPortalController.getAvailability);
router.post(
  '/availability',
  validate(doctorAvailabilitySchema),
  doctorPortalController.updateAvailability
);
router.post('/leaves', validate(doctorLeaveSchema), doctorPortalController.addLeave);
router.delete('/leaves/:id', doctorPortalController.deleteLeave);
router.get('/patients', doctorPortalController.getDoctorPatients);
router.patch(
  '/profile',
  validate(updateDoctorProfileSchema),
  doctorPortalController.updateProfile
);

export default router;
