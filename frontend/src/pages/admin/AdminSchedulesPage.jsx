import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { getDayName, formatTime } from '../../utils/formatters';
import { Clock, Calendar, Stethoscope, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminSchedulesPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSchedules() {
      try {
        const res = await adminService.getDoctors();
        if (res.success) {
          setDoctors(res.data);
        }
      } catch (err) {
        console.error('Error loading doctor schedules:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSchedules();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading hospital schedule matrix..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Resource Allocation
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
          Doctor Schedules & Weekly Availability
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Master roster of active outpatient clinical hours across all medical departments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <img
                src={doc.avatarUrl}
                alt={doc.fullName}
                className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-navy-900">{doc.fullName}</h3>
                <p className="text-xs text-brand-700 font-semibold">{doc.department?.name}</p>
                <p className="text-[11px] text-slate-400">Room: {doc.roomNumber || 'Main Wing'}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Weekly Active Shifts
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5].map((dIdx) => {
                  const s = doc.schedules?.find((sched) => sched.dayOfWeek === dIdx && sched.isActive);
                  return (
                    <div
                      key={dIdx}
                      className={`p-2 rounded-xl text-center text-[11px] border ${
                        s
                          ? 'bg-slate-50 border-slate-200 text-slate-800 font-bold'
                          : 'bg-slate-50/50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        {getDayName(dIdx).slice(0, 3)}
                      </p>
                      <p className="mt-0.5">{s ? `${s.startTime}-${s.endTime}` : 'Off'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
