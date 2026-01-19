
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { HomeroomView } from './components/HomeroomView';
import { InstructorView } from './components/InstructorView';
import { NotificationCenter } from './components/NotificationCenter';
import { DeploymentGuide } from './components/DeploymentGuide';
import { Role, ConsultationRequest } from './types';

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [requests, setRequests] = useState<ConsultationRequest[]>(() => {
    // 1. URL에 데이터가 있는지 확인 (공유된 링크인 경우)
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
    // 2. 없으면 로컬 스토리지 확인
    const saved = localStorage.getItem('consultation_requests');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'sms' | 'system' }[]>([]);

  useEffect(() => {
    localStorage.setItem('consultation_requests', JSON.stringify(requests));
  }, [requests]);

  const addRequest = (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: ConsultationRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING' as any,
      createdAt: Date.now(),
    };
    setRequests(prev => [newRequest, ...prev]);
    addNotification(`[새 요청] ${newRequest.studentName} 학생 상담이 등록되었습니다.`, 'system');
  };

  const updateRequest = (id: string, updates: Partial<ConsultationRequest>) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = { ...req, ...updates };
        if (updates.status === 'COMPLETED' && req.status !== 'COMPLETED') {
          updated.completedAt = Date.now();
          addNotification(`[완료] ${req.studentName} 학생 상담이 완료되었습니다.`, 'system');
        }
        return updated;
      }
      return req;
    }));
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
    addNotification("공유 링크가 복사되었습니다! 다른 선생님께 전달하세요.", "system");
  };

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
              <span className="text-4xl">🎓</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 mb-2">교사 상담 협력 허브</h1>
            <p className="text-slate-500 text-sm">담임교사와 교과강사의 원활한 소통을 지원합니다.</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={() => setRole('HOMEROOM')}
              className="group w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">🏫</span>
                <span className="text-lg">담임 교사 모드</span>
              </div>
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={() => setRole('INSTRUCTOR')}
              className="group w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform">📝</span>
                <span className="text-lg">교과 강사 모드</span>
              </div>
              <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button 
              onClick={() => setShowGuide(true)}
              className="w-full py-3 text-slate-400 hover:text-blue-600 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              이 프로그램을 인터넷 주소로 만드는 방법
            </button>
          </div>
        </div>
        {showGuide && <DeploymentGuide onClose={() => setShowGuide(false)} />}
      </div>
    );
  }

  return (
    <Layout 
      role={role} 
      onResetRole={() => setRole(null)} 
      onShare={generateShareLink}
    >
      {role === 'HOMEROOM' ? (
        <HomeroomView requests={requests} onAddRequest={addRequest} />
      ) : (
        <InstructorView requests={requests} onUpdateStatus={updateRequest} />
      )}
      <NotificationCenter notifications={notifications} />
    </Layout>
  );
};

export default App;
