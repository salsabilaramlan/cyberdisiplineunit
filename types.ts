export interface Student {
  id: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
}

export interface LateRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  timestamp: string; // ISO Date string
  reason: string;
  minutesLate: number;
}

export interface DailyStats {
  date: string;
  count: number;
}

export interface ClassStats {
  className: string;
  count: number;
}

export interface ReasonStats {
  reason: string;
  count: number;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  LIST = 'LIST',
  ANALYTICS = 'ANALYTICS'
}