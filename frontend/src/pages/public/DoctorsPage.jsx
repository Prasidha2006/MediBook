import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { formatCurrency } from '../../utils/formatters';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import LoadingSpinner, { SkeletonCard } from '../../components/common/LoadingSpinner';

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, totalPages: 1, total: 0 });

  // Filters state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [departmentId, setDepartmentId] = useState(searchParams.get('departmentId') || '');
  const [minExp, setMinExp] = useState(searchParams.get('minExp') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await departmentService.getDepartments();
        if (res.success) setDepartments(res.data);
      } catch (err) {
        console.error('Dept load error:', err);
      }
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 8,
          ...(search && { search }),
          ...(departmentId && { departmentId }),
          ...(minExp && { minExp }),
          ...(maxFee && { maxFee }),
        };

        const res = await doctorService.getDoctors(params);
        if (res.success) {
          setDoctors(res.data);
          setPagination(res.pagination || { page, limit: 8, totalPages: 1, total: res.data.length });
        }
      } catch (err) {
        console.error('Fetch doctors error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, [page, search, departmentId, minExp, maxFee]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (departmentId) newParams.set('departmentId', departmentId);
    if (minExp) newParams.set('minExp', minExp);
    if (maxFee) newParams.set('maxFee', maxFee);
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartmentId('');
    setMinExp('');
    setMaxFee('');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Certified Medical Faculty
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-heading mt-1">
          Our Doctors & Specialists
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-2xl">
          Browse verified physicians, view credentials, check real-time consultation availability,
          and schedule your visit online.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Doctor or Specialty</label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Jenkins, Cardiology..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Experience</label>
              <select
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900"
              >
                <option value="">Any Experience</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
              </select>
            </div>

            {/* Consultation Fee Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Maximum Consultation Fee</label>
              <select
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900"
              >
                <option value="">Any Fee Range</option>
                <option value="100">Under $100</option>
                <option value="120">Under $120</option>
                <option value="150">Under $150</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{pagination.total}</span> active doctors
            </span>
            <div className="flex items-center gap-2">
              {(search || departmentId || minExp || maxFee) && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* DOCTORS GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading">No doctors match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-5">
            Try adjusting your search terms, removing filters, or searching for another department.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-brand-700 text-white rounded-xl text-xs font-bold"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-card transition-all flex flex-col group"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={doc.avatarUrl}
                  alt={doc.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>4.9</span>
                </div>
                <div className="absolute bottom-3 left-3 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-white">
                  {doc.experienceYears} Years Exp.
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                    {doc.department?.name || doc.specialization}
                  </span>
                  <h3 className="text-lg font-bold text-navy-900 mt-2 font-heading">
                    {doc.fullName}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 line-clamp-1">{doc.qualification}</p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {doc.biography}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Consultation Fee</span>
                    <span className="font-extrabold text-navy-900 text-sm">
                      {formatCurrency(doc.consultationFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
                  <Link
                    to={`/doctors/${doc.id}`}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Profile
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
      )}

      {/* PAGINATION */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {[...Array(pagination.totalPages)].map((_, idx) => (
            <button
              key={idx + 1}
              type="button"
              onClick={() => setPage(idx + 1)}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                page === idx + 1
                  ? 'bg-brand-700 text-white shadow-md shadow-brand-700/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
