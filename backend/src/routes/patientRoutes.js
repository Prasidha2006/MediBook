import { Router } from 'express';
import { patientController } from '../controllers/patientController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updatePatientProfileSchema } from '../validators/index.js';

const router = Router();

// Strictly restricted to PATIENT role
router.use(authenticate, authorize('PATIENT'));

router.get('/dashboard', patientController.getDashboard);
router.get('/profile', patientController.getProfile);
router.patch('/profile', validate(updatePatientProfileSchema), patientController.updateProfile);
router.post('/change-password', patientController.changePassword);

export default router;
