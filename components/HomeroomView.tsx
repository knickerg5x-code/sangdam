
import React, { useState } from 'react';
import { ConsultationRequest, SUBJECTS, ConsultationStatus } from '../types';

interface HomeroomViewProps {
  requests: ConsultationRequest[];
  onAddRequest: (request: Omit<ConsultationRequest, 'id' | 'status' | 'createdAt'>) => void;
}

export const HomeroomView: React.FC<HomeroomViewProps> = ({ requests, onAddRequest }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentClass: '',
    studentName: '',
    subject: SUBJECTS[0],
    requesterName: '',
    reason: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.studentClass || !formData.requesterName) return;
    onAddRequest(formData);
    
    // 메신저용 문구 생성 및 복사 안내
    const msg = `[상담요청] ${formData.studentClass} ${formData.studentName} 학생에 대해 ${formData.subject} 상담을 요청드립니다. (신청: ${formData.requesterName} 선생님)`;
    navigator.clipboard.writeText(msg);
    alert('상담 신청이 완료되었습니다!\n강사님께 보낼 알림 문구가 클립보드에 복사되었습니다. 카톡이나 메신저에 붙여넣기 하세요.');
    
    setFormData({ ...formData, studentName: '', reason: '' });
    setIsFormOpen(false);
  };

  const getStatusColor = (status: ConsultationStatus) => {
    switch (status) {
      case ConsultationStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
      case ConsultationStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case ConsultationStatus.COMPLETED: return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">신청 현황</h3>
          <p className="text-xs text-slate-500 mt-1">강사님이 상담을 완료하면 상태가 업데이트됩니다.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-lg ${isFormOpen ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white hover:bg-blue-700 scale-105'}`}
        >
          {isFormOpen ? '취소' : '신규 상담 신청'}
          {!isFormOpen && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border-2 border-blue-50 shadow-xl space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">학년/반</label>
              <input required type="text" placeholder="1-3" className="w-full p-3.5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium" value={formData.studentClass} onChange={e => setFormData({ ...formData, studentClass: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">학생 성명</label>
              <input required type="text" placeholder="홍길동" className="w-full p-3.5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium" value={formData.studentName} onChange={e => setFormData({ ...formData, studentName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">상담 과목</label>
              <select className="w-full p-3.5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-bold text-slate-700" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">신청 교사명</label>
              <input required type="text" placeholder="김담임" className="w-full p-3.5 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium" value={formData.requesterName} onChange={e => setFormData({ ...formData, requesterName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-1">상담 요청 사유</label>
            <textarea placeholder="예: 최근 성적 변화가 심하고 수업 중 집중력이 떨어짐" className="w-full p-4 rounded-2xl bg-slate-50 border-0 focus:ring-2 focus:ring-blue-500 font-medium h-24" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            상담 요청 및 알림 문구 복사
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {requests.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <span className="text-4xl mb-4 block">📭</span>
            <p className="text-slate-400 font-medium">등록된 상담 요청이 없습니다.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-10 rounded-full ${req.status === ConsultationStatus.COMPLETED ? 'bg-emerald-500' : 'bg-yellow-400'}`}></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-800">{req.studentClass} {req.studentName}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">{req.subject}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString()} • {req.requesterName} 선생님 신청</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(req.status)}`}>
                  {req.status === ConsultationStatus.PENDING ? '대기' : req.status === ConsultationStatus.IN_PROGRESS ? '진행중' : '완료'}
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-2">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  <span className="text-slate-400 text-xs block mb-1 font-bold italic">요청 사유</span>
                  {req.reason || '사유 미입력'}
                </p>
              </div>

              {req.instructorNotes && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 mt-3">
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    <span className="text-emerald-600 text-xs block mb-1 font-bold italic">강사 피드백</span>
                    {req.instructorNotes}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
