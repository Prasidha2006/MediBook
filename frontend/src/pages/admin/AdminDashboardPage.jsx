import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingUp,
  FileText,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await adminService.getDashboard();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Admin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating hospital analytics..." />;
  }

  const { stats, recentLogs = [], recentAppointments = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-900 to-brand-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-navy-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-brand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-300" /> System Administrator Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Hospital Overview & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time management of departments, doctors, clinical schedules, and patient appointments.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/doctors"
            className="px-4 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-2xl text-xs shadow-md transition-all"
          >
            + Add New Doctor
          </Link>
          <Link
            to="/admin/departments"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs backdrop-blur-md transition-all"
          >
            Manage Departments
          </Link>
        </div>
      </div>

      {/* CORE METRIC STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900 font-heading mt-2">
            {stats?.totalPatients || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Registered health accounts</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Doctors</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-navy-900 font-heading mt-2">
            {stats?.totalDoctors || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across {stats?.totalDepartments || 8} departments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-brand-700 font-heading mt-2">
            {stats?.totalAppointments || 0}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-amber-600 font-semibold">{stats?.pendingAppointments || 0} Pending</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-600 font-semibold">{stats?.confirmedAppointments || 0} Confirmed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Revenue</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-heading mt-2">
            {formatCurrency(stats?.estimatedRevenue || 0)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Completed & confirmed visits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* RECENT HOSPITAL APPOINTMENTS */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900 font-heading">
                Hospital Master Appointments
              </h3>
              <p className="text-xs text-slate-500">Real-time appointments ledger across all wings</p>
            </div>
            <Link to="/admin/appointments" className="text-xs font-bold text-brand-700 hover:underline">
              View Master List
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ref</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {apt.patient?.fullName || 'Patient'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{apt.doctor?.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(apt.date, { month: 'short', day: 'numeric' })} at{' '}
                      {formatTime(apt.startTime)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RECENT SYSTEM AUDIT TRAIL */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900 font-heading">Audit Trail</h3>
              <p className="text-xs text-slate-500">Security & event activity logs</p>
            </div>
            <Link to="/admin/settings" className="text-xs font-bold text-brand-700 hover:underline">
              All Logs
            </Link>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-700 text-[11px] font-mono">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDate(log.createdAt, { hour: 'numeric', minute: 'numeric' })}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Entity: <strong className="text-slate-800">{log.entity}</strong>{' '}
                  {log.entityId && `(${log.entityId})`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
