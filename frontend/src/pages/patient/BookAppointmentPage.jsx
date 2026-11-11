import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { appointmentService } from '../../services/appointmentService';
import { formatCurrency, formatDate, formatTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pre-selected parameters from query
  const initialDoctorId = searchParams.get('doctorId') || '';
  const initialDate = searchParams.get('date') || '';

  // Wizard state
  const [step, setStep] = useState(initialDoctorId ? (initialDate ? 3 : 2) : 1);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Date and slot state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(initialDate || todayStr);
  const [slotsData, setSlotsData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Reason and submission
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Load departments and doctors
  useEffect(() => {
    async function loadInitial() {
      try {
        const [deptRes, docsRes] = await Promise.all([
          departmentService.getDepartments(),
          doctorService.getDoctors({ limit: 50 }),
        ]);
        if (deptRes.success) setDepartments(deptRes.data);
        if (docsRes.success) {
          setDoctors(docsRes.data);
          if (initialDoctorId) {
            const found = docsRes.data.find((d) => d.id === initialDoctorId);
            if (found) setSelectedDoctor(found);
          }
        }
      } catch (err) {
        console.error('Booking wizard load error:', err);
      }
    }
    loadInitial();
  }, [initialDoctorId]);

  // When doctor and date are set, load slots
  useEffect(() => {
    async function loadDoctorSlots() {
      if (!selectedDoctor?.id || !selectedDate) return;
      setSlotsLoading(true);
      setError(null);
      setSelectedSlot(null);

      try {
        const res = await doctorService.getDoctorSlots(selectedDoctor.id, selectedDate);
        if (res.success) {
          setSlotsData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching doctor slots.');
      } finally {
        setSlotsLoading(false);
      }
    }

    if (step >= 2 && selectedDoctor) {
      loadDoctorSlots();
    }
  }, [selectedDoctor, selectedDate, step]);

  const filteredDoctors = doctors.filter((doc) => {
    if (selectedDeptId && doc.departmentId !== selectedDeptId) return false;
    return true;
  });

  const handleDoctorSelect = (doc) => {
    setSelectedDoctor(doc);
    setStep(2);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available consultation slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please describe your medical reason or symptoms.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await appointmentService.bookAppointment({
        doctorId: selectedDoctor.id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        reason,
      });

      if (res.success) {
        setConfirmedBooking(res.data);
        setStep(4); // Confirmation step
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot may no longer be available.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stepper Header */}
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Consultation Booking
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
          Reserve an In-Person Medical Appointment
        </h1>
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              step >= 1 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'
            }`}
          >
            1. Select Doctor
          </div>
          <div
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              step >= 2 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'
            }`}
          >
            2. Choose Date
          </div>
          <div
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              step >= 3 ? 'bg-brand-50 text-brand-700 border border-brand-200' : 'text-slate-400'
            }`}
          >
            3. Select Slot & Reason
          </div>
          <div
            className={`p-2 rounded-xl text-xs font-bold transition-all ${
              step >= 4 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-400'
            }`}
          >
            4. Confirmation
          </div>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* STEP 1: SELECT DOCTOR */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy-900 font-heading">
              Step 1: Choose a Medical Specialist
            </h3>

            {/* Department Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedDeptId('')}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDeptId === ''
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Departments
              </button>
              {departments.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDeptId(d.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedDeptId === d.id
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            {/* Doctor Cards Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDoctorSelect(doc)}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-brand-500 hover:shadow-card bg-slate-50/50 hover:bg-white cursor-pointer transition-all flex items-start gap-4 group"
                >
                  <img
                    src={doc.avatarUrl}
                    alt={doc.fullName}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                      {doc.department?.name || doc.specialization}
                    </span>
                    <h4 className="text-sm font-bold text-navy-900 mt-1 group-hover:text-brand-700 transition-colors">
                      {doc.fullName}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{doc.qualification}</p>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{doc.experienceYears}y exp</span>
                      <span className="font-extrabold text-navy-900">
                        {formatCurrency(doc.consultationFee)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT DATE */}
      {step === 2 && selectedDoctor && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-600 hover:text-brand-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Change Doctor
              </button>
              <span className="text-xs font-semibold text-slate-500">Step 2 of 4</span>
            </div>

            {/* Selected Doctor Summary Card */}
            <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 flex items-center gap-4">
              <img
                src={selectedDoctor.avatarUrl}
                alt={selectedDoctor.fullName}
                className="w-14 h-14 rounded-2xl object-cover bg-slate-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700">
                  {selectedDoctor.department?.name}
                </span>
                <h3 className="text-base font-bold text-navy-900">{selectedDoctor.fullName}</h3>
                <p className="text-xs text-slate-600">
                  Room: {selectedDoctor.roomNumber || 'Main Clinic'} • Fee:{' '}
                  {formatCurrency(selectedDoctor.consultationFee)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-navy-900 font-heading">
                Select Your Consultation Date
              </h3>
              <p className="text-xs text-slate-500">
                Appointments must be scheduled for today or upcoming dates.
              </p>

              <div className="max-w-xs">
                <label htmlFor="appointmentDate" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pick a Calendar Date:
                </label>
                <input
                  id="appointmentDate"
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-600"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2"
                >
                  <span>Check Available Slots</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT SLOT AND ENTER REASON */}
      {step === 3 && selectedDoctor && (
        <form onSubmit={handleConfirmBooking} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-bold text-slate-600 hover:text-brand-700 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Date Selection
              </button>
              <span className="text-xs font-semibold text-slate-500">Step 3 of 4</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-900">{selectedDoctor.fullName}</p>
                <p className="text-slate-500">{selectedDoctor.specialization}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-brand-700">{formatDate(selectedDate)}</p>
                <p className="text-slate-500">{formatCurrency(selectedDoctor.consultationFee)}</p>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <h3 className="text-base font-bold text-navy-900 font-heading mb-1">
                Select Consultation Slot
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Green slots are available for immediate reservation.
              </p>

              {slotsLoading ? (
                <LoadingSpinner text="Computing real-time slots..." size="sm" />
              ) : !slotsData || slotsData.slots.length === 0 ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <p className="text-xs font-semibold text-slate-600">
                    {slotsData?.message || 'Doctor is not available on this date. Please pick another date.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-3 text-xs font-bold text-brand-700 underline"
                  >
                    Select different date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {slotsData.slots.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!s.isAvailable}
                      onClick={() => setSelectedSlot(s)}
                      className={`p-3 rounded-xl text-center text-xs font-bold border transition-all ${
                        !s.isAvailable
                          ? 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60 cursor-not-allowed'
                          : selectedSlot?.startTime === s.startTime
                          ? 'bg-brand-700 text-white border-brand-700 shadow-md ring-2 ring-brand-300'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {formatTime(s.startTime)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reason for Consultation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Medical Reason for Consultation *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe symptoms, duration, relevant medical history, or prescription needs..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                {selectedSlot && (
                  <p className="text-xs font-bold text-emerald-700">
                    Selected: {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="px-6 py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-700/20 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <span>Reserving Slot...</span>
                ) : (
                  <>
                    <span>Confirm & Book Appointment</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* STEP 4: CONFIRMATION RECEIPT */}
      {step === 4 && confirmedBooking && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-emerald-200 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Appointment Successfully Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-3">
              Booking Ref: {confirmedBooking.appointmentNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment request is registered. Present this reference at the clinic reception.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 max-w-md mx-auto text-left space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Doctor:</span>
              <span className="font-bold text-slate-900">{confirmedBooking.doctor?.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Department:</span>
              <span className="font-bold text-slate-900">
                {confirmedBooking.doctor?.department?.name || 'Specialist Clinic'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold text-slate-900">{formatDate(confirmedBooking.date)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200/60">
              <span className="text-slate-500">Time:</span>
              <span className="font-bold text-slate-900">
                {formatTime(confirmedBooking.startTime)} – {formatTime(confirmedBooking.endTime)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Location:</span>
              <span className="font-bold text-slate-900">
                Room {confirmedBooking.doctor?.roomNumber || 'Main Floor'}
              </span>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/patient/appointments"
              className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
            >
              View in My Appointments
            </Link>
            <Link
              to="/patient/dashboard"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
