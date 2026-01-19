
import React, { useState } from 'react';
import { ConsultationRequest, SUBJECTS, ConsultationStatus, DAYS, PERIODS } from '../types';

interface HomeroomViewProps {
  requests: ConsultationRequest[];
  onAddRequest: (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateStatus: (id: string, updates: Partial<ConsultationRequest>) => void;
}

export const HomeroomView: React.FC<HomeroomViewProps> = ({ requests, onAddRequest, onUpdateStatus }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentClass: '',
    studentName: '',
    subject: SUBJECTS[0],
    assignedInstructorName: '',
    requesterName: '',
    reason: '',
    availableTimeSlots: [] as string[]
  });

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
    if (!formData.studentName || !formData.studentClass || !formData.requesterName || !formData.assignedInstructorName) return;
    if (formData.availableTimeSlots.length === 0) {
      alert("상담 가능 시간을 선택해주세요.");
      return;
    }
    onAddRequest(formData);
    
    const msg = `[상담요청] ${formData.assignedInstructorName} 선생님, ${formData.studentClass} ${formData.studentName} 학생에 대해 ${formData.subject} 상담을 요청드립니다.`;
    navigator.clipboard.writeText(msg);
    alert('상담 신청이 완료되었습니다!\n알림 문구가 클립보드에 복사되었습니다.');
    
    setFormData({ ...formData, studentName: '', reason: '', availableTimeSlots: [] });
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">신청 현황</h3>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`px-5 py-2.5 rounded-2xl font-bold transition-all shadow-lg ${isFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {isFormOpen ? '취소' : '신규 상담 신청'}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-xl space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input required placeholder="반 (예: 1-3)" className="p-3 bg-slate-50 rounded-xl border-0" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })} />
            <input required placeholder="학생 성명" className="p-3 bg-slate-50 rounded-xl border-0" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
            <select className="p-3 bg-slate-50 rounded-xl border-0 font-bold" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input required placeholder="담당 강사명" className="p-3 bg-slate-50 rounded-xl border-0" value={formData.assignedInstructorName} onChange={e => setFormData({ ...formData, assignedInstructorName: e.target.value })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700">상담 가능 시간 (클릭하여 선택)</label>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-200 text-center text-xs">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2">교시</th>
                    {DAYS.map(d => <th key={d} className="border p-2">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(p => (
                    <tr key={p}>
                      <td className="border p-2 font-bold bg-slate-50">{p}</td>
                      {DAYS.map(d => {
                        const isSelected = formData.availableTimeSlots.includes(`${d}-${p}`);
                        return (
                          <td 
                            key={`${d}-${p}`} 
                            onClick={() => toggleTimeSlot(d, p)}
                            className={`border p-2 cursor-pointer transition-colors hover:bg-blue-50 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-transparent'}`}
                          >
                            ✓
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <input required placeholder="신청 교사명" className="w-full p-3 bg-slate-50 rounded-xl border-0" value={formData.requesterName} onChange={e => setFormData({ ...formData, requesterName: e.target.value })} />
          <textarea placeholder="요청 사유" className="w-full p-3 bg-slate-50 rounded-xl border-0 h-20" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg">신청 완료</button>
        </form>
      )}

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">요청 내역이 없습니다.</div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-black text-lg">{req.studentClass} {req.studentName} ({req.subject})</h4>
                  <p className="text-xs text-slate-400">담당: {req.assignedInstructorName} • 신청: {req.requesterName}</p>
                </div>
                <div className="text-right">
                  {req.proposedDay ? (
                    <div className="space-y-2">
                      <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-black italic">
                        강사 제안: {req.proposedDay}요일 {req.proposedTime}
                      </div>
                      {!req.isDeliveryConfirmed && (
                        <button 
                          onClick={() => onUpdateStatus(req.id, { isDeliveryConfirmed: true })}
                          className="text-[10px] px-3 py-1 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700"
                        >
                          학생에게 전달 완료
                        </button>
                      )}
                      {req.isDeliveryConfirmed && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                          전달됨
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold italic">강사 확인 대기 중...</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
