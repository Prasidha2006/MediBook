import api from './api';

export const departmentService = {
  async getDepartments(all = false) {
    const res = await api.get('/departments', { params: { all } });
    return res.data;
  },

  async getDepartmentById(id) {
    const res = await api.get(`/departments/${id}`);
    return res.data;
  },
};
