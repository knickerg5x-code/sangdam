
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomeroomView } from './components/HomeroomView';
import { InstructorView } from './components/InstructorView';
import { NotificationCenter } from './components/NotificationCenter';
import { Role, ConsultationRequest } from './types';
import { GoogleSheetService } from './services/googleSheetService';

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [requests, setRequests] = useState<ConsultationRequest[]>(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    if (sharedData) {
      try {
        const decoded = JSON.parse(atob(decodeURIComponent(sharedData)));
        return decoded;
      } catch (e) {
        console.error("공유 데이터 복구 실패", e);
      }
    }
    const saved = localStorage.getItem('consultation_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'sms' | 'system' }[]>([]);

  useEffect(() => {
    localStorage.setItem('consultation_requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = async (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: ConsultationRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING' as any,
      createdAt: Date.now(),
      availableTimeSlots: request.availableTimeSlots || [],
    };
    
    setRequests(prev => [newRequest, ...prev]);
    addNotification(`[새 요청] ${newRequest.studentName} 학생 상담이 등록되었습니다.`, 'system');
    
    setIsSyncing(true);
    await GoogleSheetService.syncAdd(newRequest);
    setIsSyncing(false);
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
      await GoogleSheetService.syncUpdate(targetReq);
      setIsSyncing(false);
    }
  };

  const addNotification = (message: string, type: 'sms' | 'system') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const generateShareLink = () => {
    const dataStr = btoa(encodeURIComponent(JSON.stringify(requests)));
    const url = `${window.location.origin}${window.location.pathname}?data=${dataStr}`;
    navigator.clipboard.writeText(url);
    addNotification("공유 링크가 복사되었습니다.", "system");
  };

  const exportToExcelAndEmail = () => {
    if (requests.length === 0) {
      alert("내보낼 데이터가 없습니다.");
      return;
    }

    const headers = ["ID", "반", "학생명", "과목", "담당강사", "신청담임", "확정시간", "전달완료", "상태", "상담결과"];
    const rows = requests.map(req => [
      req.id,
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
    link.setAttribute("href", url);
    link.setAttribute("download", `상담데이터_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const emailTo = "knickerg5x@gmail.com";
    const subject = encodeURIComponent(`[과목별 상담] 데이터 보고 (${new Date().toLocaleDateString()})`);
    const body = encodeURIComponent(`엑셀 파일을 첨부해주세요.\n총 건수: ${requests.length}건`);
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 animate-in zoom-in-95 duration-300">
          <div className="text-center mb-10">
            <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
              <span className="text-4xl">🏛️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">강북청솔 과목별 상담 신청</h1>
            <p className="text-blue-600 font-black text-lg">이름으로 로그인 하세요</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setRole('HOMEROOM')}
              className="group w-full py-5 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">🏫</span>
                <span className="text-xl">담임 모드</span>
              </div>
              <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={() => setRole('INSTRUCTOR')}
              className="group w-full py-5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-xl">강사 모드</span>
              </div>
              <svg className="w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      role={role} 
      onResetRole={() => setRole(null)} 
      onShare={generateShareLink}
      onExport={exportToExcelAndEmail}
      isSyncing={isSyncing}
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
