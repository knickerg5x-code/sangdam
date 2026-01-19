
/**
 * [구글 스프레드시트 Apps Script 복사용 코드]
 * - 아래 코드를 Apps Script 에디터에 전체 복사하여 붙여넣고 '새 배포' (웹 앱, 모든 사람) 하세요.
 * 
 * function doGet() {
 *   var sheet = SpreadsheetApp.openById("17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo").getSheets()[0];
 *   var data = sheet.getDataRange().getValues();
 *   var headers = data[0];
 *   var jsonArray = [];
 *   
 *   for (var i = 1; i < data.length; i++) {
 *     var obj = {};
 *     obj.id = data[i][0];
 *     obj.createdAt = new Date(data[i][1]).getTime();
 *     obj.studentClass = data[i][2];
 *     obj.studentName = data[i][3];
 *     obj.subject = data[i][4];
 *     obj.assignedInstructorName = data[i][5];
 *     obj.requesterName = data[i][6];
 *     obj.reason = data[i][7];
 *     obj.availableTimeSlots = data[i][8] ? data[i][8].split(", ") : [];
 *     obj.proposedDay = data[i][9];
 *     obj.proposedTime = data[i][10];
 *     obj.instructorNotes = data[i][11];
 *     obj.isDeliveryConfirmed = data[i][12] === "완료";
 *     obj.status = data[i][13];
 *     jsonArray.push(obj);
 *   }
 *   
 *   return ContentService.createTextOutput(JSON.stringify(jsonArray))
 *     .setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var sheet = SpreadsheetApp.openById("17sLO9dO4_wJBUsoDqy1YySymuuXmkMRRXe96yp8UlDo").getSheets()[0];
 *   var data = JSON.parse(e.postData.contents);
 *   var action = data.action;
 *   var payload = data.data;
 *   var rows = sheet.getDataRange().getValues();
 *   
 *   if (action === "ADD") {
 *     sheet.appendRow([
 *       payload.id,
 *       payload.createdAt ? new Date(payload.createdAt) : new Date(),
 *       payload.studentClass,
 *       payload.studentName,
 *       payload.subject,
 *       payload.assignedInstructorName,
 *       payload.requesterName,
 *       payload.reason,
 *       payload.availableTimeSlots.join(", "),
 *       "", "", "", "미완료", "PENDING"
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
  // 전체 데이터 가져오기 (실시간 공유의 핵심)
  async fetchAll(): Promise<ConsultationRequest[]> {
    try {
      const response = await fetch(SHEET_WEB_APP_URL);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Sheet FETCH Error:", error);
      return [];
    }
  },

  async syncAdd(request: ConsultationRequest) {
    try {
      await fetch(SHEET_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "ADD", data: request })
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
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: "UPDATE", data: request })
      });
      return true;
    } catch (error) {
      console.error("Sheet UPDATE Error:", error);
      return false;
    }
  }
};
