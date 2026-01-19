
/**
 * [구글 스프레드시트 Apps Script 복사용 코드]
 * - 이 코드를 Google Apps Script 프로젝트에 붙여넣고 '웹 앱'으로 배포(액세스 권한: 모든 사람)하세요.
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.openById("17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo").getSheets()[0];
 *   var data;
 *   try {
 *     data = JSON.parse(e.postData.contents);
 *   } catch(err) {
 *     return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
 *   }
 *   
 *   var action = data.action;
 *   var payload = data.data;
 *   var rows = sheet.getDataRange().getValues();
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
 *       "", // 10열: 확정요일
 *       "", // 11열: 확정시간
 *       "", // 12열: 상담결과
 *       "미완료", // 13열: 전달여부
 *       "대기중"  // 14열: 상태
 *     ]);
 *   } else if (action === "UPDATE") {
 *     for (var i = 1; i < rows.length; i++) {
 *       if (rows[i][0] == payload.id) {
 *         var rowNum = i + 1;
 *         if(payload.proposedDay) sheet.getRange(rowNum, 10).setValue(payload.proposedDay);
 *         if(payload.proposedTime) sheet.getRange(rowNum, 11).setValue(payload.proposedTime);
 *         if(payload.instructorNotes) sheet.getRange(rowNum, 12).setValue(payload.instructorNotes);
 *         if(payload.isDeliveryConfirmed !== undefined) sheet.getRange(rowNum, 13).setValue(payload.isDeliveryConfirmed ? "완료" : "미완료");
 *         if(payload.status) sheet.getRange(rowNum, 14).setValue(payload.status);
 *         break;
 *       }
 *     }
 *   }
 *   return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 * }
 */

import { ConsultationRequest } from '../types';

const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzDtHzTSvy6MhDJzrNQy6m3K1eNTJoIXJEvvnLMrdsT95HeBGAq-Ae5CzqjK6BWjEGu/exec"; 

export const GoogleSheetService = {
  async syncAdd(request: ConsultationRequest) {
    try {
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: "ADD",
          data: {
            ...request,
            createdAt: new Date(request.createdAt).toLocaleString('ko-KR')
          }
        })
      });
      return true;
    } catch (error) {
      console.error("Sheet ADD Error:", error);
      return false;
    }
  },

  async syncUpdate(request: ConsultationRequest) {
    try {
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: "UPDATE",
          data: request
        })
      });
      return true;
    } catch (error) {
      console.error("Sheet UPDATE Error:", error);
      return false;
    }
  }
};
