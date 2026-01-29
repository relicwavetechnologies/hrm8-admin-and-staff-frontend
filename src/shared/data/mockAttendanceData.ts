import type { AttendanceRecord, OvertimeRequest, Shift } from '@/shared/types/attendance';

export const mockShifts: Shift[] = [
  {
    id: '1',
    name: 'Morning Shift',
    type: 'morning',
    startTime: '09:00',
    endTime: '17:00',
    breakDuration: 60,
    gracePeriod: 15,
    isActive: true,
    daysOfWeek: [1, 2, 3, 4, 5],
  },
  {
    id: '2',
    name: 'Afternoon Shift',
    type: 'afternoon',
    startTime: '13:00',
    endTime: '21:00',
    breakDuration: 60,
    gracePeriod: 15,
    isActive: true,
    daysOfWeek: [1, 2, 3, 4, 5],
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    shiftId: '1',
    shiftName: 'Morning Shift',
    checkIn: new Date().toISOString(),
    checkOut: undefined,
    status: 'present',
    workHours: 0,
    overtimeHours: 0,
    lateMinutes: 0,
    earlyDepartureMinutes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const mockOvertimeRequests: OvertimeRequest[] = [
  {
    id: '1',
    employeeId: 'emp1',
    employeeName: 'John Doe',
    date: new Date().toISOString().split('T')[0],
    hours: 3,
    reason: 'Project deadline',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  },
];
