
import React from 'react';

interface DeploymentGuideProps {
  onClose: () => void;
}

export const DeploymentGuide: React.FC<DeploymentGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-black">1분 만에 인터넷 주소 만들기</h2>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">1</div>
              <p className="text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Vercel.com</strong> 또는 <strong className="text-slate-900">Netlify.com</strong>에 가입하세요 (무료).
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">2</div>
              <p className="text-slate-600 leading-relaxed">
                새 프로젝트 만들기 버튼을 누르고, 지금 보시는 이 코드를 <strong className="text-slate-900">GitHub</strong>에 올린 뒤 연결만 하면 됩니다.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">3</div>
              <p className="text-slate-600 leading-relaxed">
                주소가 생성되면 선생님들께 공유하세요!
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
            <p className="text-xs text-yellow-800 font-medium leading-relaxed">
              💡 <strong className="block mb-1">데이터 동기화 팁</strong>
              현재 버전은 실시간 서버가 없습니다. 상담 신청 후 상단의 <strong className="underline">"목록 공유 링크"</strong>를 복사해서 다른 선생님께 보내시면 상대방도 같은 목록을 볼 수 있습니다.
            </p>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
          >
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
};
