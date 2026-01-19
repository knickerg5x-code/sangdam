
import React from 'react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onResetRole: () => void;
  onShare: () => void;
  onExport: () => void;
  isSyncing?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, role, onResetRole, onShare, onExport, isSyncing }) => {
  return (
    <div className="min-h-screen flex flex-col pb-10">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${role === 'HOMEROOM' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-800 text-sm md:text-base">과목별 상담 신청</h2>
                {isSyncing ? (
                  <div className="flex items-center gap-1 text-[10px] text-blue-500 font-bold animate-pulse">
                    <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    시트 동기화 중
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold opacity-60" title="구글 스프레드시트와 연동됨">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    시트 연결됨
                  </div>
                )}
              </div>
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
          과목별 상담 신청 시스템 • <a href="https://docs.google.com/spreadsheets/d/17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo/edit" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">구글 시트 열기</a>
        </div>
      </footer>
    </div>
  );
};
