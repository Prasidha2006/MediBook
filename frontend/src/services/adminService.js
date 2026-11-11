import api from './api';

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  // Doctors
  async getDoctors(params = {}) {
    const res = await api.get('/admin/doctors', { params });
    return res.data;
  },

  async createDoctor(data) {
    const res = await api.post('/admin/doctors', data);
    return res.data;
  },

  async updateDoctor(id, data) {
    const res = await api.patch(`/admin/doctors/${id}`, data);
    return res.data;
  },

  async deleteDoctor(id) {
    const res = await api.delete(`/admin/doctors/${id}`);
    return res.data;
  },

  // Patients
  async getPatients() {
    const res = await api.get('/admin/patients');
    return res.data;
  },

  // Appointments
  async getAppointments(params = {}) {
    const res = await api.get('/admin/appointments', { params });
    return res.data;
  },

  async updateAppointmentStatus(id, data) {
    const res = await api.patch(`/admin/appointments/${id}/status`, data);
    return res.data;
  },

  // Departments
  async createDepartment(data) {
    const res = await api.post('/admin/departments', data);
    return res.data;
  },

  async updateDepartment(id, data) {
    const res = await api.patch(`/admin/departments/${id}`, data);
    return res.data;
  },

  async deleteDepartment(id) {
    const res = await api.delete(`/admin/departments/${id}`);
    return res.data;
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await api.get('/admin/audit-logs');
    return res.data;
  },
};
