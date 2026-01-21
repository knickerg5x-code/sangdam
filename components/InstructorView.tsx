
import React, { useState } from 'react';
import { ConsultationRequest, ConsultationStatus, DAYS, PERIODS } from '../types';

interface InstructorViewProps {
  requests: ConsultationRequest[];
  onUpdateStatus: (id: string, updates: Partial<ConsultationRequest>) => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({ requests, onUpdateStatus }) => {
  const [instructorName, setInstructorName] = useState<string>(() => localStorage.getItem('last_instructor_name') || '');
  const [isNameSet, setIsNameSet] = useState<boolean>(!!localStorage.getItem('last_instructor_name'));
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  const filteredRequests = requests.filter(req => {
    const matches = (req.assignedInstructorName || '').trim() === instructorName.trim();
    return matches && (activeTab === 'PENDING' ? req.status !== ConsultationStatus.COMPLETED : req.status === ConsultationStatus.COMPLETED);
  });

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-3xl border shadow-xl max-w-sm w-full text-center">
          <h3 className="text-xl font-black text-slate-800 mb-6">강사 모드 접속</h3>
          <input
            type="text"
            placeholder="선생님 성함"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 text-center font-bold text-lg mb-4"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
          <button onClick={() => { if(instructorName.trim()) { setIsNameSet(true); localStorage.setItem('last_instructor_name', instructorName.trim()); } }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black">접속</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-xs mx-auto">
        <button onClick={() => setActiveTab('PENDING')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>진행 중</button>
        <button onClick={() => setActiveTab('COMPLETED')} className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>완료</button>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className={`p-6 rounded-[2rem] border shadow-md transition-all ${req.isDeliveryConfirmed ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* 타임라인 미니 뷰 */}
              <div className="shrink-0 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">담임 신청 시간</span>
                <div className="bg-white p-1.5 rounded-xl shadow-inner border border-slate-100">
                  <div className="grid grid-cols-7 gap-1 w-24 h-32">
                    {DAYS.map(d => PERIODS.map(p => (
                      <div key={`${d}-${p}`} className={`rounded-sm ${req.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500' : 'bg-slate-50'}`}></div>
                    )))}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-2xl font-black text-slate-800">{req.studentClass} {req.studentName}</h4>
                  {/* 5. 상담시간 확정 배지 */}
                  {req.isDeliveryConfirmed && (
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black shadow-md flex items-center gap-1 animate-bounce">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                      상담시간 확정
                    </span>
                  )}
                  <span className="text-sm font-bold text-slate-400 ml-auto">신청: {req.requesterName}T</span>
                </div>

                {/* 1. 요청내용 삭제됨 */}

                {activeTab === 'PENDING' ? (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    {/* 2, 2.1 상담 가능 요일/시간 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">상담 가능 요일</label>
                        <select className="w-full p-3 bg-slate-50 rounded-xl border-0 text-sm font-black" value={req.proposedDay || ''} onChange={e => onUpdateStatus(req.id, { proposedDay: e.target.value })}>
                          <option value="">요일 선택</option>
                          {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">상담 가능 시간 (24H)</label>
                        <input placeholder="예: 14:30" className="w-full p-3 bg-slate-50 rounded-xl border-0 text-sm font-black" value={req.proposedTime || ''} onChange={e => onUpdateStatus(req.id, { proposedTime: e.target.value })} />
                      </div>
                    </div>

                    <button 
                      onClick={() => { if(!req.proposedDay || !req.proposedTime) return alert("요일과 시간을 입력해주세요."); onUpdateStatus(req.id, { proposedDay: req.proposedDay, proposedTime: req.proposedTime }); alert("담임 선생님께 회신되었습니다."); }}
                      className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl text-xs font-black hover:bg-blue-200 transition-all shadow-sm"
                    >
                      상담 가능 시간 담임 선생님께 회신
                    </button>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">조치 사항 기록</label>
                      <textarea placeholder="상담 후 특이사항이나 조치 내용을 기록하세요." className="w-full p-4 bg-slate-50 rounded-2xl border-0 h-24 text-sm font-medium" value={req.instructorNotes || ''} onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })} />
                    </div>

                    {/* 6. 상담 완료 버튼 (시간 입력 없어도 가능) */}
                    <button 
                      onClick={() => { if(!req.instructorNotes) return alert("조치 사항을 입력해주세요."); if(confirm('상담을 완료하시겠습니까?')) onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED }); }}
                      className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
                    >
                      상담 완료 및 기록 저장
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 mb-2">● 상담 결과</p>
                    <p className="text-sm text-slate-700 font-bold italic leading-relaxed">"{req.instructorNotes}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
