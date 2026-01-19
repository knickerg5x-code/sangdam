
/**
 * [구글 스프레드시트 Apps Script 복사용 코드]
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.openById("17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo").getSheets()[0];
 *   var data = JSON.parse(e.postData.contents);
 *   var action = data.action;
 *   var payload = data.data;
 *   
 *   var rows = sheet.getDataRange().getValues();
 *   var idColumnIndex = 0; // ID가 첫 번째 열(A)에 있다고 가정
 *   
 *   if (action === "ADD") {
 *     sheet.appendRow([
 *       payload.id,
 *       payload.createdAt,
 *       payload.studentClass,
 *       payload.studentName,
 *       payload.subject,
 *       payload.assignedInstructorName,
 *       payload.requesterName,
 *       payload.reason,
 *       payload.availableTimeSlots.join(", "),
 *       "", // 확정요일
 *       "", // 확정시간
 *       "", // 상담결과
 *       "미완료", // 전달여부
 *       "대기중"  // 상태
 *     ]);
 *     return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   if (action === "UPDATE") {
 *     for (var i = 1; i < rows.length; i++) {
 *       if (rows[i][idColumnIndex] == payload.id) {
 *         var rowNum = i + 1;
 *         sheet.getRange(rowNum, 10).setValue(payload.proposedDay || rows[i][9]);
 *         sheet.getRange(rowNum, 11).setValue(payload.proposedTime || rows[i][10]);
 *         sheet.getRange(rowNum, 12).setValue(payload.instructorNotes || rows[i][11]);
 *         sheet.getRange(rowNum, 13).setValue(payload.isDeliveryConfirmed ? "완료" : "미완료");
 *         sheet.getRange(rowNum, 14).setValue(payload.status);
 *         break;
 *       }
 *     }
 *     return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 */

import { ConsultationRequest } from '../types';

// 주의: 실제 배포 후 생성된 Apps Script URL을 여기에 넣어야 합니다.
const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz_SAMPLE_ID/exec"; 

export const GoogleSheetService = {
  async syncAdd(request: ConsultationRequest) {
    try {
      const response = await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Apps Script 특성상 no-cors가 필요할 수 있음
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "ADD",
          data: {
            ...request,
            createdAt: new Date(request.createdAt).toLocaleString()
          }
        })
      });
      return true;
    } catch (error) {
      console.error("Sheet Sync Error:", error);
      return false;
    }
  },

  async syncUpdate(request: ConsultationRequest) {
    try {
      const response = await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "UPDATE",
          data: request
        })
      });
      return true;
    } catch (error) {
      console.error("Sheet Update Error:", error);
      return false;
    }
  }
};
