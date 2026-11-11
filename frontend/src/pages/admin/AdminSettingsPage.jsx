import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { ShieldCheck, Database, Server, RefreshCw, FileText } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await adminService.getAuditLogs();
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
          System Settings & Audit Log
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Technical configuration, security infrastructure metrics, and hospital audit event history.
        </p>
      </div>

      {/* SYSTEM INFRASTRUCTURE STATUS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Database</span>
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-lg font-bold text-navy-900">PostgreSQL / Neon</p>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Prisma ORM Connected
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Auth Engine</span>
            <ShieldCheck className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-lg font-bold text-navy-900">JWT + Bcrypt</p>
          <p className="text-xs text-brand-600 font-semibold">
            HTTP-Only Cookie + Bearer
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Deployment</span>
            <Server className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-lg font-bold text-navy-900">Vercel Serverless</p>
          <p className="text-xs text-purple-600 font-semibold">Node.js Express API</p>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-navy-900 font-heading">
              System Audit Event Trail
            </h3>
            <p className="text-xs text-slate-500">
              Immutable log of authentication, bookings, and administrative modifications
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">{logs.length} logged events</span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving audit logs..." />
        ) : (
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100 sticky top-0">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action Code</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Entity ID</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDate(log.createdAt, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-brand-700">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{log.entity}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                      {log.entityId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                      {log.details ? JSON.stringify(log.details) : '—'}
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
