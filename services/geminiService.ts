
import { GoogleGenAI } from "@google/genai";
import { ConsultationRequest } from "../types";

// Note: Using Gemini 3 Flash for fast processing of consultation notes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateConsultationSummary(request: ConsultationRequest): Promise<string> {
  try {
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
    return "AI 연동 중 오류가 발생했습니다.";
  }
}
