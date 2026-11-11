import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  ArrowRight,
  User,
  MapPin,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await patientService.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Patient dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your patient portal..." />;
  }

  const { patient, stats, recentAppointments = [] } = data || {};
  const nextApt = stats?.nextAppointment;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-800 to-accent-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Verified Patient Account
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Welcome back, {patient?.fullName || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
            Manage your scheduled outpatient consultations, track clinician diagnoses, and reserve
            new appointments with hospital specialists.
          </p>
        </div>

        <Link
          to="/patient/book"
          className="shrink-0 px-5 py-3 bg-white text-brand-800 hover:bg-brand-50 font-bold rounded-2xl shadow-lg transition-all text-xs sm:text-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Book Appointment</span>
        </Link>
      </div>

      {/* METRIC STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-2">
            {stats?.total || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">All-time bookings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading mt-2">
            {stats?.upcomingCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending or Confirmed</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 font-heading mt-2">
            {stats?.completedCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Past consultations</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-heading mt-2">
            {stats?.cancelledCount || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cancelled or declined</p>
        </div>
      </div>

      {/* NEXT UPCOMING APPOINTMENT HIGHLIGHT CARD */}
      {nextApt && (
        <div className="bg-white rounded-3xl border border-brand-200 p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-100">
                Next Scheduled Consultation
              </span>
              <h2 className="text-xl font-bold text-navy-900 font-heading mt-2">
                {nextApt.appointmentNumber}
              </h2>
            </div>
            <StatusBadge status={nextApt.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
            <div className="md:col-span-4 flex items-center gap-4">
              <img
                src={nextApt.doctor?.avatarUrl}
                alt={nextApt.doctor?.fullName}
                className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shadow-sm"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{nextApt.doctor?.fullName}</h4>
                <p className="text-xs text-slate-500">{nextApt.doctor?.specialization}</p>
                <p className="text-[11px] text-brand-700 font-semibold mt-0.5">
                  {nextApt.doctor?.department?.name}
                </p>
              </div>
            </div>

            <div className="md:col-span-5 space-y-1 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
                <span className="font-bold text-slate-800">{formatDate(nextApt.date)}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  {formatTime(nextApt.startTime)} – {formatTime(nextApt.endTime)}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Room {nextApt.doctor?.roomNumber || 'Main Clinic Suite'}</span>
              </p>
            </div>

            <div className="md:col-span-3 flex justify-start md:justify-end">
              <Link
                to={`/patient/appointments/${nextApt.id}`}
                className="px-4 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <span>View Details</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* RECENT BOOKING HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">Recent Booking History</h3>
            <p className="text-xs text-slate-500">Your latest appointment requests and visits</p>
          </div>
          <Link
            to="/patient/appointments"
            className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-semibold text-slate-500">No appointments booked yet.</p>
            <Link
              to="/patient/book"
              className="inline-block mt-3 px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
            >
              Book your first appointment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Doctor & Specialty</th>
                  <th className="py-3 px-4">Consultation Date</th>
                  <th className="py-3 px-4">Time Slot</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{apt.doctor?.fullName}</p>
                      <p className="text-[11px] text-slate-500">{apt.doctor?.specialization}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {formatDate(apt.date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {formatTime(apt.startTime)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/patient/appointments/${apt.id}`}
                        className="text-xs font-bold text-brand-700 hover:underline"
                      >
                        Details &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
