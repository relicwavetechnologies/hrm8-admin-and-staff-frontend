export interface TemplatePerformance {
  templateId: string;
  templateName: string;
  sendCount: number;
  openCount: number;
  clickCount: number;
  responseCount: number;
  openRate: number;
  clickRate: number;
  responseRate: number;
  avgTimeToOpen: number; // in hours
  lastUsed: string;
}

export const mockTemplatePerformance: TemplatePerformance[] = [
  {
    templateId: '1',
    templateName: 'Interview Invitation',
    sendCount: 45,
    openCount: 38,
    clickCount: 25,
    responseCount: 20,
    openRate: 84.4,
    clickRate: 55.6,
    responseRate: 44.4,
    avgTimeToOpen: 3.5,
    lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    templateId: '2',
    templateName: 'Application Received',
    sendCount: 120,
    openCount: 95,
    clickCount: 15,
    responseCount: 8,
    openRate: 79.2,
    clickRate: 12.5,
    responseRate: 6.7,
    avgTimeToOpen: 1.2,
    lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    templateId: '3',
    templateName: 'Rejection Notice',
    sendCount: 35,
    openCount: 28,
    clickCount: 5,
    responseCount: 2,
    openRate: 80.0,
    clickRate: 14.3,
    responseRate: 5.7,
    avgTimeToOpen: 8.5,
    lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    templateId: '4',
    templateName: 'Follow-up Reminder',
    sendCount: 28,
    openCount: 24,
    clickCount: 18,
    responseCount: 15,
    openRate: 85.7,
    clickRate: 64.3,
    responseRate: 53.6,
    avgTimeToOpen: 2.1,
    lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getTemplatePerformance(templateId?: string): TemplatePerformance[] {
  if (templateId) {
    return mockTemplatePerformance.filter(p => p.templateId === templateId);
  }
  return mockTemplatePerformance;
}

export function getTopPerformingTemplates(limit: number = 5): TemplatePerformance[] {
  return [...mockTemplatePerformance]
    .sort((a, b) => b.openRate - a.openRate)
    .slice(0, limit);
}
