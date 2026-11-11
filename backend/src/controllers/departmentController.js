import { dataService } from '../services/dataService.js';

export const departmentController = {
  async getDepartments(req, res, next) {
    try {
      const { all } = req.query;
      const departments = await dataService.getAllDepartments(!all);
      return res.status(200).json({
        success: true,
        data: departments,
      });
    } catch (err) {
      next(err);
    }
  },

  async getDepartmentById(req, res, next) {
    try {
      const { id } = req.params;
      const department = await dataService.findDepartmentById(id);

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found.',
        });
      }

      return res.status(200).json({
        success: true,
        data: department,
      });
    } catch (err) {
      next(err);
    }
  },
};
