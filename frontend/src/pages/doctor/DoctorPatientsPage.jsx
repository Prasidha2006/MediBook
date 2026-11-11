import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { formatDate } from '../../utils/formatters';
import { Users, Phone, Calendar, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await doctorService.getDoctorPatients();
        if (res.success) {
          setPatients(res.data);
        }
      } catch (err) {
        console.error('Error fetching doctor patients:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.lastReason?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Clinical Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered patients who have consulted or scheduled visits with your clinic.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading patient directory..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">No patient records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Patient Name</th>
                  <th className="py-3.5 px-6">Phone Contact</th>
                  <th className="py-3.5 px-6">Gender / Blood</th>
                  <th className="py-3.5 px-6">Total Consultations</th>
                  <th className="py-3.5 px-6">Most Recent Visit</th>
                  <th className="py-3.5 px-6">Last Reported Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{pat.fullName}</td>
                    <td className="py-4 px-6 text-slate-700">{pat.phone}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800">{pat.gender || 'N/A'}</span>
                      {pat.bloodGroup && (
                        <span className="ml-1.5 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                          {pat.bloodGroup}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{pat.totalVisits} visit(s)</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">{formatDate(pat.lastVisit)}</td>
                    <td className="py-4 px-6 max-w-xs truncate text-slate-500">
                      {pat.lastReason || 'General follow-up'}
                    </td>
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
