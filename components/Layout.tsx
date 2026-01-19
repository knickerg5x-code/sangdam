
import React from 'react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onResetRole: () => void;
  onShare: () => void;
  onExport: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onResetRole, onShare, onExport }) => {
  return (
    <div className="min-h-screen flex flex-col pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${role === 'HOMEROOM' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm md:text-base">과목별 상담 신청</h2>
              <p className="text-[10px] text-slate-500 font-medium italic">{role === 'HOMEROOM' ? '담임 교사' : '교과 강사'} 모드</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={onExport} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100">보고서 전송</button>
            <button onClick={onShare} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold transition-all">공유 링크</button>
            <button onClick={onResetRole} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 p-1">모드 변경</button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6">
        {children}
      </main>

      <footer className="mt-auto py-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          과목별 상담 신청 시스템 • knickerg5x@gmail.com
        </div>
      </footer>
    </div>
  );
};
