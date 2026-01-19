
import React, { useState, useEffect } from 'react';
import { ConsultationRequest, ConsultationStatus, SUBJECTS, DAYS, PERIODS } from '../types';

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

  const handleProposeTime = (reqId: string, day: string, time: string) => {
    if (!day || !time) return;
    onUpdateStatus(reqId, { proposedDay: day, proposedTime: time });
    alert("상담 시간이 담임 선생님께 전달되었습니다.");
  };

  if (!isNameSet) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border">
          <h3 className="text-xl font-black mb-6">강사 로그인</h3>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 text-center font-bold mb-4"
            value={instructorName}
            onChange={(e) => setInstructorName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && instructorName.trim() && setIsNameSet(true)}
          />
          <button
            onClick={() => { if(instructorName.trim()) { setIsNameSet(true); localStorage.setItem('last_instructor_name', instructorName.trim()); } }}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black"
          >
            접속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border">
        <div className="font-bold text-slate-700">강사: <span className="text-emerald-600 font-black">{instructorName}</span></div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('PENDING')} className={`px-4 py-1.5 rounded-lg text-xs font-black ${activeTab === 'PENDING' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>상담 목록</button>
          <button onClick={() => setActiveTab('COMPLETED')} className={`px-4 py-1.5 rounded-lg text-xs font-black ${activeTab === 'COMPLETED' ? 'bg-white shadow-sm' : 'text-slate-400'}`}>완료 내역</button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row gap-6">
            {/* 상담 가능 시간 그림 (5cm x 7cm 비율) */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase italic">상담가능시간</span>
              <div className="time-grid-mini border border-slate-200 bg-white overflow-hidden rounded-md shadow-sm">
                <table className="w-full h-full border-collapse">
                  <thead><tr className="bg-slate-50"><th className="border"></th>{DAYS.map(d => <th key={d} className="border font-black text-[6px]">{d}</th>)}</tr></thead>
                  <tbody>
                    {PERIODS.map(p => (
                      <tr key={p}>
                        <td className="border text-[6px] font-bold bg-slate-50 text-center">{p}</td>
                        {DAYS.map(d => (
                          <td key={d} className={`border ${req.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500' : ''}`}></td>
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
                  <p className="text-sm text-slate-500 font-medium">{req.subject} • 신청: {req.requesterName} 선생님</p>
                </div>
                {req.isDeliveryConfirmed && (
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black">전달 완료</span>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl text-sm border">{req.reason}</div>

              {activeTab === 'PENDING' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 ml-1">확정 요일</label>
                      <select 
                        className="w-full p-3 bg-slate-100 border-0 rounded-xl text-sm font-bold" 
                        value={req.proposedDay || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedDay: e.target.value })}
                      >
                        <option value="">요일 선택</option>
                        {DAYS.map(d => <option key={d} value={d}>{d}요일</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 ml-1">확정 시간</label>
                      <input 
                        placeholder="예: 3교시" 
                        className="w-full p-3 bg-slate-100 border-0 rounded-xl text-sm font-bold" 
                        value={req.proposedTime || ''} 
                        onChange={e => onUpdateStatus(req.id, { proposedTime: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 ml-1">상담 결과 기록</label>
                    <textarea 
                      placeholder="상담 후 내용을 입력하세요." 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-0 h-24 text-sm" 
                      value={req.instructorNotes || ''} 
                      onChange={e => onUpdateStatus(req.id, { instructorNotes: e.target.value })}
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if(!req.instructorNotes) return alert("상담 결과를 입력해주세요.");
                      onUpdateStatus(req.id, { status: ConsultationStatus.COMPLETED });
                    }}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg"
                  >
                    상담 완료 처리
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50 rounded-2xl text-sm font-medium border border-emerald-100">
                  <p className="text-emerald-800">{req.instructorNotes}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && <div className="text-center py-20 text-slate-400">항목이 없습니다.</div>}
      </div>
    </div>
  );
};
