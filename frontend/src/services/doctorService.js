import api from './api';

export const doctorService = {
  async getDoctors(params = {}) {
    const res = await api.get('/doctors', { params });
    return res.data;
  },

  async getDoctorById(id) {
    const res = await api.get(`/doctors/${id}`);
    return res.data;
  },

  async getDoctorSlots(id, date) {
    const res = await api.get(`/doctors/${id}/slots`, { params: { date } });
    return res.data;
  },

  async getDoctorSchedule(id) {
    const res = await api.get(`/doctors/${id}/schedule`);
    return res.data;
  },

  // Doctor Portal endpoints
  async getDoctorDashboard() {
    const res = await api.get('/doctor/dashboard');
    return res.data;
  },

  async getDoctorAppointments(params = {}) {
    const res = await api.get('/doctor/appointments', { params });
    return res.data;
  },

  async updateAppointmentStatus(id, data) {
    const res = await api.patch(`/doctor/appointments/${id}/status`, data);
    return res.data;
  },

  async getDoctorAvailability() {
    const res = await api.get('/doctor/availability');
    return res.data;
  },

  async updateDoctorAvailability(schedules) {
    const res = await api.post('/doctor/availability', { schedules });
    return res.data;
  },

  async addLeave(leaveData) {
    const res = await api.post('/doctor/leaves', leaveData);
    return res.data;
  },

  async deleteLeave(id) {
    const res = await api.delete(`/doctor/leaves/${id}`);
    return res.data;
  },

  async getDoctorPatients() {
    const res = await api.get('/doctor/patients');
    return res.data;
  },

  async updateDoctorProfile(profileData) {
    const res = await api.patch('/doctor/profile', profileData);
    return res.data;
  },
};
