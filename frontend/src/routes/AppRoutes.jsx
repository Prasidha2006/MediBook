import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import DashboardLayout from '../components/layout/DashboardLayout';

// Public pages
import HomePage from '../pages/public/HomePage';
import DoctorsPage from '../pages/public/DoctorsPage';
import DoctorDetailPage from '../pages/public/DoctorDetailPage';
import DepartmentsPage from '../pages/public/DepartmentsPage';
import ContactPage from '../pages/public/ContactPage';
import AboutPage from '../pages/public/AboutPage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

// Patient pages
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import BookAppointmentPage from '../pages/patient/BookAppointmentPage';
import PatientAppointmentsPage from '../pages/patient/PatientAppointmentsPage';
import PatientAppointmentDetailPage from '../pages/patient/PatientAppointmentDetailPage';
import PatientProfilePage from '../pages/patient/PatientProfilePage';
import PatientSettingsPage from '../pages/patient/PatientSettingsPage';

// Doctor pages
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import DoctorAppointmentsPage from '../pages/doctor/DoctorAppointmentsPage';
import DoctorCalendarPage from '../pages/doctor/DoctorCalendarPage';
import DoctorAvailabilityPage from '../pages/doctor/DoctorAvailabilityPage';
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage';
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage';

// Admin pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage';
import AdminPatientsPage from '../pages/admin/AdminPatientsPage';
import AdminDepartmentsPage from '../pages/admin/AdminDepartmentsPage';
import AdminAppointmentsPage from '../pages/admin/AdminAppointmentsPage';
import AdminSchedulesPage from '../pages/admin/AdminSchedulesPage';
import AdminSettingsPage from '../pages/admin/AdminSettingsPage';

// Public Layout Wrapper
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-healthcare-bg">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/doctors"
        element={
          <PublicLayout>
            <DoctorsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/doctors/:id"
        element={
          <PublicLayout>
            <DoctorDetailPage />
          </PublicLayout>
        }
      />
      <Route
        path="/departments"
        element={
          <PublicLayout>
            <DepartmentsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        }
      />
      <Route
        path="/about"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />

      {/* Auth Pages */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />
      <Route
        path="/register"
        element={
          <PublicLayout>
            <RegisterPage />
          </PublicLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicLayout>
            <ForgotPasswordPage />
          </PublicLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicLayout>
            <ResetPasswordPage />
          </PublicLayout>
        }
      />

      {/* Patient Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/patient" element={<DashboardLayout role="PATIENT" />}>
          <Route index element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="dashboard" element={<PatientDashboardPage />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<PatientAppointmentsPage />} />
          <Route path="appointments/:id" element={<PatientAppointmentDetailPage />} />
          <Route path="profile" element={<PatientProfilePage />} />
          <Route path="settings" element={<PatientSettingsPage />} />
        </Route>
      </Route>

      {/* Doctor Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
        <Route path="/doctor" element={<DashboardLayout role="DOCTOR" />}>
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="calendar" element={<DoctorCalendarPage />} />
          <Route path="availability" element={<DoctorAvailabilityPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
        </Route>
      </Route>

      {/* Admin Dashboard Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<DashboardLayout role="ADMIN" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="departments" element={<AdminDepartmentsPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="schedules" element={<AdminSchedulesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
