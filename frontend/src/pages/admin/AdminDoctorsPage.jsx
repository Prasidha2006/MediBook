import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: 'Doctor@123',
    fullName: '',
    departmentId: '',
    qualification: '',
    specialization: '',
    experienceYears: 5,
    consultationFee: 100,
    biography: '',
    roomNumber: 'Suite 101, Main Wing',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    isApproved: true,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, deptRes] = await Promise.all([
        adminService.getDoctors({ search, departmentId: selectedDept }),
        departmentService.getDepartments(),
      ]);
      if (docsRes.success) setDoctors(docsRes.data);
      if (deptRes.success) {
        setDepartments(deptRes.data);
        if (!formData.departmentId && deptRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, departmentId: deptRes.data[0].id }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedDept]);

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setFormData({
      email: '',
      password: 'Doctor@123',
      fullName: '',
      departmentId: departments[0]?.id || '',
      qualification: '',
      specialization: '',
      experienceYears: 5,
      consultationFee: 100,
      biography: '',
      roomNumber: 'Suite 201, OPD',
      phone: '+1 (555) 019-2840',
      avatarUrl:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
      isApproved: true,
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingDoctor(doc);
    setFormData({
      email: doc.user?.email || '',
      password: '',
      fullName: doc.fullName,
      departmentId: doc.departmentId,
      qualification: doc.qualification,
      specialization: doc.specialization,
      experienceYears: doc.experienceYears,
      consultationFee: Number(doc.consultationFee),
      biography: doc.biography,
      roomNumber: doc.roomNumber || '',
      phone: doc.phone || '',
      avatarUrl: doc.avatarUrl || '',
      isApproved: doc.isApproved,
      isActive: doc.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (editingDoctor) {
        const res = await adminService.updateDoctor(editingDoctor.id, formData);
        if (res.success) {
          setSuccess(`Doctor ${formData.fullName} updated.`);
          setModalOpen(false);
          fetchData();
        }
      } else {
        const res = await adminService.createDoctor(formData);
        if (res.success) {
          setSuccess(`Doctor account provisioned for ${formData.fullName}.`);
          setModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save doctor.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (doc) => {
    try {
      const res = await adminService.updateDoctor(doc.id, { isActive: !doc.isActive });
      if (res.success) {
        setSuccess(`Doctor ${doc.fullName} is now ${!doc.isActive ? 'Active' : 'Deactivated'}.`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to update status.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete doctor ${name}?`)) return;
    try {
      const res = await adminService.deleteDoctor(id);
      if (res.success) {
        setSuccess(`Doctor ${name} removed.`);
        fetchData();
      }
    } catch (err) {
      setError('Failed to delete doctor.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
            Medical Faculty
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
            Doctor Management
          </h1>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Doctor</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* SEARCH AND FILTER */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search doctor or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          />
        </div>

        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* DOCTORS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Loading doctors..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Doctor</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Experience & Fee</th>
                  <th className="py-3.5 px-6">Contact / Room</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{doc.fullName}</p>
                        <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-brand-700">
                      {doc.department?.name || doc.specialization}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{formatCurrency(doc.consultationFee)}</p>
                      <p className="text-[11px] text-slate-500">{doc.experienceYears}y experience</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      <p>{doc.phone || 'No phone'}</p>
                      <p className="text-[11px] text-slate-400">{doc.roomNumber || 'OPD'}</p>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(doc)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                          doc.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(doc)}
                        className="p-1.5 text-slate-600 hover:text-brand-700 hover:bg-slate-100 rounded-lg"
                        title="Edit Doctor"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id, doc.fullName)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                        title="Delete Doctor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor Information' : 'Provision New Doctor Account'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingDoctor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Doctor Login Email *</label>
                <input
                  type="email"
                  required
                  placeholder="doctor@medibook.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                placeholder="Dr. Emily Watson"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Qualifications *</label>
              <input
                type="text"
                required
                placeholder="MD, MBBS, Columbia"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Specialization *</label>
              <input
                type="text"
                required
                placeholder="Pediatric Cardiology"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
              <input
                type="number"
                min="0"
                value={formData.experienceYears}
                onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Fee ($)</label>
              <input
                type="number"
                min="0"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Room Number</label>
              <input
                type="text"
                value={formData.roomNumber}
                onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Avatar Photo URL</label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Biography</label>
            <textarea
              rows={3}
              value={formData.biography}
              onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
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
              {submitting ? 'Saving...' : editingDoctor ? 'Save Changes' : 'Provision Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
