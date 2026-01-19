
import React, { useState, useEffect } from 'react';
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
    if (!req || !instructorName) return false;
    const matchesInstructor = (req.assignedInstructorName || '').trim() === instructorName.trim();
    const matchesStatus = activeTab === 'PENDING' 
      ? (req.status !== ConsultationStatus.COMPLETED)
      : req.status === ConsultationStatus.COMPLETED;
    return matchesInstructor && matchesStatus;
  });

  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border">
          <h3 className="text-xl font-black text-slate-800 mb-6">과목 강사 로그인</h3>
          <input
            type="text"
            placeholder="선생님 성함을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-emerald-500 text-center font-bold text-lg mb-4"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && instructorName.trim() && setIsNameSet(true)}
          />
          <button
            onClick={() => { if(instructorName.trim()) { setIsNameSet(true); localStorage.setItem('last_instructor_name', instructorName.trim()); } }}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black disabled:opacity-50"
          >
            접속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-sm">
        <div className="font-bold text-slate-700 flex items-center gap-2">
          <span className="text-xs text-slate-400">교과강사:</span>
          <span className="text-emerald-600 font-black">{instructorName}</span>
          <button onClick={() => { setIsNameSet(false); localStorage.removeItem('last_instructor_name'); }} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline">변경</button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('PENDING')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'PENDING' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>상담 목록</button>
          <button onClick={() => setActiveTab('COMPLETED')} className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${activeTab === 'COMPLETED' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>완료 내역</button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
            {/* 전달 완료 상태 표시 배지 */}
            {req.isDeliveryConfirmed && (
              <div className="absolute top-0 right-0 px-4 py-1 bg-emerald-600 text-white text-[10px] font-black italic rounded-bl-xl shadow-sm z-10 flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                담임교사 전달완료
              </div>
            )}

            {/* 상담 가능 시간 그림 (5cm x 7cm 비율 시뮬레이션) */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase italic tracking-wider">상담가능시간</span>
              <div className="time-grid-mini border-2 border-slate-100 bg-white overflow-hidden rounded-xl shadow-inner p-1">
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border-0 w-3"></th>
                      {DAYS.map(d => <th key={d} className="border-0 font-black text-[6px] text-slate-400">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(p => (
                      <tr key={p}>
                        <td className="border-0 text-[6px] font-bold bg-slate-50 text-slate-300 text-center">{p}</td>
                        {DAYS.map(d => (
                          <td key={d} className={`border border-slate-50 ${req.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500 rounded-sm' : ''}`}></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 상담 정보 및 처리 */}
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-black text-slate-800">{req.studentClass} {req.studentName}</h4>
                  <p className="text-sm text-slate-500 font-medium">과목: <span className="text-emerald-600 font-bold">{req.subject}</span> • 신청: {req.requesterName} 선생님</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-100 leading-relaxed italic">
                <span className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest not-italic">상담 내용</span>
                "{req.reason}"
              </div>

              {activeTab === 'PENDING' ? (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">확정 요일</label>
                      <select 
                        className="w-full p-3 bg-slate-100 border-0 rounded-xl text-sm font-black text-slate-700 focus:ring-2 focus:ring-emerald-500" 
                        value={req.proposedDay || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedDay: e.target.value })}
                      >
                        <option value="">요일 선택</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">확정 시간</label>
                      <input 
                        placeholder="예: 3교시" 
                        className="w-full p-3 bg-slate-100 border-0 rounded-xl text-sm font-black text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500" 
                        value={req.proposedTime || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedTime: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 ml-1 uppercase">상담 결과 기록</label>
                    <textarea 
                      placeholder="상담 후 주요 내용을 입력하세요." 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-0 h-24 text-sm font-medium focus:ring-2 focus:ring-emerald-500" 
                      value={req.instructorNotes || ''} 
                      onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })}
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if(!req.proposedDay || !req.proposedTime) return alert("상담 요일과 시간을 먼저 확정해주세요.");
                      if(!req.instructorNotes) return alert("상담 결과를 입력해주세요.");
                      onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED });
                    }}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all active:scale-[0.98]"
                  >
                    상담 완료 및 저장
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl text-sm font-medium border border-emerald-100 space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    <span>상담 결과</span>
                    <span>확정시간: {req.proposedDay}요일 {req.proposedTime}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{req.instructorNotes}</p>
                  <div className="pt-2 text-[9px] text-slate-400 font-bold text-right">
                    완료일시: {req.completedAt && new Date(req.completedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-100 flex flex-col items-center">
            <span className="text-3xl mb-2 opacity-30">📭</span>
            <p className="text-slate-300 font-bold">처리할 상담 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
