
import { ConsultationRequest } from '../types';

/**
 * [연동 방법]
 * 1. 구글 시트 -> 확장 프로그램 -> Apps Script 접속
 * 2. 기존 코드 삭제 후, 대화창에서 제공받은 Google Apps Script 코드를 복사/붙여넣기
 * 3. 배포 -> 새 배포 -> '모든 사람'에게 액세스 권한 부여 후 배포
 * 4. 생성된 URL을 아래 SHEET_WEB_APP_URL에 붙여넣기
 */
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzZEM70iR32ADUs0vzOPNsnBkmVLd0QAlGJw16H3nr3LpCdqG5PJouBTsEYvuXl6Vi4/exec"; 

export const GoogleSheetService = {
  /**
   * 전체 상담 데이터 불러오기 (GET)
   */
  async fetchAll(): Promise<ConsultationRequest[]> {
    try {
      const response = await fetch(`${SHEET_WEB_APP_URL}?_t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      
      if (!response.ok) throw new Error(`HTTP 에러: ${response.status}`);
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      const results = Array.isArray(data) ? data : [];
      localStorage.setItem('last_success_sync_data', JSON.stringify(results));
      return results;
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      const cached = localStorage.getItem('last_success_sync_data');
      return cached ? JSON.parse(cached) : [];
    }
  },

  /**
   * 새로운 상담 신청 추가 (POST)
   */
  async syncAdd(request: ConsultationRequest) {
    try {
      // no-cors 모드는 응답을 읽을 수 없으나 데이터 전송은 보장됨
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "ADD", data: request })
      });
      return true;
    } catch (error) {
      console.error("데이터 추가 실패:", error);
      return false;
    }
  },

  /**
   * 상담 상태 및 내용 업데이트 (POST)
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
      console.error("데이터 업데이트 실패:", error);
      return false;
    }
  }
};
