import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Search,
  Clock,
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  Star,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Brain,
  Sparkles,
  Activity,
  Baby,
  Flower2,
  Headphones,
  ArrowRight,
} from 'lucide-react';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { formatCurrency } from '../../utils/formatters';

export default function HomePage() {
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [docsRes, deptRes] = await Promise.all([
          doctorService.getDoctors({ limit: 4 }),
          departmentService.getDepartments(),
        ]);
        if (docsRes.success) setFeaturedDoctors(docsRes.data);
        if (deptRes.success) setDepartments(deptRes.data);
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm) query.set('search', searchTerm);
    if (selectedDept) query.set('departmentId', selectedDept);
    navigate(`/doctors?${query.toString()}`);
  };

  const departmentIcons = {
    Cardiology: HeartPulse,
    Neurology: Brain,
    Dermatology: Sparkles,
    Orthopedics: Activity,
    Pediatrics: Baby,
    'General Medicine': Stethoscope,
    Gynecology: Flower2,
    ENT: Headphones,
  };

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
                Next-Gen Hospital Appointment Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 leading-[1.1] tracking-tight">
                Your Health, Your Time.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-700 to-accent-600">
                  Book Your Doctor Online.
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Skip waiting queues. Schedule real-time outpatient appointments with verified medical
                specialists across 8 major departments in seconds.
              </p>

              {/* Doctor Search Widget */}
              <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl shadow-brand-700/5 border border-slate-200/80">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5 relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Doctor name or specialty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl text-sm border-0 focus:ring-2 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl text-sm border-0 focus:ring-2 focus:ring-brand-600 transition-all text-slate-800"
                    >
                      <option value="">All Departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-full py-3 px-5 bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm rounded-2xl shadow-md shadow-brand-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span>Find</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Key Trust Stats */}
              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-slate-200/60 max-w-lg">
                <div>
                  <p className="text-2xl font-extrabold text-navy-900 font-heading">24/7</p>
                  <p className="text-xs text-slate-500 font-medium">Care & Emergency</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-900 font-heading">100%</p>
                  <p className="text-xs text-slate-500 font-medium">Board Certified</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-navy-900 font-heading">0 min</p>
                  <p className="text-xs text-slate-500 font-medium">Lobby Wait Time</p>
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80"
                    alt="Healthcare Professional"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                      Chief of Medicine
                    </span>
                    <h3 className="text-xl font-bold font-heading">Dr. Alexander Hayes</h3>
                    <p className="text-xs text-slate-200 mt-1">
                      Johns Hopkins Fellow • Over 1,200 successful patient consultations this year
                    </p>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Instant Confirmation</p>
                    <p className="text-[11px] text-slate-500">Real-time schedule synchronization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MEDICAL DEPARTMENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Specialized Care
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 font-heading mt-1">
              Medical Departments
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Comprehensive inpatient and outpatient specialties led by world-class department chairs.
            </p>
          </div>
          <Link
            to="/departments"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 mt-4 sm:mt-0"
          >
            <span>View All 8 Departments</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {departments.map((dept) => {
            const Icon = departmentIcons[dept.name] || Stethoscope;
            return (
              <Link
                key={dept.id}
                to={`/doctors?departmentId=${dept.id}`}
                className="group p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-card transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 group-hover:bg-brand-700 group-hover:text-white flex items-center justify-center mb-5 transition-colors">
                  <Icon className="w-6 h-6 stroke-[2]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors font-heading">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>{dept.doctorsCount || 1} Specialists</span>
                  <span className="text-brand-700 group-hover:translate-x-1 transition-transform">
                    View &rarr;
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED DOCTORS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              Top Specialists
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 font-heading mt-1">
              Featured Doctors
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Meet our distinguished clinicians offering in-person and specialized consultations.
            </p>
          </div>
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-800 mt-4 sm:mt-0"
          >
            <span>See All Certified Doctors</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-card transition-all flex flex-col"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={doc.avatarUrl}
                  alt={doc.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>4.9</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {doc.department?.name || doc.specialization}
                  </span>
                  <h3 className="text-base font-bold text-navy-900 mt-2 font-heading">
                    {doc.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{doc.qualification}</p>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span>{doc.experienceYears} Years Exp.</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(doc.consultationFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Profile
                  </Link>
                  <Link
                    to={`/patient/book?doctorId=${doc.id}`}
                    className="py-2.5 px-3 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-center text-xs font-bold shadow-sm transition-all"
                  >
                    Book Slot
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE MEDIBOOK */}
      <section className="bg-white py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
              The MediBook Advantage
            </span>
            <h2 className="text-3xl font-extrabold text-navy-900 font-heading mt-2">
              Why Patients Choose MediBook
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              Designed to eliminate healthcare friction with real-time slot synchronization, secure
              records, and transparent specialist schedules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 font-heading">
                Zero Lobby Waiting
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose an exact 30-minute consultation window. Arrive at your doctor’s dedicated room
                number without sitting in crowded waiting areas.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-100 text-accent-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 font-heading">
                Verified Medical Credentials
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every physician on MediBook is rigorously vetted, board-certified, and reviewed by
                our medical credentialing committee before opening appointments.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/70 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 font-heading">
                Instant Calendar Sync
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive instant confirmation codes, cancellation flexibility, and doctor consultation
                notes directly stored in your personal patient portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Step-by-Step
          </span>
          <h2 className="text-3xl font-extrabold text-navy-900 font-heading mt-2">
            How MediBook Works
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Booking a hospital consultation takes less than 60 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-brand-700/20 mx-auto sm:mx-0">
              1
            </div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">Find Your Specialist</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Filter by department, experience, or consultation fee to find the right clinician.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-brand-700/20 mx-auto sm:mx-0">
              2
            </div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">Select Date & Slot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our system checks real-time doctor availability, excluding leaves and overlaps.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-brand-700/20 mx-auto sm:mx-0">
              3
            </div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">Provide Reason</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add your clinical symptoms so the doctor can prepare ahead of your appointment.
            </p>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-brand-700 text-white font-extrabold flex items-center justify-center text-lg shadow-md shadow-brand-700/20 mx-auto sm:mx-0">
              4
            </div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">Instant Confirmation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get an appointment number, room directions, and calendar reminders immediately.
            </p>
          </div>
        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Patient Stories
          </span>
          <h2 className="text-3xl font-extrabold text-navy-900 font-heading mt-2">
            Trusted by Thousands of Patients
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                “Booking an urgent appointment with Dr. Jenkins in Cardiology was effortless. I was
                seen within 10 minutes of walking into the hospital wing. Exceptional service.”
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                EM
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Emily Miller</p>
                <p className="text-[11px] text-slate-400">Cardiology Patient</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                “As a mother of two, MediBook makes scheduling pediatric checkups with Dr. Patel so
                easy. The slot availability is always accurate and we never wait in hallways.”
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                SK
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Sarah Kowalski</p>
                <p className="text-[11px] text-slate-400">Pediatrics Patient</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic">
                “Following knee arthroscopy with Dr. Vance, scheduling follow-ups through the patient
                portal has been seamless. The doctor notes are clear and accessible anytime.”
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">
                RT
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Robert Thompson</p>
                <p className="text-[11px] text-slate-400">Orthopedics Patient</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-800 to-accent-700 text-white p-8 sm:p-14 relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">
              Ready to schedule your appointment?
            </h2>
            <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
              Create your patient account or browse our full staff of certified physicians. Your
              health records and bookings remain secured under HIPAA guidelines.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-6 py-3.5 bg-white text-brand-800 font-bold rounded-2xl shadow-lg hover:bg-brand-50 transition-all text-sm"
              >
                Register as Patient
              </Link>
              <Link
                to="/doctors"
                className="px-6 py-3.5 bg-brand-900/50 hover:bg-brand-900/70 border border-white/20 text-white font-bold rounded-2xl transition-all text-sm"
              >
                Find Doctors
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
