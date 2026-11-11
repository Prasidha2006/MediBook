import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-accent-500 flex items-center justify-center text-white shadow-md">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-extrabold text-white font-heading tracking-tight">
                Medi<span className="text-brand-400">Book</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Your Health, Your Time. MediBook is a modern, enterprise hospital appointment booking
              system connecting patients with certified medical specialists in real time.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>HIPAA-Compliant Security & Verified Medical Practitioners</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-wider uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/doctors" className="hover:text-brand-300 transition-colors">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/departments" className="hover:text-brand-300 transition-colors">
                  Departments & Specialties
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">
                  About MediBook
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-300 transition-colors">
                  Emergency & Contacts
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-wider uppercase mb-4">
              Access Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Patient Portal Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-brand-300 transition-colors">
                  Patient Self-Registration
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Doctor Practice Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-300 transition-colors">
                  Hospital Administration
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-heading font-bold text-sm tracking-wider uppercase mb-4">
              Hospital HQ
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>100 Healthcare Parkway, West Medical City, MC 90210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (800) MEDI-BOOK / (555) 019-2830</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>care@medibook.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 shrink-0" />
                <span>24/7 Emergency & ICU Care</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MediBook Healthcare System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for healthcare excellence</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
