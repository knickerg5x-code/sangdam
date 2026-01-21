
import { ConsultationRequest } from '../types';

/**
 * [필독: Google Apps Script 교체용 코드]
 * 아래 코드를 복사하여 구글 시트의 Apps Script 편집기에 붙여넣으세요.
 * 
 * function doGet(e) {
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   var sheet = ss.getSheets()[0];
 *   var data = sheet.getDataRange().getValues();
 *   var jsonArray = [];
 *   for (var i = 1; i < data.length; i++) {
 *     if (!data[i][0]) continue;
 *     jsonArray.push({
 *       id: String(data[i][0]),
 *       createdAt: data[i][1] ? new Date(data[i][1]).getTime() : Date.now(),
 *       studentClass: String(data[i][2]),
 *       studentName: String(data[i][3]),
 *       subject: String(data[i][4]),
 *       assignedInstructorName: String(data[i][5]),
 *       requesterName: String(data[i][6]),
 *       reason: String(data[i][7]),
 *       availableTimeSlots: String(data[i][8]).split(',').filter(Boolean),
 *       proposedDay: String(data[i][9]),
 *       proposedTime: String(data[i][10]),
 *       instructorNotes: String(data[i][11]),
 *       isDeliveryConfirmed: String(data[i][12]) === 'TRUE',
 *       status: String(data[i][13])
 *     });
 *   }
 *   return ContentService.createTextOutput(JSON.stringify(jsonArray)).setMimeType(ContentService.MimeType.JSON);
 * }
 * 
 * function doPost(e) {
 *   var ss = SpreadsheetApp.getActiveSpreadsheet();
 *   var sheet = ss.getSheets()[0];
 *   var data = JSON.parse(e.postData.contents);
 *   var action = data.action;
 *   var payload = data.data;
 *   var rows = sheet.getDataRange().getValues();
 *   
 *   if (action === "ADD") {
 *     sheet.appendRow([payload.id, new Date(), payload.studentClass, payload.studentName, payload.subject, payload.assignedInstructorName, payload.requesterName, payload.reason, payload.availableTimeSlots.join(','), "", "", "", "FALSE", "PENDING"]);
 *   } else if (action === "UPDATE") {
 *     for (var i = 1; i < rows.length; i++) {
 *       if (String(rows[i][0]) === String(payload.id)) {
 *         var row = i + 1;
 *         // 명시적으로 모든 필드를 업데이트하여 데이터 유실 방지
 *         if (payload.proposedDay !== undefined) sheet.getRange(row, 10).setValue(payload.proposedDay);
 *         if (payload.proposedTime !== undefined) sheet.getRange(row, 11).setValue(payload.proposedTime);
 *         if (payload.instructorNotes !== undefined) sheet.getRange(row, 12).setValue(payload.instructorNotes);
 *         if (payload.isDeliveryConfirmed !== undefined) sheet.getRange(row, 13).setValue(payload.isDeliveryConfirmed ? "TRUE" : "FALSE");
 *         if (payload.status !== undefined) sheet.getRange(row, 14).setValue(payload.status);
 *         break;
 *       }
 *     }
 *   }
 *   return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
 * }
 */

const SHEET_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzl3g7rGy_1sqUWpUzqV0DCPMXXo4S8WJCPOCkq5zpmII78loLQTlOOK74ekdvpI0X3/exec"; 

export const GoogleSheetService = {
  async fetchAll(): Promise<ConsultationRequest[]> {
    try {
      const response = await fetch(`${SHEET_WEB_APP_URL}?_t=${Date.now()}`, {
        method: 'GET',
        redirect: 'follow'
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Fetch failed:", error);
      const cached = localStorage.getItem('last_success_sync_data');
      return cached ? JSON.parse(cached) : [];
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
      return false;
    }
  }
};
