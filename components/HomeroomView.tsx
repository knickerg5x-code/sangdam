
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
    alert('상담이 신청되었습니다.');
    setFormData({ ...formData, studentName: '', reason: '', availableTimeSlots: [] });
    setIsFormOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="bg-white p-8 rounded-3xl border shadow-xl max-w-sm w-full text-center">
          <h3 className="text-xl font-black text-slate-800 mb-6 tracking-tighter">담임 모드 접속</h3>
          <input
            type="text"
            placeholder="성함을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg mb-4"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
          />
          <button onClick={() => teacherName.trim() && setIsLoggedIn(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all">접속</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-[2rem] border flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">실시간 현황</p>
            <p className="text-sm font-black text-slate-700">{pendingCount}건의 상담이 답변 대기 중</p>
          </div>
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)} 
          className={`px-5 py-2.5 rounded-2xl font-black text-xs shadow-md transition-all active:scale-95 ${isFormOpen ? 'bg-slate-100 text-slate-600' : 'bg-blue-600 text-white'}`}
        >
          {isFormOpen ? '닫기' : '신청하기'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-[2.5rem] border-2 border-blue-50 shadow-xl space-y-4 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold text-sm" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input required placeholder="학생 성명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm font-bold" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold text-sm" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input required placeholder="담당 강사명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm font-bold" value={formData.assignedInstructorName} onChange={e => setFormData({ ...formData, assignedInstructorName: e.target.value })} />
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-100 p-2 bg-slate-50/50">
            <table className="w-full text-center text-[10px]">
              <thead><tr><th className="p-1 text-slate-400">교시</th>{DAYS.map(d => <th key={d}>{d}</th>)}</tr></thead>
              <tbody>
                {PERIODS.map(p => (
                  <tr key={p}><td className="font-bold p-1 text-slate-300">{p}</td>
                    {DAYS.map(d => (
                      <td key={d} className="p-0.5">
                        <div onClick={() => {
                          const slot = `${d}-${p}`;
                          setFormData(prev => ({ ...prev, availableTimeSlots: prev.availableTimeSlots.includes(slot) ? prev.availableTimeSlots.filter(s => s !== slot) : [...prev.availableTimeSlots, slot] }));
                        }} className={`h-6 rounded-md cursor-pointer transition-colors ${formData.availableTimeSlots.includes(`${d}-${p}`) ? 'bg-blue-500 shadow-inner' : 'bg-white border'}`}></div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <textarea placeholder="상담 요청 사유를 입력하세요" className="w-full p-4 bg-slate-50 rounded-2xl border-0 text-sm h-20" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg shadow-lg hover:bg-blue-700 active:scale-[0.98] transition-all">신청 완료</button>
        </form>
      )}

      <div className="space-y-4">
        {myRequests.map(req => (
          <div key={req.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md ${req.status === ConsultationStatus.COMPLETED ? 'bg-slate-50 opacity-80' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 
                    onClick={() => req.status === ConsultationStatus.COMPLETED && setSelectedNoteRequest(req)}
                    className={`font-black text-xl tracking-tight transition-colors ${req.status === ConsultationStatus.COMPLETED ? 'cursor-pointer text-blue-600 hover:text-blue-800 hover:underline' : 'text-slate-800'}`}
                  >
                    {req.studentClass} {req.studentName}
                  </h4>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">{req.subject}</span>
                  
                  {req.status === ConsultationStatus.COMPLETED ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black border border-emerald-200">상담 완료</span>
                  ) : req.proposedDay ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black animate-pulse shadow-sm">
                        강사제안: {req.proposedDay}요일 {req.proposedTime || '시간미정'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-slate-300">강사 확인 대기 중</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-bold italic">담당: {req.assignedInstructorName} 선생님</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {req.status !== ConsultationStatus.COMPLETED && req.proposedDay && (
                  req.isDeliveryConfirmed ? (
                    <div className="flex-1 md:flex-none px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black flex items-center justify-center gap-2 border border-emerald-100 shadow-sm transition-all">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                      학생에게 전달됨
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if(confirm('학생에게 상담 일정을 안내하셨습니까?')) {
                          onUpdateStatus(req.id, { isDeliveryConfirmed: true });
                        }
                      }}
                      className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-2"
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

      {selectedNoteRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/50 backdrop-blur-md" onClick={() => setSelectedNoteRequest(null)}>
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 p-8 text-white">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="font-black text-2xl tracking-tighter">{selectedNoteRequest.studentName} 상담 기록</h3>
                 <button onClick={() => setSelectedNoteRequest(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
                 </button>
              </div>
              <p className="text-xs font-bold opacity-70">{selectedNoteRequest.subject} • {selectedNoteRequest.assignedInstructorName} 강사</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">강사 조치 및 상담 내용</label>
                <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 min-h-[120px]">
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">{selectedNoteRequest.instructorNotes || "기록된 상담 결과가 없습니다."}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNoteRequest(null)} className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm active:scale-95 transition-all shadow-lg">창 닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
