import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { formatCurrency, getDayName, formatTime } from '../../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Award,
  CheckCircle2,
  ShieldCheck,
  Star,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected date for previewing slots
  const todayStr = new Date().toISOString().split('T')[0];
  const [previewDate, setPreviewDate] = useState(todayStr);
  const [slotsData, setSlotsData] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    async function loadDoctor() {
      setLoading(true);
      try {
        const res = await doctorService.getDoctorById(id);
        if (res.success) {
          setDoctor(res.data);
        } else {
          setError(res.message || 'Doctor not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading doctor profile');
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, [id]);

  useEffect(() => {
    async function loadSlots() {
      if (!id || !previewDate) return;
      setSlotsLoading(true);
      try {
        const res = await doctorService.getDoctorSlots(id, previewDate);
        if (res.success) {
          setSlotsData(res.data);
        }
      } catch (err) {
        console.warn('Slot preview notice:', err.message);
      } finally {
        setSlotsLoading(false);
      }
    }
    loadSlots();
  }, [id, previewDate]);

  if (loading) {
    return <LoadingSpinner text="Loading doctor profile & practice hours..." />;
  }

  if (error || !doctor) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Doctor Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">{error || 'Unable to locate physician record.'}</p>
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-700 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Doctors</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        to="/doctors"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors Directory</span>
      </Link>

      {/* DOCTOR HERO PROFILE CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Avatar Photo */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-inner relative">
              <img
                src={doctor.avatarUrl}
                alt={doctor.fullName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>4.9 (180+ Reviews)</span>
              </div>
            </div>
          </div>

          {/* Core Info */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-lg border border-brand-200">
                {doctor.department?.name || doctor.specialization}
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Board Certified
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-heading">
              {doctor.fullName}
            </h1>
            <p className="text-sm font-semibold text-slate-600">{doctor.qualification}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-100">
              <div>
                <p className="text-xs text-slate-400 font-medium">Experience</p>
                <p className="text-base font-extrabold text-navy-900 mt-0.5">
                  {doctor.experienceYears} Years
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Consultation Fee</p>
                <p className="text-base font-extrabold text-brand-700 mt-0.5">
                  {formatCurrency(doctor.consultationFee)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Clinic Room</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {doctor.roomNumber || 'Main OPD'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Direct Phone</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {doctor.phone || '+1 800-MEDIBOOK'}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-2 font-heading">
                About the Physician
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                {doctor.biography}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to={`/patient/book?doctorId=${doctor.id}`}
                className="px-6 py-3.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-2xl shadow-md shadow-brand-700/20 hover:shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation with {doctor.fullName}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE & SLOTS PREVIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Weekly Recurring Schedule */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Clinic Hours
            </span>
            <h3 className="text-xl font-bold text-navy-900 font-heading mt-1">
              Weekly Practice Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Regular outpatient visiting hours. 30-minute individual time slots.
            </p>
          </div>

          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
              const sched = doctor.schedules?.find(
                (s) => s.dayOfWeek === dayIndex && s.isActive
              );
              return (
                <div
                  key={dayIndex}
                  className={`p-3 rounded-2xl flex items-center justify-between text-xs font-semibold ${
                    sched
                      ? 'bg-slate-50 border border-slate-200/60 text-slate-800'
                      : 'bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <span className="font-bold">{getDayName(dayIndex)}</span>
                  {sched ? (
                    <span className="text-brand-700 font-bold">
                      {formatTime(sched.startTime)} – {formatTime(sched.endTime)}
                    </span>
                  ) : (
                    <span className="text-slate-400">Off Duty</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Slot Availability Checker */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
                Real-Time Availability
              </span>
              <h3 className="text-xl font-bold text-navy-900 font-heading mt-1">
                Check Date Slots
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="previewDate" className="text-xs font-bold text-slate-600">
                Date:
              </label>
              <input
                id="previewDate"
                type="date"
                min={todayStr}
                value={previewDate}
                onChange={(e) => setPreviewDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {slotsLoading ? (
            <LoadingSpinner text="Checking live slot inventory..." size="sm" />
          ) : !slotsData || slotsData.slots.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs font-semibold text-slate-500">
                {slotsData?.message || 'No consultation slots available on this date.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Available Slots:{' '}
                  <strong className="text-emerald-600 font-bold">
                    {slotsData.availableSlotsCount}
                  </strong>{' '}
                  of {slotsData.totalSlots}
                </span>
                <span className="text-[11px]">30-minute intervals</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {slotsData.slots.map((s, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-center text-xs font-bold border transition-all ${
                      s.isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70'
                    }`}
                  >
                    {formatTime(s.startTime)}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Ready to book this date?</span>
                <Link
                  to={`/patient/book?doctorId=${doctor.id}&date=${previewDate}`}
                  className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Proceed with Booking &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
