
import React, { useState, useEffect } from 'react';
import { ConsultationRequest, ConsultationStatus, SUBJECTS } from '../types';

interface InstructorViewProps {
  requests: ConsultationRequest[];
  onUpdateStatus: (id: string, updates: Partial<ConsultationRequest>) => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({ requests, onUpdateStatus }) => {
  const [instructorName, setInstructorName] = useState<string>(() => localStorage.getItem('last_instructor_name') || '');
  const [isNameSet, setIsNameSet] = useState<boolean>(!!localStorage.getItem('last_instructor_name'));
  const [selectedSubject, setSelectedSubject] = useState<string>('전체');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  useEffect(() => {
    if (isNameSet && instructorName) {
      localStorage.setItem('last_instructor_name', instructorName);
    }
  }, [instructorName, isNameSet]);

  const filteredRequests = requests.filter(req => {
    // 1. 이름 필터링 (입력한 이름과 담당 강사명이 일치해야 함)
    const matchesInstructor = instructorName && req.assignedInstructorName.trim() === instructorName.trim();
    // 2. 과목 필터링
    const matchesSubject = selectedSubject === '전체' || req.subject === selectedSubject;
    // 3. 상태 필터링
    const matchesStatus = activeTab === 'PENDING' 
      ? (req.status === ConsultationStatus.PENDING || req.status === ConsultationStatus.IN_PROGRESS)
      : req.status === ConsultationStatus.COMPLETED;
    
    return matchesInstructor && matchesSubject && matchesStatus;
  });

  const handleComplete = (req: ConsultationRequest) => {
    if (!req.instructorNotes || req.instructorNotes.trim() === "") {
      alert("상담 결과를 입력해주셔야 완료 처리가 가능합니다.");
      return;
    }
    onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED });
    
    // 알림 문구 생성
    const msg = `[상담완료] ${req.studentClass} ${req.studentName} 학생의 ${req.subject} 상담이 완료되었습니다. 확인 부탁드립니다. (담당: ${req.assignedInstructorName} 강사)`;
    navigator.clipboard.writeText(msg);
    alert('상담이 완료 처리되었습니다!\n담임 선생님께 보낼 알림 문구가 복사되었습니다.');
  };

  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-xl font-black text-slate-800 mb-2">강사 성함 확인</h3>
          <p className="text-slate-500 text-sm mb-6">로그인하여 본인에게 온 상담 요청을 확인하세요.</p>
          <input
            type="text"
            placeholder="선생님 성함을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 text-center font-bold text-lg mb-4"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && instructorName && setIsNameSet(true)}
          />
          <button
            disabled={!instructorName}
            onClick={() => setIsNameSet(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black disabled:opacity-50 hover:bg-emerald-700 transition-all shadow-lg"
          >
            내 상담 목록 확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">담당 강사: </span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-black text-sm">{instructorName}</span>
            <button onClick={() => { setIsNameSet(false); localStorage.removeItem('last_instructor_name'); }} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline ml-1">이름 변경</button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'PENDING' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              대기 중
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'COMPLETED' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
              완료됨
            </button>
          </div>
        </div>
        
        <select
          className="w-full p-3 bg-slate-50 border-0 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        >
          <option value="전체">모든 과목 필터</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-6">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <span className="text-4xl mb-4 block">☕</span>
            <p className="text-slate-400 font-medium">'{instructorName}' 강사님께 배정된 상담이 없습니다.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="p-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-xl text-slate-800">
                      {req.studentClass} {req.studentName}
                      <span className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold">
                        {req.subject}
                      </span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-1.5 font-medium">
                      신청: {req.requesterName} 선생님 • {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {req.status === ConsultationStatus.PENDING && (
                    <button
                      onClick={() => onUpdateStatus(req.id, { status: ConsultationStatus.IN_PROGRESS })}
                      className="text-[10px] px-3 py-1.5 bg-yellow-400 text-yellow-900 rounded-full font-black hover:bg-yellow-500 transition-colors shadow-sm"
                    >
                      상담 접수
                    </button>
                  )}
                </div>
                {req.reason && (
                  <div className="mt-5 p-4 bg-white rounded-2xl border border-slate-100 text-sm text-slate-600 leading-relaxed">
                    <span className="font-black text-slate-400 text-[10px] block mb-1 uppercase italic tracking-wider">Homeroom Teacher's Request</span>
                    {req.reason}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                {req.status !== ConsultationStatus.COMPLETED ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400 ml-1">상담 결과 기록</label>
                      <textarea
                        placeholder="상담 진행 내용 및 피드백을 기록하세요..."
                        className="w-full p-5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 transition-all h-32 text-sm font-medium"
                        value={req.instructorNotes || ''}
                        onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })}
                      />
                    </div>
                    <button
                      onClick={() => handleComplete(req)}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100"
                    >
                      상담 완료 및 알림 복사
                    </button>
                  </>
                ) : (
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h5 className="font-black text-emerald-800 text-xs mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      Consultation Feedback
                    </h5>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed font-medium">{req.instructorNotes}</p>
                    <div className="mt-4 pt-4 border-t border-emerald-100 text-right text-[10px] text-emerald-600 font-bold uppercase">
                      Completed: {req.completedAt && new Date(req.completedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
