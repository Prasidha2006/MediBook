import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { appointmentBookingSchema } from '../validators/index.js';

const router = Router();

// Protected appointment routes
router.use(authenticate);

router.post(
  '/',
  authorize('PATIENT'),
  validate(appointmentBookingSchema),
  appointmentController.createAppointment
);

router.get('/my', authorize('PATIENT'), appointmentController.getMyAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.patch('/:id/cancel', appointmentController.cancelAppointment);

export default router;
