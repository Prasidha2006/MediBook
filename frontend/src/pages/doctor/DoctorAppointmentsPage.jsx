import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { formatDate, formatTime } from '../../utils/formatters';
import { Calendar, Search, Filter, Check, X, CheckCircle2, FileText } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Status action modal
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await doctorService.getDoctorAppointments({
        status: statusFilter,
        date: dateFilter,
      });
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
  }, [statusFilter, dateFilter]);

  const handleOpenAction = (apt, status) => {
    setSelectedApt(apt);
    setTargetStatus(status);
    setNotes(apt.notes || '');
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
        notes,
        ...(targetStatus === 'REJECTED' ? { rejectionReason: notes } : {}),
      };

      const res = await doctorService.updateAppointmentStatus(selectedApt.id, payload);
      if (res.success) {
        setSuccess(`Appointment ${selectedApt.appointmentNumber} updated.`);
        setActionModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Clinical Schedule
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Appointments Management
          </h1>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Status buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filterDate" className="text-xs font-bold text-slate-600">
            Date:
          </label>
          <input
            id="filterDate"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter('')}
              className="text-xs text-brand-700 font-bold hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* APPOINTMENTS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading appointment roster..." />
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">
              No appointments matching selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Booking Number</th>
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Date & Slot</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Reason / Symptoms</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {apt.appointmentNumber}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{apt.patient?.fullName || 'Patient'}</p>
                      <p className="text-[11px] text-slate-500">{apt.patient?.phone || 'No phone'}</p>
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
                    <td className="py-4 px-6 text-right space-x-1 whitespace-nowrap">
                      {apt.status === 'PENDING' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(apt, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAction(apt, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold"
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {apt.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          onClick={() => handleOpenAction(apt, 'COMPLETED')}
                          className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold"
                        >
                          Complete Visit
                        </button>
                      )}
                      {(apt.status === 'COMPLETED' || apt.status === 'CANCELLED') && (
                        <button
                          type="button"
                          onClick={() => handleOpenAction(apt, apt.status)}
                          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                        >
                          View Notes
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACTION MODAL */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Consultation Details - ${selectedApt?.appointmentNumber}`}
      >
        <form onSubmit={handleConfirmStatus} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p>
              <strong>Patient:</strong> {selectedApt?.patient?.fullName} ({selectedApt?.patient?.phone})
            </p>
            <p>
              <strong>Date & Time:</strong> {formatDate(selectedApt?.date)} at{' '}
              {formatTime(selectedApt?.startTime)}
            </p>
            <p>
              <strong>Reason:</strong> {selectedApt?.reason}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Consultation Notes / Diagnosis / Instructions
            </label>
            <textarea
              rows={4}
              placeholder="Record findings, clinical impressions, or prescription recommendations..."
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
              Close
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold"
            >
              {submitting ? 'Saving...' : 'Save & Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
