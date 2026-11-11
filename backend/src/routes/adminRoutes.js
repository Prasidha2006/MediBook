import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminCreateDoctorSchema,
  updateDoctorProfileSchema,
  departmentSchema,
} from '../validators/index.js';

const router = Router();

// Strictly restricted to ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/doctors', adminController.getDoctors);
router.post('/doctors', validate(adminCreateDoctorSchema), adminController.createDoctor);
router.patch('/doctors/:id', validate(updateDoctorProfileSchema), adminController.updateDoctor);
router.delete('/doctors/:id', adminController.deleteDoctor);

router.get('/patients', adminController.getPatients);
router.get('/appointments', adminController.getAppointments);
router.patch('/appointments/:id/status', adminController.updateAppointmentStatus);

router.post('/departments', validate(departmentSchema), adminController.createDepartment);
router.patch('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

router.get('/audit-logs', adminController.getAuditLogs);

export default router;
