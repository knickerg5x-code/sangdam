
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
    const matches = (req.assignedInstructorName || '').trim().toLowerCase() === instructorName.trim().toLowerCase();
    return matches && (activeTab === 'PENDING' ? req.status !== ConsultationStatus.COMPLETED : req.status === ConsultationStatus.COMPLETED);
  });

  if (!isNameSet) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white p-8 rounded-3xl border shadow-xl max-w-sm w-full text-center">
          <h3 className="text-xl font-black text-slate-800 mb-6">강사 모드 접속</h3>
          <input
            type="text"
            placeholder="선생님 성함을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 text-center font-bold text-lg mb-4"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
          />
          <button onClick={() => { if(instructorName.trim()) { setIsNameSet(true); localStorage.setItem('last_instructor_name', instructorName.trim()); } }} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg">접속</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex bg-slate-100 p-1.5 rounded-[1.5rem] w-full max-w-xs mx-auto shadow-inner">
        <button onClick={() => setActiveTab('PENDING')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'PENDING' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>상담 목록</button>
        <button onClick={() => setActiveTab('COMPLETED')} className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === 'COMPLETED' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}>완료 내역</button>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className={`p-8 rounded-[2.5rem] border shadow-md transition-all relative overflow-hidden ${req.isDeliveryConfirmed ? 'bg-blue-50/70 border-blue-200' : 'bg-white border-slate-200'}`}>
            {/* 5. 상담시간 확정 배지 */}
            {req.isDeliveryConfirmed && (
              <div className="absolute top-0 right-0 px-6 py-2 bg-blue-600 text-white text-[10px] font-black rounded-bl-2xl shadow-lg z-10 animate-in slide-in-from-top-2">
                상담시간 확정
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-10">
              <div className="shrink-0 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center">담임 신청 시간표</span>
                <div className="bg-white p-2 rounded-2xl shadow-inner border border-slate-100/50">
                  <div className="grid grid-cols-7 gap-1 w-24 h-36">
                    {DAYS.map(d => PERIODS.map(p => (
                      <div key={`${d}-${p}`} className={`rounded-[2px] ${req.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500 shadow-sm' : 'bg-slate-50'}`}></div>
                    )))}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{req.studentClass} {req.studentName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">담임: {req.requesterName}T • 과목: <span className="text-slate-600">{req.subject}</span></p>
                  </div>
                  {req.isDeliveryConfirmed && (
                    <span className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">체결 완료</span>
                  )}
                </div>

                {activeTab === 'PENDING' ? (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    {/* 2, 2.1 상담 가능 요일 및 시간 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상담 가능 요일</label>
                        <select 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-0 text-sm font-black focus:ring-2 focus:ring-blue-500" 
                          value={req.proposedDay || ''} 
                          onChange={e => onUpdateStatus(req.id, { proposedDay: e.target.value })}
                        >
                          <option value="">요일 선택</option>
                          {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상담 가능 시간 (24H)</label>
                        <input 
                          placeholder="예: 14:30" 
                          className="w-full p-4 bg-slate-50 rounded-2xl border-0 text-sm font-black focus:ring-2 focus:ring-blue-500" 
                          value={req.proposedTime || ''} 
                          onChange={e => onUpdateStatus(req.id, { proposedTime: e.target.value })} 
                        />
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if(!req.proposedDay || !req.proposedTime) return alert("요일과 시간을 모두 입력해주세요.");
                        onUpdateStatus(req.id, { proposedDay: req.proposedDay, proposedTime: req.proposedTime });
                        alert("담임 선생님께 상담 가능 시간이 회신되었습니다.");
                      }}
                      className="w-full py-3 bg-blue-100 text-blue-700 rounded-2xl text-xs font-black hover:bg-blue-200 transition-all shadow-sm active:scale-95"
                    >
                      상담 가능 시간 담임 선생님께 회신
                    </button>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">조치 사항 기록</label>
                      <textarea 
                        placeholder="상담 후 특이사항이나 조치 내용을 기록하세요." 
                        className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-0 h-28 text-sm font-medium focus:ring-2 focus:ring-emerald-500" 
                        value={req.instructorNotes || ''} 
                        onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })} 
                      />
                    </div>

                    {/* 6. 시간 입력 없어도 상담 완료 가능 */}
                    <button 
                      onClick={() => {
                        if(!req.instructorNotes) return alert("조치 사항을 입력해주세요.");
                        if(confirm('상담을 완료하시겠습니까?')) {
                          onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED });
                        }
                      }}
                      className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg shadow-xl hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                      상담 완료 및 기록 저장
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-emerald-50/50 rounded-[2rem] border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-600 mb-3 tracking-widest uppercase">최종 상담 결과</p>
                    <p className="text-sm text-slate-700 font-bold italic leading-relaxed">"{req.instructorNotes}"</p>
                    <div className="mt-4 pt-4 border-t border-emerald-100 flex justify-between items-center text-[10px] font-black text-slate-400">
                        <span>상담일: {req.proposedDay || "-"} / {req.proposedTime || "-"}</span>
                        <span>기록완료: {req.completedAt && new Date(req.completedAt).toLocaleDateString()}</span>
                    </div>
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
