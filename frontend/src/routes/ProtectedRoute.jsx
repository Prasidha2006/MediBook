import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isAuthenticated, isLoading, getDashboardRedirectUrl } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-brand-700 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-500">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // If authenticated user tries to access a role route they do not own, redirect to their dashboard
    return <Navigate to={getDashboardRedirectUrl()} replace />;
  }

  return <Outlet />;
}
