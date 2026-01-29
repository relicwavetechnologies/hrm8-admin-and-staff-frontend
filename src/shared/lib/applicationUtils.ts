import type { ApplicationStatus, ApplicationStage, Application } from '@/shared/types/application';

export function getApplicationStageLabel(stage: ApplicationStage): string {
  return stage;
}

export function getApplicationStatusColor(status: ApplicationStatus): string {
  switch (status) {
    case 'applied':
      return 'info';
    case 'screening':
      return 'warning';
    case 'interview':
      return 'primary';
    case 'offer':
      return 'success';
    case 'hired':
      return 'success';
    case 'rejected':
      return 'destructive';
    case 'withdrawn':
      return 'secondary';
    default:
      return 'secondary';
  }
}

export function canMoveToStage(currentStage: ApplicationStage, newStage: ApplicationStage): boolean {
  const stageOrder: ApplicationStage[] = [
    'New Application',
    'Resume Review',
    'Phone Screen',
    'Technical Interview',
    'Manager Interview',
    'Final Round',
    'Reference Check',
    'Offer Extended',
    'Offer Accepted',
  ];
  
  const currentIndex = stageOrder.indexOf(currentStage);
  const newIndex = stageOrder.indexOf(newStage);
  
  // Can't move from terminal states
  if (currentStage === 'Rejected' || currentStage === 'Withdrawn' || currentStage === 'Offer Accepted') {
    return false;
  }
  
  // Can always reject or withdraw
  if (newStage === 'Rejected' || newStage === 'Withdrawn') {
    return true;
  }
  
  // Can move forward or backward (to re-interview)
  return newIndex >= 0;
}

export function calculateDaysInStage(application: Application): number {
  const now = new Date();
  const lastUpdate = application.updatedAt;
  const diff = now.getTime() - lastUpdate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getNextStage(currentStage: ApplicationStage): ApplicationStage | null {
  const stageFlow: Record<ApplicationStage, ApplicationStage | null> = {
    'New Application': 'Resume Review',
    'Resume Review': 'Phone Screen',
    'Phone Screen': 'Technical Interview',
    'Technical Interview': 'Manager Interview',
    'Manager Interview': 'Final Round',
    'Final Round': 'Reference Check',
    'Reference Check': 'Offer Extended',
    'Offer Extended': 'Offer Accepted',
    'Offer Accepted': null,
    'Rejected': null,
    'Withdrawn': null,
  };
  
  return stageFlow[currentStage] || null;
}

export function getStageColor(stage: ApplicationStage): string {
  const colorMap: Record<ApplicationStage, string> = {
    'New Application': 'bg-blue-100 text-blue-800',
    'Resume Review': 'bg-indigo-100 text-indigo-800',
    'Phone Screen': 'bg-purple-100 text-purple-800',
    'Technical Interview': 'bg-pink-100 text-pink-800',
    'Manager Interview': 'bg-rose-100 text-rose-800',
    'Final Round': 'bg-orange-100 text-orange-800',
    'Reference Check': 'bg-amber-100 text-amber-800',
    'Offer Extended': 'bg-lime-100 text-lime-800',
    'Offer Accepted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Withdrawn': 'bg-gray-100 text-gray-800',
  };
  
  return colorMap[stage] || 'bg-gray-100 text-gray-800';
}

export interface GroupedApplications {
  [jobId: string]: {
    jobTitle: string;
    employerName: string;
    applications: Application[];
  };
}

export function groupApplicationsByJob(applications: Application[]): GroupedApplications {
  return applications.reduce((acc, app) => {
    if (!acc[app.jobId]) {
      acc[app.jobId] = {
        jobTitle: app.jobTitle,
        employerName: app.employerName,
        applications: [],
      };
    }
    acc[app.jobId].applications.push(app);
    return acc;
  }, {} as GroupedApplications);
}

export interface TimelineEvent {
  id: string;
  type: 'status_change' | 'note_added' | 'email_sent' | 'interview_scheduled' | 'document_uploaded' | 'rating_changed' | 'application_viewed';
  title: string;
  description: string;
  date: Date;
  icon?: string;
  user?: string;
}

export function getApplicationTimeline(application: Application): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  
  // Add application created event
  events.push({
    id: 'created',
    type: 'status_change',
    title: 'Application Submitted',
    description: `Applied for ${application.jobTitle}`,
    date: application.createdAt,
  });
  
  // Add all activities
  application.activities.forEach(activity => {
    events.push({
      id: activity.id,
      type: activity.type,
      title: activity.description,
      description: '',
      date: activity.createdAt,
      user: activity.userName,
    });
  });
  
  // Add interview events
  application.interviews.forEach(interview => {
    events.push({
      id: interview.id,
      type: 'interview_scheduled',
      title: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} Interview`,
      description: interview.status === 'completed' ? `Completed with rating ${interview.rating}/5` : 'Scheduled',
      date: interview.scheduledDate,
    });
  });
  
  // Sort by date descending
  return events.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function getApplicationsByStatus(applications: Application[]): Record<ApplicationStatus, Application[]> {
  return applications.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);
}

export function calculateAverageTimeInStage(applications: Application[], stage: ApplicationStage): number {
  const appsInStage = applications.filter(a => a.stage === stage);
  if (appsInStage.length === 0) return 0;
  
  const totalDays = appsInStage.reduce((sum, app) => sum + calculateDaysInStage(app), 0);
  return Math.round(totalDays / appsInStage.length);
}
