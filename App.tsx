
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

  const syncFromServer = useCallback(async (showLoading = false) => {
    if (showLoading) setIsSyncing(true);
    try {
      const data = await GoogleSheetService.fetchAll();
      setRequests(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLastSyncTime(new Date());
      setSyncError(null);
    } catch (e: any) {
      console.error("Sync Error:", e);
      setSyncError("데이터를 불러오지 못했습니다. 스프레드시트 배포 상태를 확인하세요.");
    } finally {
      if (showLoading) setIsSyncing(false);
      setIsInitialLoading(false);
    }
  }, []);

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
    
    setRequests(prev => [newRequest, ...prev]);
    setIsSyncing(true);
    
    const success = await GoogleSheetService.syncAdd(newRequest);
    if (success) {
      setLastSyncTime(new Date());
      addNotification(`상담 신청 완료 (동기화 중...)`, 'system');
      setTimeout(() => syncFromServer(false), 3000);
    } else {
      setSyncError("서버 저장 실패");
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
        setTimeout(() => syncFromServer(false), 3000);
      } else {
        setSyncError("상태 업데이트 실패");
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
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-black text-slate-800">서버 데이터 동기화 중...</h2>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full text-center">
          <div className="inline-flex p-5 bg-blue-600 rounded-[1.5rem] mb-6 shadow-xl">
             <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">강북청솔 상담센터</h1>
          <p className="text-slate-400 font-bold mb-8">역할을 선택해 주세요</p>
          <div className="space-y-4">
            <button onClick={() => setRole('HOMEROOM')} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg active:scale-95 transition-all">담임 선생님</button>
            <button onClick={() => setRole('INSTRUCTOR')} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg active:scale-95 transition-all">교과 강사</button>
          </div>
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
