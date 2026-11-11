import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useAuth } from '../../hooks/useAuth';
import { User, Phone, MapPin, DollarSign, Save, ShieldCheck } from 'lucide-react';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function loadDoctor() {
      try {
        const res = await doctorService.getDoctorDashboard();
        if (res.success && res.data.doctor) {
          setProfile(res.data.doctor);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading profile.');
      } finally {
        setLoading(false);
      }
    }
    loadDoctor();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await doctorService.updateDoctorProfile({
        fullName: profile.fullName,
        qualification: profile.qualification,
        specialization: profile.specialization,
        experienceYears: Number(profile.experienceYears),
        consultationFee: Number(profile.consultationFee),
        biography: profile.biography,
        roomNumber: profile.roomNumber,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      });

      if (res.success) {
        setSuccess('Doctor profile updated successfully.');
        updateUserProfile({ doctor: res.data });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading doctor profile..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          Practitioner Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 font-heading mt-1">
          Edit Physician Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          This information is displayed publicly on the doctor directory and department pages.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Doctor Full Name *</label>
            <input
              type="text"
              required
              value={profile?.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Department (Read-only)</label>
            <input
              type="text"
              disabled
              value={profile?.department?.name || 'Department Specialist'}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Qualification *</label>
            <input
              type="text"
              required
              placeholder="e.g. MD, FACC, Harvard Medical School"
              value={profile?.qualification || ''}
              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Specialization *</label>
            <input
              type="text"
              required
              placeholder="e.g. Interventional Cardiology"
              value={profile?.specialization || ''}
              onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Experience (Years)</label>
            <input
              type="number"
              min="0"
              value={profile?.experienceYears || 1}
              onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Consultation Fee ($ USD)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={profile?.consultationFee || 50}
              onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Clinic Room Number</label>
            <input
              type="text"
              placeholder="Suite 302, West Wing"
              value={profile?.roomNumber || ''}
              onChange={(e) => setProfile({ ...profile, roomNumber: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct Clinic Phone</label>
          <input
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={profile?.phone || ''}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Avatar Image URL</label>
          <input
            type="url"
            placeholder="https://..."
            value={profile?.avatarUrl || ''}
            onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Professional Biography</label>
          <textarea
            rows={4}
            value={profile?.biography || ''}
            onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-brand-600"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
