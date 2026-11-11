import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { getDayName, formatDate } from '../../utils/formatters';
import { Clock, Calendar, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorAvailabilityPage() {
  const [schedules, setSchedules] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New leave form
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctorAvailability();
      if (res.success) {
        // Map 7 days
        const existing = res.data.schedules || [];
        const fullWeek = [0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
          const found = existing.find((s) => s.dayOfWeek === dayIdx);
          return (
            found || {
              dayOfWeek: dayIdx,
              startTime: '09:00',
              endTime: '17:00',
              slotDurationMinutes: 30,
              isActive: dayIdx >= 1 && dayIdx <= 5, // Default Mon-Fri active
            }
          );
        });
        setSchedules(fullWeek);
        setLeaves(res.data.leaves || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading availability data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, []);

  const handleScheduleChange = (dayIdx, field, value) => {
    setSchedules((prev) =>
      prev.map((s) => (s.dayOfWeek === dayIdx ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await doctorService.updateDoctorAvailability(schedules);
      if (res.success) {
        setSuccess('Weekly schedule updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save weekly schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLeave = async (e) => {
    e.preventDefault();
    if (!leaveDate) return;

    setError(null);
    try {
      const res = await doctorService.addLeave({
        date: leaveDate,
        reason: leaveReason || 'Personal / Academic Leave',
      });
      if (res.success) {
        setSuccess(`Leave recorded for ${leaveDate}.`);
        setLeaveDate('');
        setLeaveReason('');
        fetchAvailability();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record leave.');
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      const res = await doctorService.deleteLeave(leaveId);
      if (res.success) {
        setSuccess('Leave removed.');
        fetchAvailability();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete leave.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctor schedule and leave records..." />;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Schedule Settings
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
          Weekly Availability & Leave Calendar
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define regular weekly visiting hours and record planned days off to block appointment booking.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* WEEKLY SCHEDULE CONFIGURATION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">
              Weekly Practice Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Slots are automatically computed in 30-minute intervals during active hours.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveSchedules} className="space-y-4">
          <div className="space-y-3">
            {schedules.map((sched) => (
              <div
                key={sched.dayOfWeek}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  sched.isActive
                    ? 'bg-white border-slate-200/80 shadow-xs'
                    : 'bg-slate-50 border-slate-200/40 opacity-60'
                }`}
              >
                <div className="w-36 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`day-${sched.dayOfWeek}`}
                    checked={sched.isActive}
                    onChange={(e) =>
                      handleScheduleChange(sched.dayOfWeek, 'isActive', e.target.checked)
                    }
                    className="w-4 h-4 rounded text-brand-700 focus:ring-brand-600"
                  />
                  <label
                    htmlFor={`day-${sched.dayOfWeek}`}
                    className="text-xs font-bold text-slate-800 cursor-pointer"
                  >
                    {getDayName(sched.dayOfWeek)}
                  </label>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">Start:</span>
                    <input
                      type="time"
                      disabled={!sched.isActive}
                      value={sched.startTime}
                      onChange={(e) =>
                        handleScheduleChange(sched.dayOfWeek, 'startTime', e.target.value)
                      }
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold disabled:bg-slate-100 text-slate-800"
                    />
                  </div>

                  <span className="text-slate-400">to</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">End:</span>
                    <input
                      type="time"
                      disabled={!sched.isActive}
                      value={sched.endTime}
                      onChange={(e) =>
                        handleScheduleChange(sched.dayOfWeek, 'endTime', e.target.value)
                      }
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold disabled:bg-slate-100 text-slate-800"
                    />
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span
                    className={`font-bold ${
                      sched.isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {sched.isActive ? 'Practicing' : 'Off Duty'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Weekly Schedule'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* LEAVES & UNAVAILABLE DATES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-navy-900 font-heading">
            Scheduled Doctor Leaves
          </h3>
          <p className="text-xs text-slate-500">
            Patients will not be able to book appointments on these registered dates.
          </p>
        </div>

        {/* Add Leave Form */}
        <form onSubmit={handleAddLeave} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">Leave Date *</label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason / Description</label>
            <input
              type="text"
              placeholder="e.g. Medical Conference, Personal Leave"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-xs shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Leave</span>
          </button>
        </form>

        {/* Leaves Table */}
        {leaves.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No scheduled leaves recorded.</p>
        ) : (
          <div className="space-y-2">
            {leaves.map((l) => (
              <div
                key={l.id}
                className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{formatDate(l.date)}</span>
                  <span className="text-slate-500 ml-3">{l.reason || 'Leave'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteLeave(l.id)}
                  className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove Leave"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
