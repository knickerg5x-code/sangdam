
import React from 'react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onResetRole: () => void;
  onShare: () => void;
  onExport: () => void;
  isSyncing?: boolean;
  syncError?: string | null;
  lastSyncTime?: Date | null;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  role, 
  onResetRole, 
  onShare, 
  onExport, 
  isSyncing, 
  syncError,
  lastSyncTime 
}) => {
  return (
    <div className="min-h-screen flex flex-col pb-10 bg-slate-50/50">
      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2.5 rounded-2xl shadow-lg ${role === 'HOMEROOM' ? 'bg-blue-600 shadow-blue-100' : 'bg-emerald-600 shadow-emerald-100'} text-white`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-slate-800 text-lg tracking-tight">청솔 상담센터</h2>
                <div className="flex items-center">
                  {syncError ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px] font-black border border-red-100">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                      연결 오류
                    </div>
                  ) : isSyncing ? (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-[10px] font-black border border-blue-100 animate-pulse">
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      동기화 중
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      실시간 연결됨
                    </div>
                  )}
                </div>
              </div>
              {lastSyncTime && !syncError && (
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{lastSyncTime.toLocaleTimeString()} 마지막 업데이트</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={onShare} 
              className={`p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all shadow-sm ${isSyncing ? 'animate-spin opacity-50' : ''}`}
              title="데이터 새로고침"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
            <button onClick={onExport} className="hidden sm:block px-4 py-2 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-200 active:scale-95 transition-all">내보내기</button>
            <button onClick={onResetRole} className="p-2 text-slate-400 hover:text-red-500 active:scale-95 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-8">
        {syncError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-4">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span className="text-sm font-bold">{syncError}</span>
            <button onClick={onShare} className="ml-auto text-xs font-black underline">재시도</button>
          </div>
        )}
        {children}
      </main>

      <footer className="mt-auto py-12 px-4">
        <div className="max-w-4xl mx-auto text-center border-t border-slate-200/60 pt-8">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] mb-4">Cloud-Native Synchronization Active</p>
          <div className="flex justify-center gap-6">
            <a href="https://docs.google.com/spreadsheets/d/17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo/edit" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-blue-500 font-bold hover:underline bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
              구글 시트 바로가기
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
