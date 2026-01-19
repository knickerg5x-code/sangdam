
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
      <div className="flex flex-col items-center justify-center py-10 md:py-20 animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border">
          <h3 className="text-xl font-black text-slate-800 mb-6">강사 모드 접속</h3>
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
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg active:scale-95 duration-75 transition-all"
          >
            시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-3xl border shadow-sm gap-4">
        <div className="font-bold text-slate-700 flex items-center gap-2">
          <span className="text-xs text-slate-400">교과강사:</span>
          <span className="text-emerald-600 font-black text-lg">{instructorName}</span>
          <button onClick={() => { setIsNameSet(false); localStorage.removeItem('last_instructor_name'); }} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline ml-1">변경</button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button onClick={() => setActiveTab('PENDING')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'PENDING' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>상담 목록</button>
          <button onClick={() => setActiveTab('COMPLETED')} className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-black transition-all ${activeTab === 'COMPLETED' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}>완료 내역</button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map(req => (
          <div 
            key={req.id} 
            className={`transition-all duration-300 p-6 rounded-[2.5rem] border shadow-md flex flex-col md:flex-row gap-8 relative overflow-hidden ${
              req.isDeliveryConfirmed 
              ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100/50' 
              : 'bg-white border-slate-200'
            }`}
          >
            {/* 전달 완료 상태 표시 배지 - 크기 확대 */}
            {req.isDeliveryConfirmed && (
              <div className="absolute top-0 right-0 px-8 py-4 bg-emerald-600 text-white text-sm font-black italic rounded-bl-[2rem] shadow-xl z-20 flex items-center gap-3 animate-in slide-in-from-top-4">
                <div className="bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                </div>
                <span>학생에게 전달됨</span>
              </div>
            )}

            <div className="shrink-0 flex flex-col items-center gap-3">
              <span className="text-[11px] font-black text-slate-400 uppercase italic tracking-wider">담임제시 시간표</span>
              <div className="time-grid-mini border-4 border-white bg-white overflow-hidden rounded-2xl shadow-lg p-1">
                <table className="w-full h-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border-0 w-4"></th>
                      {DAYS.map(d => <th key={d} className="border-0 font-black text-[7px] text-slate-400">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(p => (
                      <tr key={p}>
                        <td className="border-0 text-[7px] font-bold bg-slate-50 text-slate-300 text-center">{p}</td>
                        {DAYS.map(d => (
                          <td key={d} className={`border border-slate-50/50 ${req.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-600 rounded-sm' : ''}`}></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-1 space-y-5">
              <div className="flex justify-between items-start pr-20 md:pr-0">
                <div>
                  <h4 className="text-2xl font-black text-slate-800">{req.studentClass} {req.studentName}</h4>
                  <p className="text-base text-slate-500 font-medium mt-1">
                    과목: <span className="text-emerald-700 font-black">{req.subject}</span> • 신청: {req.requesterName} 선생님
                  </p>
                </div>
              </div>
              
              <div className={`p-5 rounded-3xl text-sm leading-relaxed italic border transition-colors ${req.isDeliveryConfirmed ? 'bg-white/60 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <span className="block text-[11px] font-black text-slate-400 mb-2 uppercase tracking-widest not-italic">담임 선생님의 요청 내용</span>
                <p className="text-slate-700 font-medium">"{req.reason}"</p>
              </div>

              {activeTab === 'PENDING' ? (
                <div className="space-y-5 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 ml-1 uppercase">상담 확정 요일</label>
                      <select 
                        className="w-full p-4 bg-slate-100 border-0 rounded-2xl text-base font-black text-slate-700 focus:ring-4 focus:ring-emerald-500/20" 
                        value={req.proposedDay || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedDay: e.target.value })}
                      >
                        <option value="">요일 선택</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 ml-1 uppercase">상담 확정 시간</label>
                      <input 
                        placeholder="예: 4교시" 
                        className="w-full p-4 bg-slate-100 border-0 rounded-2xl text-base font-black text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-500/20" 
                        value={req.proposedTime || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedTime: e.target.value })}
                      />
                    </div>
                  </div>

                  {req.isDeliveryConfirmed ? (
                    <div className="w-full py-4 bg-emerald-100 text-emerald-800 rounded-2xl text-sm font-black border-2 border-emerald-200 flex items-center justify-center gap-2 animate-in fade-in duration-300">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      <span>학생에게 시간 전달 되었음</span>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if(!req.proposedDay || !req.proposedTime) return alert("요일과 시간을 선택해주세요.");
                        onUpdateStatus(req.id, { proposedDay: req.proposedDay, proposedTime: req.proposedTime });
                        alert("전송하였습니다.");
                      }}
                      className="w-full py-4 bg-blue-100 text-blue-800 rounded-2xl text-sm font-black border-2 border-blue-200 hover:bg-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 duration-75 shadow-sm"
                    >
                      <span>상담 시간 담임 선생님께 회신</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    </button>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 ml-1 uppercase">상담 결과 기록</label>
                    <textarea 
                      placeholder="상담 내용을 요약해서 기록해주세요." 
                      className="w-full p-5 bg-slate-50 rounded-3xl border-0 h-32 text-base font-medium focus:ring-4 focus:ring-emerald-500/20" 
                      value={req.instructorNotes || ''} 
                      onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })}
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if(!req.proposedDay || !req.proposedTime) return alert("상담 요일과 시간을 먼저 확정/제안해주세요.");
                      if(!req.instructorNotes) return alert("상담 결과를 입력해주세요.");
                      if(confirm('상담을 완료 처리하시겠습니까?')) {
                        onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED });
                      }
                    }}
                    className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.97] duration-75"
                  >
                    상담 완료 및 기록 저장
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-emerald-100/50 rounded-3xl text-base font-medium border border-emerald-200 space-y-3">
                  <div className="flex justify-between items-center text-xs font-black text-emerald-700 uppercase tracking-widest">
                    <span>최종 상담 결과</span>
                    <span className="bg-emerald-700 text-white px-3 py-1 rounded-full">상담일: {req.proposedDay}요일 {req.proposedTime}</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-bold italic">"{req.instructorNotes}"</p>
                  <div className="pt-3 text-[11px] text-slate-400 font-black text-right flex items-center justify-end gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    완료일: {req.completedAt && new Date(req.completedAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center">
            <span className="text-5xl mb-4 opacity-20">📂</span>
            <p className="text-slate-300 font-black text-lg italic">상담 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
