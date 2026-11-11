import { dataService } from '../services/dataService.js';
import { slotService } from '../services/slotService.js';

export const doctorController = {
  // Public listing
  async getDoctors(req, res, next) {
    try {
      const {
        departmentId,
        specialization,
        search,
        minExp,
        maxFee,
        page = 1,
        limit = 12,
      } = req.query;

      const allDoctors = await dataService.getAllDoctors({
        departmentId,
        specialization,
        search,
        minExp,
        maxFee,
        isActive: true,
        isApproved: true,
      });

      // Pagination
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 12;
      const startIndex = (pageNum - 1) * limitNum;
      const paginated = allDoctors.slice(startIndex, startIndex + limitNum);

      return res.status(200).json({
        success: true,
        data: paginated,
        pagination: {
          total: allDoctors.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(allDoctors.length / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Public doctor profile
  async getDoctorById(req, res, next) {
    try {
      const { id } = req.params;
      const doctor = await dataService.findDoctorById(id);

      if (!doctor || !doctor.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Doctor profile not found or is currently inactive.',
        });
      }

      return res.status(200).json({
        success: true,
        data: doctor,
      });
    } catch (err) {
      next(err);
    }
  },

  // Calculate real-time available time slots for a given date
  async getDoctorSlots(req, res, next) {
    try {
      const { id } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date query parameter (YYYY-MM-DD) is required to calculate slots.',
        });
      }

      const slotData = await slotService.getDoctorSlotsForDate(id, date);

      return res.status(200).json({
        success: true,
        data: slotData,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get weekly recurring schedule and active leaves
  async getDoctorSchedule(req, res, next) {
    try {
      const { id } = req.params;
      const schedules = await dataService.getDoctorSchedules(id);
      const leaves = await dataService.getDoctorLeaves(id);

      return res.status(200).json({
        success: true,
        data: {
          schedules,
          leaves,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
