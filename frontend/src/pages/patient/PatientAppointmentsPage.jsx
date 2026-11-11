import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { formatDate, formatTime } from '../../utils/formatters';
import { Calendar, Clock, AlertCircle, X, CheckCircle2, ChevronRight, Ban } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cancellation Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAptToCancel, setSelectedAptToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments(activeTab);
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const handleOpenCancelModal = (apt) => {
    setSelectedAptToCancel(apt);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!selectedAptToCancel) return;

    setCancelling(true);
    setError(null);

    try {
      const res = await appointmentService.cancelAppointment(
        selectedAptToCancel.id,
        cancelReason || 'Cancelled by patient'
      );
      if (res.success) {
        setSuccess('Appointment cancelled successfully. Time slot has been released.');
        setCancelModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const tabs = [
    { key: 'ALL', label: 'All' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Medical Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            My Hospital Appointments
          </h1>
        </div>

        <Link
          to="/patient/book"
          className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          + Book New Consultation
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === t.key
                ? 'bg-brand-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching appointment records..." />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900 font-heading">
              No appointments found
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              There are no records matching the selected status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Booking Number</th>
                  <th className="py-3.5 px-6">Doctor & Department</th>
                  <th className="py-3.5 px-6">Date & Slot</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Symptoms / Reason</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => {
                  const canCancel = apt.status === 'PENDING' || apt.status === 'CONFIRMED';
                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {apt.appointmentNumber}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{apt.doctor?.fullName}</p>
                        <p className="text-[11px] text-brand-700">
                          {apt.doctor?.department?.name || apt.doctor?.specialization}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{formatDate(apt.date)}</p>
                        <p className="text-[11px] text-slate-500">
                          {formatTime(apt.startTime)} – {formatTime(apt.endTime)}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-600">
                        {apt.reason}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link
                          to={`/patient/appointments/${apt.id}`}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-colors inline-block"
                        >
                          Details
                        </Link>
                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancelModal(apt)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CANCELLATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Scheduled Appointment"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to cancel appointment{' '}
            <strong className="text-slate-900">{selectedAptToCancel?.appointmentNumber}</strong> with{' '}
            <strong>{selectedAptToCancel?.doctor?.fullName}</strong>? This action will immediately release
            your reserved time slot.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Rescheduling due to conflict, symptoms resolved, etc."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
