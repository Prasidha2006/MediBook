import { Router } from 'express';
import { doctorController } from '../controllers/doctorController.js';

const router = Router();

// Public Doctor endpoints
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/slots', doctorController.getDoctorSlots);
router.get('/:id/schedule', doctorController.getDoctorSchedule);

export default router;
