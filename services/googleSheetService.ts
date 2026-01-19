
import { ConsultationRequest } from '../types';

/**
 * [구글 스프레드시트 연동 설정]
 * 배포 URL: 사용자가 제공한 최신 주소 반영
 */
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwLRxrJgmLnfzJ0AI2F4Ie3nGTlBTqTtLbW19JJy1QxKkD6_6wuiYQH-aHxkyaQ30Zj/exec"; 

export const GoogleSheetService = {
  /**
   * 전체 상담 데이터 불러오기
   */
  async fetchAll(): Promise<ConsultationRequest[]> {
    try {
      // 캐시 방지를 위해 타임스탬프 쿼리 추가 및 리다이렉트 허용
      const response = await fetch(`${SHEET_WEB_APP_URL}?_t=${Date.now()}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-store',
        redirect: 'follow',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 에러: ${response.status}`);
      }
      
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        if (data.error) throw new Error(data.error);
        
        const results = Array.isArray(data) ? data : [];
        // 성공한 데이터 로컬에 백업
        localStorage.setItem('last_success_sync_data', JSON.stringify(results));
        return results;
      } catch (parseError) {
        console.error("JSON 파싱 실패. 응답 내용:", text);
        throw new Error("서버 응답 형식이 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("데이터 불러오기 실패:", error);
      // 오프라인 상태이거나 에러 시 로컬 캐시 데이터 반환
      const cached = localStorage.getItem('last_success_sync_data');
      if (cached) {
        console.warn("네트워크 오류로 로컬 캐시 데이터를 사용합니다.");
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  /**
   * 새로운 상담 신청 추가
   */
  async syncAdd(request: ConsultationRequest) {
    try {
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS 정책 우회를 위해 no-cors 사용 (전송 보장)
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "ADD", data: request })
      });
      return true;
    } catch (error) {
      console.error("시트 저장 실패:", error);
      return false;
    }
  },

  /**
   * 상담 상태 및 내용 업데이트
   */
  async syncUpdate(request: ConsultationRequest) {
    try {
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "UPDATE", data: request })
      });
      return true;
    } catch (error) {
      console.error("시트 업데이트 실패:", error);
      return false;
    }
  }
};
