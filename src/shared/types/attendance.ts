export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'holiday';
export type ShiftType = 'morning' | 'afternoon' | 'night' | 'flexible';
export type OvertimeStatus = 'pending' | 'approved' | 'rejected';

export interface Shift {
  id: string;
  name: string;
  type: ShiftType;
  startTime: string; // HH:mm format
  endTime: string;
  breakDuration: number; // minutes
  gracePeriod: number; // minutes
  isActive: boolean;
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  shiftId: string;
  shiftName: string;
  checkIn?: string; // ISO datetime
  checkOut?: string;
  status: AttendanceStatus;
  workHours: number;
  overtimeHours: number;
  lateMinutes: number;
  earlyDepartureMinutes: number;
  location?: string;
  ipAddress?: string;
  notes?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hours: number;
  reason: string;
  status: OvertimeStatus;
  requestedAt: string;
  respondedAt?: string;
  respondedBy?: string;
  responseNotes?: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}
