import React from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

export default function Alert({ type = 'info', title, message, onClose, className = '' }) {
  const configs = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    },
  };

  const current = configs[type] || configs.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 relative ${current.bg} ${className}`}>
      {current.icon}
      <div className="flex-1 text-sm">
        {title && <h5 className="font-semibold mb-0.5 leading-snug">{title}</h5>}
        {message && <div className="text-sm opacity-90 leading-relaxed">{message}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
