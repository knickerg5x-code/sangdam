
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
  assignedInstructorName: string;
  requesterName: string;
  reason: string;
  status: ConsultationStatus;
  createdAt: number;
  completedAt?: number;
  instructorNotes?: string;
  // 신규 필드
  availableTimeSlots: string[]; // ['월-1', '화-3'...]
  proposedDay?: string;        // 강사가 제안한 요일
  proposedTime?: string;       // 강사가 제안한 시간
  isDeliveryConfirmed?: boolean; // 담임의 전달 완료 여부
}

export const SUBJECTS = [
  '국어', '수학', '영어', '과학', '사회', '역사', '제2외국어', '예체능'
];

export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const PERIODS = [1, 2, 3, 4, 5, 6, 7];
