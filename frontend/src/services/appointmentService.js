import api from './api';

export const appointmentService = {
  async bookAppointment(data) {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async getMyAppointments(status = 'ALL') {
    const params = status && status !== 'ALL' ? { status } : {};
    const res = await api.get('/appointments/my', { params });
    return res.data;
  },

  async getAppointmentById(id) {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  async cancelAppointment(id, reason) {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },
};
