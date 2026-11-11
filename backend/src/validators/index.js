import { z } from 'zod';

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid contact phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid registered email'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const appointmentBookingSchema = z.object({
  doctorId: z.string().min(1, 'Doctor selection is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be formatted as HH:mm'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be formatted as HH:mm'),
  reason: z.string().min(5, 'Please provide the medical reason or symptoms for the consultation'),
});

export const doctorAvailabilitySchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      slotDurationMinutes: z.number().int().min(10).max(120).default(30),
      isActive: z.boolean().default(true),
    })
  ),
});

export const doctorLeaveSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Leave date must be YYYY-MM-DD'),
  reason: z.string().optional().default('Personal leave'),
});

export const adminCreateDoctorSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Initial password must be at least 6 characters').default('Doctor@123'),
  fullName: z.string().min(2, 'Full name is required'),
  departmentId: z.string().min(1, 'Department is required'),
  qualification: z.string().min(2, 'Qualification is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  experienceYears: z.number().int().min(0).default(1),
  consultationFee: z.number().positive().default(50),
  biography: z.string().min(10, 'Biography should be at least 10 characters'),
  roomNumber: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isApproved: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateDoctorProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  qualification: z.string().min(2).optional(),
  specialization: z.string().min(2).optional(),
  experienceYears: z.number().int().min(0).optional(),
  consultationFee: z.number().positive().optional(),
  biography: z.string().optional(),
  roomNumber: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  icon: z.string().optional().default('Activity'),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updatePatientProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
});
