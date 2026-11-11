import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentService } from '../../services/departmentService';
import { formatCurrency } from '../../utils/formatters';
import {
  HeartPulse,
  Brain,
  Sparkles,
  Activity,
  Baby,
  Stethoscope,
  Flower2,
  Headphones,
  ChevronRight,
  User,
  Calendar,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await departmentService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Fetch departments error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDepartments();
  }, []);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Medical Specialties
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-heading mt-1">
          Clinical Departments & Centers of Excellence
        </h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          MediBook houses 8 fully accredited clinical departments offering both inpatient surgical
          theatres and outpatient specialist consultations.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="space-y-10">
          {departments.map((dept) => {
            const Icon = departmentIcons[dept.name] || Stethoscope;
            return (
              <div
                key={dept.id}
                id={dept.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Dept overview */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center">
                        <Icon className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-navy-900 font-heading">
                          {dept.name}
                        </h2>
                        <span className="text-xs font-semibold text-slate-400">
                          {dept.doctors?.length || 0} Attending Specialists
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {dept.description}
                    </p>

                    <div className="aspect-video rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                      <img
                        src={dept.imageUrl}
                        alt={dept.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Associated Doctors List */}
                  <div className="lg:col-span-7 space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
                      Faculty Clinicians & Specialists
                    </h3>

                    {dept.doctors && dept.doctors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dept.doctors.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3 hover:bg-white hover:shadow-sm transition-all"
                          >
                            <img
                              src={doc.avatarUrl}
                              alt={doc.fullName}
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-navy-900 truncate">
                                {doc.fullName}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                {doc.specialization}
                              </p>
                              <p className="text-xs font-extrabold text-brand-700 mt-1">
                                {formatCurrency(doc.consultationFee)}
                              </p>

                              <div className="mt-2.5 flex items-center gap-2">
                                <Link
                                  to={`/doctors/${doc.id}`}
                                  className="text-[11px] font-bold text-slate-700 hover:text-brand-700"
                                >
                                  Profile
                                </Link>
                                <span className="text-slate-300">•</span>
                                <Link
                                  to={`/patient/book?doctorId=${doc.id}`}
                                  className="text-[11px] font-bold text-brand-700 hover:text-brand-800"
                                >
                                  Book Slot &rarr;
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No specialists currently assigned to this department.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
