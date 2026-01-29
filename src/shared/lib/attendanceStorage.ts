import type { AttendanceRecord, OvertimeRequest, Shift, AttendanceStats } from '@/shared/types/attendance';
import { mockAttendanceRecords, mockOvertimeRequests, mockShifts } from '@/shared/data/mockAttendanceData';

const STORAGE_KEY = 'attendance_records';
const OVERTIME_KEY = 'overtime_requests';
const SHIFTS_KEY = 'shifts';

function initializeData() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAttendanceRecords));
  }
  if (!localStorage.getItem(OVERTIME_KEY)) {
    localStorage.setItem(OVERTIME_KEY, JSON.stringify(mockOvertimeRequests));
  }
  if (!localStorage.getItem(SHIFTS_KEY)) {
    localStorage.setItem(SHIFTS_KEY, JSON.stringify(mockShifts));
  }
}

export function getAttendanceRecords(): AttendanceRecord[] {
  initializeData();
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveAttendanceRecord(record: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): AttendanceRecord {
  const records = getAttendanceRecords();
  const newRecord: AttendanceRecord = {
    ...record,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  records.push(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return newRecord;
}

export function updateAttendanceRecord(id: string, updates: Partial<AttendanceRecord>): AttendanceRecord | null {
  const records = getAttendanceRecords();
  const index = records.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  records[index] = {
    ...records[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  return records[index];
}

export function getOvertimeRequests(): OvertimeRequest[] {
  initializeData();
  const stored = localStorage.getItem(OVERTIME_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveOvertimeRequest(request: Omit<OvertimeRequest, 'id' | 'requestedAt'>): OvertimeRequest {
  const requests = getOvertimeRequests();
  const newRequest: OvertimeRequest = {
    ...request,
    
    requestedAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  localStorage.setItem(OVERTIME_KEY, JSON.stringify(requests));
  return newRequest;
}

export function updateOvertimeRequest(id: string, updates: Partial<OvertimeRequest>): OvertimeRequest | null {
  const requests = getOvertimeRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  requests[index] = { ...requests[index], ...updates };
  localStorage.setItem(OVERTIME_KEY, JSON.stringify(requests));
  return requests[index];
}

export function getShifts(): Shift[] {
  initializeData();
  const stored = localStorage.getItem(SHIFTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function calculateAttendanceStats(employeeId: string, startDate: string, endDate: string): AttendanceStats {
  const records = getAttendanceRecords().filter(
    r => r.employeeId === employeeId && r.date >= startDate && r.date <= endDate
  );

  const totalDays = records.length;
  const presentDays = records.filter(r => ['present', 'late', 'half-day'].includes(r.status)).length;
  const absentDays = records.filter(r => r.status === 'absent').length;
  const lateDays = records.filter(r => r.status === 'late').length;
  const totalWorkHours = records.reduce((sum, r) => sum + r.workHours, 0);
  const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeHours, 0);

  return {
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    totalWorkHours,
    totalOvertimeHours,
    attendanceRate: totalDays > 0 ? (presentDays / totalDays) * 100 : 0,
  };
}
