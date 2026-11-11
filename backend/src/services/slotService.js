import { dataService } from './dataService.js';

/**
 * Formats minutes into HH:mm format
 */
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Converts HH:mm to minutes from midnight
 */
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export const slotService = {
  /**
   * Calculates all consultation slots for a doctor on a specific calendar date
   * @param {string} doctorId - Doctor UUID
   * @param {string} dateString - "YYYY-MM-DD"
   * @returns {Promise<Object>} Slots breakdown
   */
  async getDoctorSlotsForDate(doctorId, dateString) {
    const doctor = await dataService.findDoctorById(doctorId);
    if (!doctor) {
      throw new Error('Doctor not found');
    }

    if (!doctor.isActive || !doctor.isApproved) {
      return {
        date: dateString,
        available: false,
        message: 'Doctor is currently inactive or not approved for bookings.',
        slots: [],
      };
    }

    // Parse date safely in UTC/local day
    const [year, month, day] = dateString.split('-').map(Number);
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sun, 1 = Mon ...

    // Check if target date is in the past
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const isToday = dateString === todayStr;

    if (dateString < todayStr) {
      return {
        date: dateString,
        available: false,
        message: 'Cannot retrieve slots for past dates.',
        slots: [],
      };
    }

    // 1. Check if doctor is on leave
    const leaves = await dataService.getDoctorLeaves(doctorId);
    const isOnLeave = leaves.some((l) => {
      const lDate = new Date(l.date).toISOString().split('T')[0];
      return lDate === dateString;
    });

    if (isOnLeave) {
      return {
        date: dateString,
        available: false,
        message: 'Doctor is on scheduled leave on this date.',
        slots: [],
      };
    }

    // 2. Check doctor's weekly schedule for this dayOfWeek
    const schedules = await dataService.getDoctorSchedules(doctorId);
    const daySchedule = schedules.find((s) => s.dayOfWeek === dayOfWeek && s.isActive);

    if (!daySchedule) {
      return {
        date: dateString,
        available: false,
        message: 'Doctor is not scheduled to consult on this day of the week.',
        slots: [],
      };
    }

    // 3. Generate slots based on schedule
    const startMinutes = timeToMinutes(daySchedule.startTime);
    const endMinutes = timeToMinutes(daySchedule.endTime);
    const duration = daySchedule.slotDurationMinutes || 30;

    // 4. Fetch existing booked appointments for doctor on this date
    const existingAppointments = await dataService.getAllAppointments({
      doctorId,
      date: dateString,
    });

    const activeAppointments = existingAppointments.filter(
      (a) => a.status === 'CONFIRMED' || a.status === 'PENDING'
    );

    const currentMinutesNow = now.getHours() * 60 + now.getMinutes();

    const slots = [];
    for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
      const slotStartTime = minutesToTime(current);
      const slotEndTime = minutesToTime(current + duration);

      // Check if slot has already passed today
      const isPastTime = isToday && current <= currentMinutesNow;

      // Check if booked
      const isBooked = activeAppointments.some((a) => a.startTime === slotStartTime);

      let isAvailable = !isBooked && !isPastTime;
      let unavailableReason = null;

      if (isBooked) {
        unavailableReason = 'Already booked';
      } else if (isPastTime) {
        unavailableReason = 'Time slot has passed';
      }

      slots.push({
        startTime: slotStartTime,
        endTime: slotEndTime,
        isAvailable,
        unavailableReason,
      });
    }

    return {
      date: dateString,
      doctorId,
      doctorName: doctor.fullName,
      specialization: doctor.specialization,
      consultationFee: doctor.consultationFee,
      available: slots.some((s) => s.isAvailable),
      workingHours: {
        startTime: daySchedule.startTime,
        endTime: daySchedule.endTime,
      },
      slotDurationMinutes: duration,
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      slots,
    };
  },
};
