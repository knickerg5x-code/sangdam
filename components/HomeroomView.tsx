
import React, { useState, useEffect } from 'react';
import { ConsultationRequest, SUBJECTS, CLASSES, ConsultationStatus, DAYS, PERIODS } from '../types';

interface HomeroomViewProps {
  requests: ConsultationRequest[];
  onAddRequest: (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, updates: Partial<ConsultationRequest>) => void;
}

export const HomeroomView: React.FC<HomeroomViewProps> = ({ requests, onAddRequest, onUpdateStatus }) => {
  const [teacherName, setTeacherName] = useState<string>(() => localStorage.getItem('last_homeroom_name') || '');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('last_homeroom_name'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedNoteRequest, setSelectedNoteRequest] = useState<ConsultationRequest | null>(null);
  
  const [formData, setFormData] = useState({
    studentClass: CLASSES[0],
    studentName: '',
    subject: SUBJECTS[0],
    assignedInstructorName: '',
    reason: '',
    availableTimeSlots: [] as string[]
  });

  useEffect(() => {
    if (isLoggedIn && teacherName) {
      localStorage.setItem('last_homeroom_name', teacherName.trim());
    }
  }, [teacherName, isLoggedIn]);

  const myRequests = requests.filter(r => r.requesterName === teacherName.trim());
  const pendingCount = myRequests.filter(r => r.status !== ConsultationStatus.COMPLETED).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.assignedInstructorName) return;
    if (formData.availableTimeSlots.length === 0) {
      alert("상담 가능 시간을 선택해주세요.");
      return;
    }
    onAddRequest({ ...formData, requesterName: teacherName.trim() });
    alert('신청되었습니다.');
    setFormData({ ...formData, studentName: '', reason: '', availableTimeSlots: [] });
    setIsFormOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-3xl border shadow-xl max-w-sm w-full text-center">
          <h3 className="text-xl font-black text-slate-800 mb-6">담임 모드 로그인</h3>
          <input
            type="text"
            placeholder="선생님 성함"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg mb-4"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
          />
          <button onClick={() => teacherName.trim() && setIsLoggedIn(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">접속</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 8. 상단 미완료 현황 */}
      <div className="bg-white p-4 rounded-2xl border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">상담 미완료 현황</p>
            <p className="text-sm font-black text-slate-700">{pendingCount}명의 학생이 대기 중입니다</p>
          </div>
        </div>
        <button onClick={() => setIsFormOpen(!isFormOpen)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs shadow-md">신청하기</button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-xl space-y-4 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 9. 반 선택 드롭다운 */}
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold text-sm" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input required placeholder="학생 성명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold text-sm" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input required placeholder="담당 강사명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm" value={formData.assignedInstructorName} onChange={e => setFormData({ ...formData, assignedInstructorName: e.target.value })} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100 p-2 bg-slate-50/50">
            <table className="w-full text-center text-[10px]">
              <thead><tr><th className="p-1">교시</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p}><td className="font-bold p-1">{p}</td>
                    {DAYS.map(d => (
                      <td key={d} className="p-0.5">
                        <div onClick={() => {
                          const slot = `${d}-${p}`;
                          setFormData(prev => ({ ...prev, availableTimeSlots: prev.availableTimeSlots.includes(slot) ? prev.availableTimeSlots.filter(s => s !== slot) : [...prev.availableTimeSlots, slot] }));
                        }} className={`h-6 rounded-md cursor-pointer ${formData.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500 shadow-inner' : 'bg-white border'}`}></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <textarea placeholder="상담 요청 사유" className="w-full p-4 bg-slate-50 rounded-2xl border-0 text-sm h-20" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg">신청 완료</button>
        </form>
      )}

      <div className="space-y-3">
        {myRequests.map(req => (
          <div key={req.id} className={`bg-white p-5 rounded-2xl border shadow-sm transition-all ${req.status === ConsultationStatus.COMPLETED ? 'bg-slate-50 opacity-75' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* 7. 학생 이름 클릭 시 조치사항 모달 */}
                  <h4 
                    onClick={() => req.status === ConsultationStatus.COMPLETED && setSelectedNoteRequest(req)}
                    className={`font-black text-lg ${req.status === ConsultationStatus.COMPLETED ? 'cursor-pointer text-blue-600 hover:underline' : 'text-slate-800'}`}
                  >
                    {req.studentClass} {req.studentName}
                  </h4>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black">{req.subject}</span>
                  
                  {/* 3, 7. 상태 표시 문구 */}
                  {req.status === ConsultationStatus.COMPLETED && <span className="text-emerald-600 font-black text-xs">● 상담 완료</span>}
                  {req.status !== ConsultationStatus.COMPLETED && req.proposedDay && (
                    <span className="text-blue-600 font-black text-xs animate-pulse">
                      강사제안 상담시간 - {req.proposedDay}요일 {req.proposedTime}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium italic">강사: {req.assignedInstructorName} 선생님</p>
              </div>

              {/* 4. 전달 완료 버튼 */}
              <div className="flex items-center gap-2">
                {req.status !== ConsultationStatus.COMPLETED && req.proposedDay && (
                  req.isDeliveryConfirmed ? (
                    <div className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black flex items-center gap-1.5 border border-emerald-200">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                      전달 완료됨
                    </div>
                  ) : (
                    <button 
                      onClick={() => onUpdateStatus(req.id, { isDeliveryConfirmed: true })}
                      className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-black shadow-lg hover:bg-slate-700 active:scale-95 transition-all"
                    >
                      학생에게 전달하였음
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 7. 조치 사항 모달 */}
      {selectedNoteRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNoteRequest(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 p-5 text-white">
              <h3 className="font-black text-lg">{selectedNoteRequest.studentName} 상담 결과</h3>
              <p className="text-xs opacity-80">{selectedNoteRequest.subject} - {selectedNoteRequest.assignedInstructorName} 강사</p>
            </div>
            <div className="p-6">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">강사 조치 사항</label>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-24">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{selectedNoteRequest.instructorNotes || "입력된 상담 기록이 없습니다."}</p>
              </div>
              <button onClick={() => setSelectedNoteRequest(null)} className="w-full mt-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
