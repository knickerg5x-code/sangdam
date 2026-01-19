
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
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'sms' | 'system' }[]>([]);

  // 서버에서 데이터 동기화
  const syncFromServer = useCallback(async (showLoading = false) => {
    if (showLoading) setIsSyncing(true);
    try {
      const data = await GoogleSheetService.fetchAll();
      if (data && data.length > 0) {
        // ID 기준으로 병합하거나 최신 서버 데이터로 교체
        setRequests(data.sort((a, b) => b.createdAt - a.createdAt));
        setLastSyncTime(new Date());
      }
    } catch (e) {
      console.error("동기화 실패", e);
    } finally {
      if (showLoading) setIsSyncing(false);
      setIsInitialLoading(false);
    }
  }, []);

  // 초기 로딩 및 주기적 폴링 (30초마다)
  useEffect(() => {
    syncFromServer(true);
    const interval = setInterval(() => syncFromServer(false), 30000);
    return () => clearInterval(interval);
  }, [syncFromServer]);

  // 로컬 스토리지 백업 (오프라인 대비)
  useEffect(() => {
    if (requests.length > 0) {
      localStorage.setItem('consultation_requests', JSON.stringify(requests));
    }
  }, [requests]);

  const addRequest = async (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: ConsultationRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING' as any,
      createdAt: Date.now(),
      availableTimeSlots: request.availableTimeSlots || [],
    };
    
    // UI 우선 반영 (Optimistic UI)
    setRequests(prev => [newRequest, ...prev]);
    addNotification(`[새 요청] ${newRequest.studentName} 학생 상담이 등록되었습니다.`, 'system');
    
    setIsSyncing(true);
    const success = await GoogleSheetService.syncAdd(newRequest);
    if (success) setLastSyncTime(new Date());
    setIsSyncing(false);
    
    // 서버와 재동기화해서 확정된 데이터 가져오기
    setTimeout(() => syncFromServer(false), 2000);
  };

  const updateRequest = async (id: string, updates: Partial<ConsultationRequest>) => {
    let targetReq: ConsultationRequest | null = null;
    
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = { ...req, ...updates };
        if (updates.status === 'COMPLETED' && req.status !== 'COMPLETED') {
          updated.completedAt = Date.now();
          addNotification(`[완료] ${req.studentName} 학생 상담이 완료되었습니다.`, 'system');
        }
        targetReq = updated;
        return updated;
      }
      return req;
    }));

    if (targetReq) {
      setIsSyncing(true);
      const success = await GoogleSheetService.syncUpdate(targetReq);
      if (success) setLastSyncTime(new Date());
      setIsSyncing(false);
      
      // 서버 데이터가 시트에 반영될 시간 확보 후 재동기화
      setTimeout(() => syncFromServer(false), 2000);
    }
  };

  const addNotification = (message: string, type: 'sms' | 'system') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const exportToExcelAndEmail = () => {
    if (requests.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }
    const headers = ["ID", "일시", "반", "학생명", "과목", "담당강사", "신청담임", "확정시간", "전달완료", "상태", "상담결과"];
    const rows = requests.map(req => [
      req.id,
      new Date(req.createdAt).toLocaleString(),
      req.studentClass,
      req.studentName,
      req.subject,
      req.assignedInstructorName,
      req.requesterName,
      req.proposedDay ? `${req.proposedDay}요일 ${req.proposedTime}` : "미정",
      req.isDeliveryConfirmed ? "Y" : "N",
      req.status,
      `"${(req.instructorNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `상담데이터_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black text-slate-800">데이터 동기화 중...</h2>
        <p className="text-slate-400 mt-2 font-bold animate-pulse">잠시만 기다려주세요</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 animate-in zoom-in-95 duration-300">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
              <span className="text-4xl">🏛️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">강북청솔 과목별 상담 신청</h1>
            <p className="text-blue-600 font-black text-lg">사용자 성함을 입력하여 접속하세요</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setRole('HOMEROOM')}
              className="group w-full py-5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between active:scale-95"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">🏫</span>
                <span className="text-xl">담임 모드</span>
              </div>
              <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={() => setRole('INSTRUCTOR')}
              className="group w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between active:scale-95"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-xl">강사 모드</span>
              </div>
              <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="mt-8 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">청솔 과목상담 전용 시스템 v2.0</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      role={role} 
      onResetRole={() => setRole(null)} 
      onShare={() => { syncFromServer(true); alert("데이터를 최신화했습니다."); }}
      onExport={exportToExcelAndEmail}
      isSyncing={isSyncing}
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
