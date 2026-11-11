import { Router } from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import doctorPortalRoutes from './doctorPortalRoutes.js';
import adminRoutes from './adminRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import patientRoutes from './patientRoutes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'MediBook Hospital Appointment API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/doctors', doctorRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/doctor', doctorPortalRoutes);
router.use('/admin', adminRoutes);
router.use('/departments', departmentRoutes);
router.use('/patient', patientRoutes);

export default router;
