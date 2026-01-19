
import React from 'react';

interface NotificationCenterProps {
  notifications: { id: string; message: string; type: 'sms' | 'system' }[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-right-10 duration-500 ${
            n.type === 'sms' 
              ? 'bg-slate-900 text-white border-slate-700' 
              : 'bg-white text-slate-800 border-slate-200'
          }`}
        >
          <div className="bg-blue-500 rounded-lg p-2 shrink-0">
            {n.type === 'sms' ? (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold opacity-60 mb-0.5 uppercase tracking-widest">
              {n.type === 'sms' ? '가상 SMS 알림' : '시스템'}
            </p>
            <p className="text-sm font-medium leading-relaxed">{n.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
