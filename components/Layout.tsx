
import React from 'react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onResetRole: () => void;
  onShare: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onResetRole, onShare }) => {
  return (
    <div className="min-h-screen flex flex-col pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${role === 'HOMEROOM' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {role === 'HOMEROOM' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-800 leading-tight text-sm md:text-base">
                {role === 'HOMEROOM' ? '담임 교사' : '교과 강사'}
              </h2>
              <p className="text-[10px] md:text-xs text-slate-500 font-medium italic">Consultation Hub</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              title="현재 상담 목록을 링크로 공유"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              목록 공유 링크
            </button>
            <button
              onClick={onResetRole}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-6">
        {children}
      </main>

      <footer className="mt-auto py-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center text-slate-400 text-[10px] uppercase tracking-widest font-bold">
          Teacher Consultation Hub • school collaboration system
        </div>
      </footer>
    </div>
  );
};
