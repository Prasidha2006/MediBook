import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { formatDate, formatTime, getDayName } from '../../utils/formatters';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

export default function DoctorCalendarPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    return new Date(now.setDate(diff));
  });

  const [selectedApt, setSelectedApt] = useState(null);

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      try {
        const res = await doctorService.getDoctorAppointments();
        if (res.success) {
          setAppointments(res.data);
        }
      } catch (err) {
        console.error('Calendar appointments load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAppointments();
  }, []);

  // Compute 7 days of current week
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const getAppointmentsForDate = (dateObj) => {
    const dStr = dateObj.toISOString().split('T')[0];
    return appointments.filter((a) => a.date.startsWith(dStr));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Visual Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Clinic Practice Calendar
          </h1>
        </div>

        {/* Week navigation buttons */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={prevWeek}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 px-2">
            {formatDate(weekDays[0], { month: 'short', day: 'numeric' })} –{' '}
            {formatDate(weekDays[6], { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Rendering calendar schedule..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day, idx) => {
            const dayApts = getAppointmentsForDate(day);
            const isToday =
              day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

            return (
              <div
                key={idx}
                className={`bg-white rounded-3xl border ${
                  isToday ? 'border-brand-500 ring-2 ring-brand-100' : 'border-slate-200/80'
                } p-4 flex flex-col min-h-[360px] shadow-xs`}
              >
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {getDayName(day.getDay()).slice(0, 3)}
                    </p>
                    <p className="text-base font-extrabold text-navy-900">
                      {day.getDate()}
                    </p>
                  </div>
                  {isToday && (
                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      Today
                    </span>
                  )}
                </div>

                <div className="flex-1 py-3 space-y-2 overflow-y-auto max-h-[300px]">
                  {dayApts.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-8">
                      No visits
                    </p>
                  ) : (
                    dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedApt(apt)}
                        className={`p-2 rounded-xl text-left border cursor-pointer hover:shadow-sm transition-all ${
                          apt.status === 'CONFIRMED'
                            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                            : apt.status === 'PENDING'
                            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                            : apt.status === 'COMPLETED'
                            ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <p className="text-[11px] font-bold truncate">
                          {formatTime(apt.startTime)} • {apt.patient?.fullName || 'Patient'}
                        </p>
                        <p className="text-[10px] truncate opacity-75">{apt.reason}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment click modal */}
      <Modal
        isOpen={!!selectedApt}
        onClose={() => setSelectedApt(null)}
        title={`Appointment: ${selectedApt?.appointmentNumber}`}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-500">Status:</span>
            <StatusBadge status={selectedApt?.status} />
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <p>
              <strong>Patient Name:</strong> {selectedApt?.patient?.fullName}
            </p>
            <p>
              <strong>Contact Phone:</strong> {selectedApt?.patient?.phone}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(selectedApt?.date)}
            </p>
            <p>
              <strong>Scheduled Slot:</strong> {formatTime(selectedApt?.startTime)} –{' '}
              {formatTime(selectedApt?.endTime)}
            </p>
            <p>
              <strong>Chief Complaint:</strong> {selectedApt?.reason}
            </p>
            {selectedApt?.notes && (
              <p>
                <strong>Notes / Diagnosis:</strong> {selectedApt?.notes}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedApt(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
