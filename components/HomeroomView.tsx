
import React, { useState, useEffect } from 'react';
import { ConsultationRequest, SUBJECTS, ConsultationStatus, DAYS, PERIODS } from '../types';

interface HomeroomViewProps {
  requests: ConsultationRequest[];
  onAddRequest: (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, updates: Partial<ConsultationRequest>) => void;
}

export const HomeroomView: React.FC<HomeroomViewProps> = ({ requests, onAddRequest, onUpdateStatus }) => {
  const [teacherName, setTeacherName] = useState<string>(() => localStorage.getItem('last_homeroom_name') || '');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('last_homeroom_name'));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentClass: '',
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

  const toggleTimeSlot = (day: string, period: number) => {
    const slot = `${day}-${period}`;
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter(s => s !== slot)
        : [...prev.availableTimeSlots, slot]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.studentClass || !formData.assignedInstructorName) return;
    if (formData.availableTimeSlots.length === 0) {
      alert("상담 가능 시간을 선택해주세요.");
      return;
    }
    
    onAddRequest({
      ...formData,
      requesterName: teacherName.trim(),
    });
    
    alert('신청되었습니다.');
    setFormData({ ...formData, studentName: '', reason: '', availableTimeSlots: [] });
    setIsFormOpen(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
        <div className="bg-white p-8 rounded-3xl border shadow-xl max-w-sm w-full text-center">
          <h3 className="text-xl font-black text-slate-800 mb-6">담임 모드 로그인</h3>
          <input
            type="text"
            placeholder="선생님 성함을 입력하세요"
            className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 text-center font-bold text-lg mb-4"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && teacherName.trim() && setIsLoggedIn(true)}
          />
          <button
            disabled={!teacherName.trim()}
            onClick={() => setIsLoggedIn(true)}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black disabled:opacity-50 hover:bg-blue-700 transition-all active:scale-95 duration-75"
          >
            접속하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">담당교사:</span>
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-black text-sm">{teacherName}</span>
          <button onClick={() => { setIsLoggedIn(false); localStorage.removeItem('last_homeroom_name'); }} className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline ml-1">변경</button>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 duration-75 ${isFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isFormOpen ? '취소' : '신규 상담 신청'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input required placeholder="반 (예: 1-3)" className="p-3 bg-slate-50 rounded-xl border-0 text-sm md:text-base" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })} />
            <input required placeholder="학생 성명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm md:text-base" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold text-sm md:text-base" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input required placeholder="담당 강사명" className="p-3 bg-slate-50 rounded-xl border-0 text-sm md:text-base" value={formData.assignedInstructorName} onChange={e => setFormData({ ...formData, assignedInstructorName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700">상담 가능 시간 (클릭하여 선택)</label>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full border-collapse text-center text-[10px] md:text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border p-2 w-16">교시</th>
                    {DAYS.map(d => <th key={d} className="border p-2">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(p => (
                    <tr key={p}>
                      <td className="border p-2 font-bold bg-slate-50 text-slate-600">{p}교시</td>
                      {DAYS.map(d => {
                        const isSelected = formData.availableTimeSlots.includes(`${d}-${p}`);
                        return (
                          <td 
                            key={`${d}-${p}`} 
                            onClick={() => toggleTimeSlot(d, p)}
                            className={`border p-3 cursor-pointer transition-all active:opacity-70 h-10 md:h-12 ${isSelected ? 'bg-blue-600' : 'bg-white'}`}
                          >
                            {/* 체크 표시 제거됨 */}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 ml-1">상담 내용</label>
            <textarea placeholder="상담이 필요한 구체적인 내용을 입력하세요." className="w-full p-4 bg-slate-50 rounded-2xl border-0 h-24 text-sm focus:ring-2 focus:ring-blue-500" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          </div>
          
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-[0.98] transition-all">신청 완료</button>
        </form>
      )}

      <div className="grid gap-4">
        {requests.filter(r => r.requesterName === teacherName.trim()).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold italic">신청 내역이 없습니다.</div>
        ) : (
          requests.filter(r => r.requesterName === teacherName.trim()).map(req => (
            <div key={req.id} className={`bg-white p-6 rounded-3xl border shadow-sm transition-all hover:shadow-md ${req.status === ConsultationStatus.COMPLETED ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-xl text-slate-800">{req.studentClass} {req.studentName}</h4>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black">{req.subject}</span>
                    {req.status === ConsultationStatus.COMPLETED && <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-black italic">상담종료</span>}
                  </div>
                  <p className="text-sm text-slate-400 font-medium italic">담당강사: {req.assignedInstructorName} 선생님</p>
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                  {req.proposedDay ? (
                    <div className="flex flex-col items-end gap-2 w-full">
                      <div className="px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-md flex items-center gap-2 w-full md:w-auto justify-center">
                        <span className="opacity-70 font-normal">강사제안:</span>
                        {req.proposedDay}요일 {req.proposedTime}
                      </div>
                      
                      {req.status !== ConsultationStatus.COMPLETED && (
                        req.isDeliveryConfirmed ? (
                          <div className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-black border-2 border-emerald-100 animate-in fade-in zoom-in-95">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            학생에게 전달됨
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              if(confirm('학생에게 상담 시간을 안내하셨습니까?')) {
                                onUpdateStatus(req.id, { isDeliveryConfirmed: true });
                                alert('전달되었습니다.');
                              }
                            }}
                            className="w-full md:w-auto px-6 py-3 bg-slate-800 text-white rounded-2xl text-xs font-black hover:bg-slate-700 transition-all active:scale-95 active:shadow-inner duration-75 shadow-md flex items-center justify-center gap-2"
                          >
                            <span>학생에게 전달 완료</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                          </button>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse border border-slate-200">
                      <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                      과목 선생님 확인 대기 중
                    </div>
                  )}
                </div>
              </div>
              
              {req.status === ConsultationStatus.COMPLETED && req.instructorNotes && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">상담 결과</span>
                  <p className="text-sm text-slate-700 leading-relaxed italic">"{req.instructorNotes}"</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
