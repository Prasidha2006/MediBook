import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-brand-700 animate-spin mb-3`} />
      {text && <p className="text-sm font-medium text-slate-500">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 animate-pulse shadow-sm">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 bg-slate-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
      </div>
      <div className="h-10 bg-slate-100 rounded-xl" />
    </div>
  );
}
