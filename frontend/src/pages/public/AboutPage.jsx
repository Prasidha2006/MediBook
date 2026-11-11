import React from 'react';
import { ShieldCheck, Award, Users, HeartPulse, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">
          About MediBook Healthcare
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-navy-900 font-heading">
          Pioneering Patient-Centered Healthcare Since 1998
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          MediBook is an integrated tertiary healthcare system combining award-winning clinical
          excellence, research breakthroughs, and modern digital appointment accessibility.
        </p>
      </div>

      {/* Grid of Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
            <HeartPulse className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 font-heading">Compassionate Care</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our multi-disciplinary care teams prioritize human empathy alongside rigorous clinical
            protocols, ensuring personalized attention for every patient.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-accent-50 text-accent-700 flex items-center justify-center font-bold">
            <Award className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 font-heading">Accredited Excellence</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Fully accredited by the Joint Commission on Accreditation of Healthcare Organizations
            (JCAHO) and ranked among top regional medical institutions.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 font-heading">Digital Health Platform</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Eliminating bureaucratic friction with instant appointment scheduling, automated doctor
            availability management, and encrypted medical records.
          </p>
        </div>
      </div>

      {/* Clinical Leadership & Statistics */}
      <div className="bg-navy-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-extrabold font-heading text-brand-400">150+</p>
            <p className="text-xs text-slate-300 uppercase tracking-wider mt-1">Specialist Physicians</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold font-heading text-brand-400">45,000+</p>
            <p className="text-xs text-slate-300 uppercase tracking-wider mt-1">Annual Consultations</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold font-heading text-brand-400">8</p>
            <p className="text-xs text-slate-300 uppercase tracking-wider mt-1">Centers of Excellence</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold font-heading text-brand-400">99.4%</p>
            <p className="text-xs text-slate-300 uppercase tracking-wider mt-1">Patient Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}
