
export type Role = 'HOMEROOM' | 'INSTRUCTOR';

export enum ConsultationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface ConsultationRequest {
  id: string;
  studentName: string;
  studentClass: string;
  subject: string;
  requesterName: string;
  reason: string;
  status: ConsultationStatus;
  createdAt: number;
  completedAt?: number;
  instructorNotes?: string;
  aiSummary?: string;
}

export const SUBJECTS = [
  '국어', '수학', '영어', '과학', '사회', '역사', '제2외국어', '예체능'
];
