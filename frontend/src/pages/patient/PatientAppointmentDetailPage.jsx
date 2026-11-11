import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { appointmentService } from '../../services/appointmentService';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowLeft,
  AlertCircle,
  FileText,
  CheckCircle2,
  Ban,
} from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function PatientAppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cancel modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointment = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointmentById(id);
      if (res.success) {
        setAppointment(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    setCancelling(true);
    try {
      const res = await appointmentService.cancelAppointment(
        id,
        cancelReason || 'Cancelled by patient'
      );
      if (res.success) {
        setSuccess('Appointment has been cancelled.');
        setCancelModalOpen(false);
        fetchAppointment();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading appointment record..." />;
  }

  if (error || !appointment) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900 font-heading">Record Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve appointment details.'}</p>
        <Link
          to="/patient/appointments"
          className="inline-block px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
        >
          Back to Appointments
        </Link>
      </div>
    );
  }

  const canCancel = appointment.status === 'PENDING' || appointment.status === 'CONFIRMED';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        to="/patient/appointments"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Appointments</span>
      </Link>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Appointment Code</span>
              <span className="font-mono text-sm font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                {appointment.appointmentNumber}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-navy-900 font-heading mt-2">
              Consultation with {appointment.doctor?.fullName}
            </h1>
          </div>
          <div>
            <StatusBadge status={appointment.status} className="text-sm px-3.5 py-1.5" />
          </div>
        </div>

        {/* Doctor and Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/60">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Doctor Information
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={appointment.doctor?.avatarUrl}
                alt={appointment.doctor?.fullName}
                className="w-12 h-12 rounded-xl object-cover bg-slate-200 shrink-0"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">{appointment.doctor?.fullName}</p>
                <p className="text-xs text-slate-500">{appointment.doctor?.specialization}</p>
                <p className="text-xs text-brand-700 font-semibold">
                  {appointment.doctor?.department?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Schedule & Location
            </h4>
            <div className="space-y-1.5 text-xs text-slate-700">
              <p className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span className="font-bold">{formatDate(appointment.date)}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>
                  {formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>Room {appointment.doctor?.roomNumber || 'West Clinic Wing'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Patient Symptoms / Reason */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Reported Medical Reason
          </h4>
          <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-800 leading-relaxed">
            {appointment.reason}
          </div>
        </div>

        {/* Doctor Consultation Notes (if any) */}
        {appointment.notes && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Physician Consultation Notes & Assessment
            </h4>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              {appointment.notes}
            </div>
          </div>
        )}

        {/* Cancellation Details (if cancelled) */}
        {appointment.cancellationReason && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Cancellation Reason
            </h4>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900">
              {appointment.cancellationReason}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Created on {formatDate(appointment.createdAt, { hour: 'numeric', minute: 'numeric' })}
          </span>
          {canCancel && (
            <button
              type="button"
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs transition-colors"
            >
              Cancel Appointment
            </button>
          )}
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
      >
        <form onSubmit={handleConfirmCancel} className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to cancel this booking? This will immediately free the slot.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason</label>
            <textarea
              rows={3}
              placeholder="State reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Keep
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              {cancelling ? 'Cancelling...' : 'Confirm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
