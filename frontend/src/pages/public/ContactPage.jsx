import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Inquiries',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          24/7 Support & Care
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-900 font-heading mt-1">
          Contact MediBook Hospital
        </h1>
        <p className="text-slate-500 text-sm mt-2 leading-relaxed">
          Need assistance with appointments, medical billing, or emergency guidance? Our clinical
          liaison team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-navy-900 font-heading">Hospital Location & Contacts</h3>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Main Campus Address</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    100 Healthcare Parkway, West Medical City, MC 90210
                  </p>
                  <p className="text-xs text-slate-500">Pavilion A & B, Outpatient Lobby Level 1</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency & Appointments</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">
                    Emergency: +1 (800) MEDI-BOOK / (555) 019-2830
                  </p>
                  <p className="text-xs text-slate-500">Appointments Desk: Ext. 402</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Inquiries</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">care@medibook.com</p>
                  <p className="text-xs text-slate-500">Patient Billing: billing@medibook.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Hospital Operating Hours</h4>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">Emergency & Trauma: 24/7/365</p>
                  <p className="text-xs text-slate-500">Outpatient Clinics: Mon – Sat, 8:00 AM – 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Map Placeholder */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-400">Campus Directions</span>
              <h4 className="text-lg font-bold font-heading">Valet Parking & Emergency Bay</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complimentary hospital valet parking is located at Gate 2 along Healthcare Parkway.
                Accessible ramps and wheelchair services are stationed at all main portals.
              </p>
            </div>
            {/* Abstract map graphic background */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-navy-900 font-heading">Send Us a Direct Message</h3>
            <p className="text-xs text-slate-500 mt-1">
              For medical emergencies, please dial 911 or call our Emergency hotline immediately.
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-emerald-900 font-heading">Message Dispatched Successfully</h4>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Thank you for contacting MediBook. A patient care coordinator will review your inquiry and
                reply via email or phone within 4 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', department: 'General Inquiries', message: '' });
                }}
                className="mt-2 text-xs font-bold text-brand-700 underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Topic</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 text-slate-900"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Appointment Support">Appointment Support</option>
                    <option value="Medical Records">Medical Records</option>
                    <option value="Patient Billing">Patient Billing</option>
                    <option value="Doctor Inquiries">Doctor Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Message / Inquiry *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our clinical support team help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-600 text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl shadow-md shadow-brand-700/20 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
