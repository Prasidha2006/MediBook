import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Activity, Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, Stethoscope, User } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const { login, getDashboardRedirectUrl } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await login({ email, password });
      // Redirect to previously requested URL or appropriate role dashboard
      const redirectUrl = from || getDashboardRedirectUrl(data.user.role);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo credentials
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-brand-700/5">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold text-navy-900 font-heading">
              Medi<span className="text-brand-700">Book</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900 font-heading">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your patient appointments, doctor schedules, or administrative portal
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {/* Demo Account Quick Switchers */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 text-center">
            One-Click Demo Credentials:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('john.doe@example.com', 'Patient@123')}
              className="py-1.5 px-2 bg-white hover:bg-brand-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-brand-700 flex flex-col items-center gap-0.5 transition-colors shadow-xs"
            >
              <User className="w-3.5 h-3.5 text-brand-600" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('dr.jenkins@medibook.com', 'Doctor@123')}
              className="py-1.5 px-2 bg-white hover:bg-purple-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-purple-700 flex flex-col items-center gap-0.5 transition-colors shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-purple-600" />
              <span>Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@medibook.com', 'Admin@123')}
              className="py-1.5 px-2 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:text-rose-700 flex flex-col items-center gap-0.5 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 focus:bg-white text-slate-900 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-md shadow-brand-700/20 text-sm flex items-center justify-center gap-2 transition-all mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-brand-700 hover:underline">
            Register as Patient
          </Link>
        </div>
      </div>
    </div>
  );
}
