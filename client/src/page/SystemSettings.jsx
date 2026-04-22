import React from 'react';
import { Settings } from 'lucide-react';

export default function SystemSettings() {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center"><Settings size={20} /></div>
        <h3 className="text-xl font-bold text-slate-800">Cài đặt hệ thống</h3>
      </div>
      <p className="text-slate-500 mt-2">Tính năng này đang được phát triển...</p>
    </div>
  );
}
