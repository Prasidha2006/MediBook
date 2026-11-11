import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  AlertCircle,
  Check,
  X,
  ChevronRight,
  Stethoscope,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function DoctorDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Status action modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await doctorService.getDoctorDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading doctor dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenAction = (apt, status) => {
    setSelectedApt(apt);
    setTargetStatus(status);
    setNotes('');
    setActionModalOpen(true);
  };

  const handleConfirmStatus = async (e) => {
    e.preventDefault();
    if (!selectedApt || !targetStatus) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        status: targetStatus,
        ...(targetStatus === 'COMPLETED' ? { notes } : {}),
        ...(targetStatus === 'REJECTED' ? { rejectionReason: notes } : {}),
      };

      const res = await doctorService.updateAppointmentStatus(selectedApt.id, payload);
      if (res.success) {
        setSuccess(`Appointment ${selectedApt.appointmentNumber} updated to ${targetStatus}.`);
        setActionModalOpen(false);
        fetchDashboard();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctor practice portal..." />;
  }

  const { doctor, stats, pendingRequests = [], upcomingConfirmed = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-brand-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-purple-100">
            <Stethoscope className="w-3.5 h-3.5" /> Attending Physician Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            {doctor?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200">
            {doctor?.specialization} • Room {doctor?.roomNumber || 'Main Suite'}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/doctor/availability"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs backdrop-blur-md transition-all"
          >
            Manage Schedule
          </Link>
          <Link
            to="/doctor/appointments"
            className="px-4 py-2.5 bg-white text-purple-900 hover:bg-purple-50 font-bold rounded-2xl text-xs shadow-md transition-all"
          >
            All Appointments
          </Link>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* PRACTICE STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Visits</span>
          <p className="text-2xl font-extrabold text-navy-900 font-heading mt-2">{stats?.total || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All scheduled</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today's Clinic</span>
          <p className="text-2xl font-extrabold text-brand-700 font-heading mt-2">{stats?.today || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Scheduled for today</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</span>
          <p className="text-2xl font-extrabold text-amber-600 font-heading mt-2">{stats?.pending || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires approval</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed</span>
          <p className="text-2xl font-extrabold text-emerald-600 font-heading mt-2">{stats?.confirmed || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Upcoming slots</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Patients</span>
          <p className="text-2xl font-extrabold text-purple-700 font-heading mt-2">{stats?.uniquePatients || 0}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Unique patients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PENDING APPROVAL REQUESTS */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900 font-heading">
                Pending Appointment Requests
              </h3>
              <p className="text-xs text-slate-500">Review and accept new patient bookings</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {pendingRequests.length} Pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">All appointment requests reviewed!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {apt.appointmentNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {apt.patient?.fullName || 'Patient'}
                      </h4>
                      <p className="text-xs text-slate-500">Phone: {apt.patient?.phone || 'N/A'}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-brand-700">{formatDate(apt.date)}</p>
                      <p className="text-slate-500">
                        {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 text-xs text-slate-700">
                    <strong className="text-slate-900">Chief Complaint:</strong> {apt.reason}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenAction(apt, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenAction(apt, 'CONFIRMED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Accept & Confirm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING CONFIRMED CLINIC */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-navy-900 font-heading">Upcoming Clinic</h3>
              <p className="text-xs text-slate-500">Confirmed patient visits</p>
            </div>
            <Link
              to="/doctor/appointments"
              className="text-xs font-bold text-brand-700 hover:underline"
            >
              View All
            </Link>
          </div>

          {upcomingConfirmed.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No upcoming confirmed visits.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingConfirmed.map((apt) => (
                <div
                  key={apt.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-900">{apt.patient?.fullName}</p>
                    <p className="text-[11px] text-slate-500">{formatDate(apt.date)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-brand-700">{formatTime(apt.startTime)}</span>
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenAction(apt, 'COMPLETED')}
                        className="text-[11px] font-bold text-blue-600 hover:underline"
                      >
                        Mark Done
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* STATUS UPDATE MODAL */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Update Appointment to ${targetStatus}`}
      >
        <form onSubmit={handleConfirmStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            Confirming status transition for patient{' '}
            <strong className="text-slate-900">{selectedApt?.patient?.fullName}</strong> (
            {selectedApt?.appointmentNumber}).
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {targetStatus === 'COMPLETED'
                ? 'Clinical Assessment & Prescription Notes'
                : targetStatus === 'REJECTED'
                ? 'Reason for Declining (Optional)'
                : 'Doctor Consultation Notes (Optional)'}
            </label>
            <textarea
              rows={3}
              placeholder={
                targetStatus === 'COMPLETED'
                  ? 'Enter diagnosis, prescribed regimen, or follow-up instructions...'
                  : 'Add notes for the patient...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition-all ${
                targetStatus === 'REJECTED'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : targetStatus === 'COMPLETED'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {submitting ? 'Updating...' : `Confirm ${targetStatus}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
