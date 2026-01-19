
import { GoogleGenAI } from "@google/genai";
import { ConsultationRequest } from "../types";

export async function generateConsultationSummary(request: ConsultationRequest): Promise<string> {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    console.error("API_KEY가 설정되지 않았습니다. Vercel 환경 변수를 확인하세요.");
    return "AI 기능을 사용하려면 관리자 설정에서 API 키 등록이 필요합니다.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      You are an expert school counselor assistant. 
      Summarize the following student consultation notes into a professional, concise feedback for the homeroom teacher.
      The feedback should include: 
      1. Key issues discussed.
      2. Suggested action items or follow-ups.
      
      Language: Korean (Professional school tone)
      
      Student: ${request.studentName} (${request.studentClass})
      Subject: ${request.subject}
      Homeroom Teacher's Request: ${request.reason}
      Subject Instructor's Notes: ${request.instructorNotes}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "요약을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 서비스 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}
