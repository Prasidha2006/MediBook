import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Users, Search, Phone, Mail, Calendar, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatients() {
      try {
        const res = await adminService.getPatients();
        if (res.success) {
          setPatients(res.data);
        }
      } catch (err) {
        console.error('Error loading patients:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPatients();
  }, []);

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Hospital Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Patient Directory
          </h1>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading patient roster..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">Blood / Gender</th>
                  <th className="py-3.5 px-6">Total Bookings</th>
                  <th className="py-3.5 px-6">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{pat.fullName}</td>
                    <td className="py-4 px-6 text-slate-600">{pat.user?.email || 'N/A'}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{pat.phone}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">{pat.gender || 'N/A'}</span>
                      {pat.bloodGroup && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                          {pat.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-brand-700">
                      {pat.totalAppointments || 0} appointment(s)
                    </td>
                    <td className="py-4 px-6 text-slate-500">{formatDate(pat.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
