
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
  availableTimeSlots: string[];
  proposedDay?: string;
  proposedTime?: string;
  isDeliveryConfirmed?: boolean;
}

export const SUBJECTS = ['국어', '수학', '영어'];
export const CLASSES = ['M1', 'M2', 'S1', 'S2', 'A1', 'A2', 'A3', 'A4'];
export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const PERIODS = [1, 2, 3, 4, 5, 6];
