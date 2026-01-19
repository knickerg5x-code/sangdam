
import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/Layout';
import { HomeroomView } from './components/HomeroomView';
import { InstructorView } from './components/InstructorView';
import { NotificationCenter } from './components/NotificationCenter';
import { Role, ConsultationRequest } from './types';
import { GoogleSheetService } from './services/googleSheetService';

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'sms' | 'system' }[]>([]);

  // 서버에서 데이터 동기화
  const syncFromServer = useCallback(async (showLoading = false) => {
    if (showLoading) setIsSyncing(true);
    try {
      const data = await GoogleSheetService.fetchAll();
      const sortedData = data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRequests(sortedData);
      setLastSyncTime(new Date());
      setSyncError(null);
    } catch (e: any) {
      console.error("동기화 실패", e);
      setSyncError("서버와 연결할 수 없습니다. 잠시 후 다시 시도하거나 인터넷 연결을 확인하세요.");
    } finally {
      if (showLoading) setIsSyncing(false);
      setIsInitialLoading(false);
    }
  }, []);

  // 초기 로딩 및 주기적 폴링 (기기 간 실시간 공유를 위해 15초마다 갱신)
  useEffect(() => {
    syncFromServer(true);
    const interval = setInterval(() => syncFromServer(false), 15000);
    return () => clearInterval(interval);
  }, [syncFromServer]);

  const addRequest = async (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: ConsultationRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING' as any,
      createdAt: Date.now(),
      availableTimeSlots: request.availableTimeSlots || [],
    };
    
    // UI 우선 반영 (Optimistic Update)
    setRequests(prev => [newRequest, ...prev]);
    setIsSyncing(true);
    
    const success = await GoogleSheetService.syncAdd(newRequest);
    if (success) {
      setLastSyncTime(new Date());
      addNotification(`상담 신청이 서버에 전송되었습니다.`, 'system');
      // 전송 후 데이터 정합성을 위해 2초 후 재동기화
      setTimeout(() => syncFromServer(false), 2000);
    } else {
      setSyncError("데이터 전송 중 오류가 발생했습니다.");
    }
    setIsSyncing(false);
  };

  const updateRequest = async (id: string, updates: Partial<ConsultationRequest>) => {
    let targetReq: ConsultationRequest | null = null;
    
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = { ...req, ...updates };
        if (updates.status === 'COMPLETED' && req.status !== 'COMPLETED') {
          updated.completedAt = Date.now();
        }
        targetReq = updated;
        return updated;
      }
      return req;
    }));

    if (targetReq) {
      setIsSyncing(true);
      const success = await GoogleSheetService.syncUpdate(targetReq);
      if (success) {
        setLastSyncTime(new Date());
        setTimeout(() => syncFromServer(false), 2000);
      } else {
        setSyncError("상태 업데이트 전송 실패");
      }
      setIsSyncing(false);
    }
  };

  const addNotification = (message: string, type: 'sms' | 'system') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const exportToExcelAndEmail = () => {
    if (requests.length === 0) {
      alert("데이터가 없습니다.");
      return;
    }
    const headers = ["일시", "반", "학생명", "과목", "담당강사", "상담요일", "상담시간", "결과"];
    const rows = requests.map(req => [
      new Date(req.createdAt).toLocaleDateString(),
      req.studentClass,
      req.studentName,
      req.subject,
      req.assignedInstructorName,
      req.proposedDay || "-",
      req.proposedTime || "-",
      `"${(req.instructorNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `청솔_상담내역_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-[4px] border-blue-50 rounded-full"></div>
          <div className="w-16 h-16 border-[4px] border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <h2 className="text-lg font-black text-slate-800 mt-6 tracking-tight">클라우드 연결 중</h2>
        <p className="text-slate-400 mt-2 text-sm font-bold animate-pulse">상담 시스템을 동기화하고 있습니다.</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="text-center mb-10">
            <div className="inline-flex p-5 bg-blue-600 rounded-[1.5rem] mb-6 shadow-xl shadow-blue-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">강북청솔 상담센터</h1>
            <p className="text-slate-400 font-bold">통합 과목 상담 관리 시스템</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setRole('HOMEROOM')}
              className="group w-full py-6 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.8rem] font-black transition-all shadow-xl shadow-blue-100 flex items-center justify-between active:scale-95"
            >
              <div className="flex items-center gap-5">
                <span className="text-3xl">🏫</span>
                <div className="text-left">
                  <span className="block text-xl">담임 모드</span>
                  <span className="text-xs text-blue-200 font-medium">상담 신청 및 학생 전달</span>
                </div>
              </div>
              <svg className="w-6 h-6 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>

            <button
              onClick={() => setRole('INSTRUCTOR')}
              className="group w-full py-6 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.8rem] font-black transition-all shadow-xl shadow-emerald-100 flex items-center justify-between active:scale-95"
            >
              <div className="flex items-center gap-5">
                <span className="text-3xl">📝</span>
                <div className="text-left">
                  <span className="block text-xl">강사 모드</span>
                  <span className="text-xs text-emerald-200 font-medium">시간 제안 및 결과 기록</span>
                </div>
              </div>
              <svg className="w-6 h-6 opacity-40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
          </div>
          <p className="mt-10 text-center text-[11px] text-slate-300 font-black uppercase tracking-[0.2em]">All data synced via Google Cloud</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      role={role} 
      onResetRole={() => setRole(null)} 
      onShare={() => { syncFromServer(true); }}
      onExport={exportToExcelAndEmail}
      isSyncing={isSyncing}
      syncError={syncError}
      lastSyncTime={lastSyncTime}
    >
      {role === 'HOMEROOM' ? (
        <HomeroomView requests={requests} onAddRequest={addRequest} onUpdateStatus={updateRequest} />
      ) : (
        <InstructorView requests={requests} onUpdateStatus={updateRequest} />
      )}
      <NotificationCenter notifications={notifications} />
    </Layout>
  );
};

export default App;
