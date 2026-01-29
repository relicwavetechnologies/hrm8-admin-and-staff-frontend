import { InterviewSlot } from '@/shared/types/interviewConfirmation';
import { getInterviews } from './interviewService';

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  timezone: string;
}

export const mockInterviewers: Interviewer[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah.j@company.com', timezone: 'America/New_York' },
  { id: '2', name: 'Michael Chen', email: 'michael.c@company.com', timezone: 'America/Los_Angeles' },
  { id: '3', name: 'Emily Davis', email: 'emily.d@company.com', timezone: 'America/Chicago' },
  { id: '4', name: 'David Wilson', email: 'david.w@company.com', timezone: 'America/New_York' },
];

export function getInterviewers(): Interviewer[] {
  return mockInterviewers;
}

export function getInterviewer(id: string): Interviewer | undefined {
  return mockInterviewers.find(i => i.id === id);
}

export function generateAvailableSlots(
  interviewerId: string,
  date: Date,
  durationMinutes: number = 60
): InterviewSlot[] {
  const interviewer = getInterviewer(interviewerId);
  if (!interviewer) return [];

  const slots: InterviewSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 17; // 5 PM
  const slotInterval = 30; // 30 minute intervals

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const startTime = new Date(date);
      startTime.setHours(hour, minute, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + durationMinutes);

      // Check if slot extends beyond working hours
      if (endTime.getHours() >= endHour) continue;

      const slot: InterviewSlot = {
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        interviewerId,
        interviewerName: interviewer.name,
        isAvailable: true,
        conflicts: [],
      };

      // Check for conflicts with existing interviews
      const conflicts = checkSlotConflicts(slot);
      slot.isAvailable = conflicts.length === 0;
      slot.conflicts = conflicts;

      slots.push(slot);
    }
  }

  return slots;
}

export function checkSlotConflicts(slot: InterviewSlot): string[] {
  const interviews = getInterviews();
  const conflicts: string[] = [];

  const slotStart = new Date(slot.startTime);
  const slotEnd = new Date(slot.endTime);

  interviews.forEach(interview => {
    const interviewStart = new Date(interview.scheduledDate);
    const interviewEnd = new Date(interviewStart.getTime() + interview.duration * 60000);

    // Check if interviewer is the same
    if (interview.interviewerNames?.includes(slot.interviewerName)) {
      // Check for time overlap
      if (
        (slotStart >= interviewStart && slotStart < interviewEnd) ||
        (slotEnd > interviewStart && slotEnd <= interviewEnd) ||
        (slotStart <= interviewStart && slotEnd >= interviewEnd)
      ) {
        conflicts.push(`${interview.candidateName} - ${interview.jobTitle}`);
      }
    }
  });

  return conflicts;
}

export function suggestAlternativeSlots(
  interviewerId: string,
  preferredDate: Date,
  durationMinutes: number,
  count: number = 3
): InterviewSlot[] {
  const allSlots: InterviewSlot[] = [];

  // Check the preferred date and the next 5 days
  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const date = new Date(preferredDate);
    date.setDate(date.getDate() + dayOffset);
    
    const daySlots = generateAvailableSlots(interviewerId, date, durationMinutes);
    allSlots.push(...daySlots.filter(slot => slot.isAvailable));

    if (allSlots.length >= count) break;
  }

  return allSlots.slice(0, count);
}
