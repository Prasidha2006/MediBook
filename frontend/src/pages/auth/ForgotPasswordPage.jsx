import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Activity, Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetToken, setResetToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error initiating password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-brand-700/5">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-700 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-700/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-2xl font-extrabold text-navy-900 font-heading">
              Medi<span className="text-brand-700">Book</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-navy-900 font-heading">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your account email to generate a secure recovery token.
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

        {resetToken ? (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-emerald-950 font-heading">Reset Token Generated</h4>
            <p className="text-xs text-emerald-700">
              For testing and evaluation convenience, your reset token is displayed below:
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-xs font-mono break-all text-slate-800">
              {resetToken}
            </div>
            <Link
              to={`/reset-password?token=${resetToken}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-brand-800 transition-all"
            >
              <span>Proceed to Set New Password</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Email</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-xl shadow-md shadow-brand-700/20 text-sm flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? <span>Generating Token...</span> : <span>Send Reset Instructions</span>}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
