export type MeetingType = 'VIDEO' | 'PHONE' | 'IN_PERSON' | 'PANEL';

export interface MeetingTemplate {
  id: string;
  name: string;
  type: MeetingType;
  duration: number; // in minutes
  description: string;
}

export const meetingTemplates: MeetingTemplate[] = [
  {
    id: 'technical-screen',
    name: 'Technical Screen',
    type: 'VIDEO',
    duration: 45,
    description: 'Initial technical assessment with coding exercises',
  },
  {
    id: 'phone-screen',
    name: 'Phone Screen',
    type: 'PHONE',
    duration: 30,
    description: 'Quick phone conversation to assess fit',
  },
  {
    id: 'behavioral',
    name: 'Behavioral Interview',
    type: 'VIDEO',
    duration: 60,
    description: 'Cultural fit and behavioral assessment',
  },
  {
    id: 'final-round',
    name: 'Final Round',
    type: 'PANEL',
    duration: 90,
    description: 'Final interview with leadership team',
  },
  {
    id: 'in-person',
    name: 'In-Person Interview',
    type: 'IN_PERSON',
    duration: 60,
    description: 'On-site interview at company office',
  },
  {
    id: 'manager-interview',
    name: 'Manager Interview',
    type: 'VIDEO',
    duration: 45,
    description: 'Interview with hiring manager',
  },
];

export const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export function getMeetingTypeIcon(type: MeetingType): string {
  switch (type) {
    case 'VIDEO':
      return '🎥';
    case 'PHONE':
      return '📞';
    case 'IN_PERSON':
      return '🏢';
    case 'PANEL':
      return '👥';
    default:
      return '📅';
  }
}

export function getMeetingTypeColor(type: MeetingType): string {
  switch (type) {
    case 'VIDEO':
      return 'bg-blue-500/10 text-blue-700 border-blue-200';
    case 'PHONE':
      return 'bg-green-500/10 text-green-700 border-green-200';
    case 'IN_PERSON':
      return 'bg-purple-500/10 text-purple-700 border-purple-200';
    case 'PANEL':
      return 'bg-orange-500/10 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-500/10 text-gray-700 border-gray-200';
  }
}
