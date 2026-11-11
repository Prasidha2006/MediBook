import api from './api';

export const patientService = {
  async getDashboard() {
    const res = await api.get('/patient/dashboard');
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/patient/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/patient/profile', data);
    return res.data;
  },

  async changePassword(data) {
    const res = await api.post('/patient/change-password', data);
    return res.data;
  },
};
