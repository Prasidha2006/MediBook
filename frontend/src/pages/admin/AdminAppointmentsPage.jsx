import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate, formatTime } from '../../utils/formatters';
import { Calendar, Search, Filter, Edit, CheckCircle2, ChevronRight } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Status Override Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApt, setSelectedApt] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAppointments({
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

  const handleOpenOverride = (apt) => {
    setSelectedApt(apt);
    setNewStatus(apt.status);
    setAdminNotes(apt.notes || '');
    setModalOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedApt || !newStatus) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await adminService.updateAppointmentStatus(selectedApt.id, {
        status: newStatus,
        notes: adminNotes,
      });
      if (res.success) {
        setSuccess(`Appointment ${selectedApt.appointmentNumber} updated to ${newStatus}.`);
        setModalOpen(false);
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
            Hospital Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Master Appointments Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee and manage bookings across all hospital departments and attending physicians.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
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

        <div className="flex items-center gap-2">
          <label htmlFor="adminFilterDate" className="text-xs font-bold text-slate-600">
            Filter by Date:
          </label>
          <input
            id="adminFilterDate"
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
          <LoadingSpinner text="Querying master appointment records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Ref Number</th>
                  <th className="py-3.5 px-6">Patient</th>
                  <th className="py-3.5 px-6">Doctor & Department</th>
                  <th className="py-3.5 px-6">Date & Slot</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Reason</th>
                  <th className="py-3.5 px-6 text-right">Override</th>
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
                      <p className="text-[11px] text-slate-500">{apt.patient?.phone}</p>
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
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenOverride(apt)}
                        className="px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* OVERRIDE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Administrative Status Override - ${selectedApt?.appointmentNumber}`}
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p>
              <strong>Patient:</strong> {selectedApt?.patient?.fullName}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedApt?.doctor?.fullName}
            </p>
            <p>
              <strong>Scheduled:</strong> {formatDate(selectedApt?.date)} at{' '}
              {formatTime(selectedApt?.startTime)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Administrative / Clinical Notes
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold"
            >
              {submitting ? 'Applying...' : 'Apply Status Override'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
