import React, { useState } from 'react';
import { NavLink, Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Clock,
  Users,
  Building2,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  PlusCircle,
  ClipboardList,
  ShieldAlert,
  ChevronRight,
  Bell,
} from 'lucide-react';

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Nav configurations per role
  const patientNav = [
    { label: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Book Appointment', path: '/patient/book', icon: PlusCircle },
    { label: 'My Appointments', path: '/patient/appointments', icon: Calendar },
    { label: 'Medical Profile', path: '/patient/profile', icon: User },
    { label: 'Settings', path: '/patient/settings', icon: Settings },
  ];

  const doctorNav = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/doctor/appointments', icon: ClipboardList },
    { label: 'Weekly Calendar', path: '/doctor/calendar', icon: Calendar },
    { label: 'Availability & Leaves', path: '/doctor/availability', icon: Clock },
    { label: 'Patient Directory', path: '/doctor/patients', icon: Users },
    { label: 'Doctor Profile', path: '/doctor/profile', icon: User },
  ];

  const adminNav = [
    { label: 'Overview Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Doctor Management', path: '/admin/doctors', icon: Users },
    { label: 'Patient Directory', path: '/admin/patients', icon: ClipboardList },
    { label: 'Departments', path: '/admin/departments', icon: Building2 },
    { label: 'All Appointments', path: '/admin/appointments', icon: Calendar },
    { label: 'Doctor Schedules', path: '/admin/schedules', icon: Clock },
    { label: 'Settings & Audit', path: '/admin/settings', icon: Settings },
  ];

  const navItems =
    role === 'ADMIN' ? adminNav : role === 'DOCTOR' ? doctorNav : patientNav;

  const roleTitle =
    role === 'ADMIN' ? 'Hospital Admin' : role === 'DOCTOR' ? 'Doctor Portal' : 'Patient Portal';

  return (
    <div className="min-h-screen bg-slate-50/70 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-700 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-700/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-navy-900 font-heading">
                Medi<span className="text-brand-700">Book</span>
              </span>
              <span className="block text-[10px] font-bold text-brand-600 uppercase tracking-wider">
                {roleTitle}
              </span>
            </div>
          </Link>
          <button
            type="button"
            className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card in Sidebar */}
        <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
            {user?.patient?.fullName?.charAt(0) ||
              user?.doctor?.fullName?.charAt(0) ||
              user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-900 truncate">
              {user?.patient?.fullName || user?.doctor?.fullName || 'Hospital Staff'}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-100'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? 'text-brand-700 stroke-[2.2]'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-brand-500" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer logout in sidebar */}
        <div className="p-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                MediBook Portal
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-heading">{roleTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors hidden sm:block"
            >
              View Public Website
            </Link>
            <div className="h-6 w-px bg-slate-200 hidden sm:block" />
            <button
              type="button"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600" />
            </button>
          </div>
        </header>

        {/* Dashboard page view */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
