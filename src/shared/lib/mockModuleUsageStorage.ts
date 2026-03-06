import { ModuleName } from './moduleAccessControl';

export interface ModuleUsageMetric {
  id: string;
  employerId: string;
  moduleName: ModuleName;
  date: Date;
  activeUsers: number;
  totalSessions: number;
  avgSessionDuration: number; // minutes
  featuresUsed: string[];
  conversionActions: number;
}

export interface ModuleRecommendation {
  id: string;
  employerId: string;
  recommendedModule: ModuleName;
  confidence: number; // 0-1
  reasoning: string[];
  estimatedROI: number;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

const STORAGE_KEY_USAGE = 'hrm8_module_usage';
const STORAGE_KEY_RECOMMENDATIONS = 'hrm8_module_recommendations';

function generateMockUsage(): ModuleUsageMetric[] {
  const metrics: ModuleUsageMetric[] = [];
  const employerIds = ['1', '2', '3', '4', '5'];
  const modules: ModuleName[] = [
    'ats.candidates', 'ats.jobs', 'ats.interviews', 
    'hrms.employees', 'hrms.attendance', 'hrms.payroll'
  ];
  
  // Generate 90 days of usage data
  for (let day = 90; day >= 0; day--) {
    employerIds.forEach(employerId => {
      modules.forEach(module => {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        // Skip some days randomly to simulate realistic usage
        if (Math.random() > 0.3) {
          metrics.push({
            id: `usage-${employerId}-${module}-${day}`,
            employerId,
            moduleName: module,
            date,
            activeUsers: Math.floor(Math.random() * 10) + 1,
            totalSessions: Math.floor(Math.random() * 50) + 10,
            avgSessionDuration: Math.floor(Math.random() * 30) + 5,
            featuresUsed: generateRandomFeatures(module),
            conversionActions: Math.floor(Math.random() * 10)
          });
        }
      });
    });
  }
  
  return metrics;
}

function generateRandomFeatures(module: ModuleName): string[] {
  const featureMap: Record<string, string[]> = {
    'ats.candidates': ['search', 'filter', 'view_profile', 'add_note', 'move_stage'],
    'ats.jobs': ['create_job', 'edit_job', 'publish', 'view_applications'],
    'ats.interviews': ['schedule', 'reschedule', 'add_feedback', 'send_reminder'],
    'hrms.employees': ['view_list', 'add_employee', 'edit_profile', 'view_documents'],
    'hrms.attendance': ['clock_in', 'clock_out', 'view_report', 'approve_timesheet'],
    'hrms.payroll': ['process_payroll', 'view_report', 'export_data', 'adjust_salary']
  };
  
  const features = featureMap[module] || [];
  const count = Math.floor(Math.random() * 3) + 1;
  return features.slice(0, count);
}

function generateMockRecommendations(): ModuleRecommendation[] {
  const recommendations: ModuleRecommendation[] = [];
  const employerIds = ['1', '2', '3'];
  
  const recommendationTemplates = [
    {
      module: 'hrms.performance' as ModuleName,
      reasoning: [
        'High employee count detected',
        'Active HR module usage indicates readiness',
        'Seasonal performance review period approaching'
      ],
      confidence: 0.85,
      estimatedROI: 15000,
      priority: 'high' as const
    },
    {
      module: 'ats.ai-screening' as ModuleName,
      reasoning: [
        'Processing over 100 applications per month',
        'Average time-to-hire is above industry average',
        'High screening time detected'
      ],
      confidence: 0.72,
      estimatedROI: 8500,
      priority: 'medium' as const
    },
    {
      module: 'addon.video-interviewing' as ModuleName,
      reasoning: [
        'Multiple remote interview requests',
        'Interview scheduling conflicts detected',
        'Candidates requesting virtual options'
      ],
      confidence: 0.68,
      estimatedROI: 5000,
      priority: 'medium' as const
    }
  ];
  
  employerIds.forEach((employerId, idx) => {
    const template = recommendationTemplates[idx % recommendationTemplates.length];
    recommendations.push({
      id: `rec-${idx + 1}`,
      employerId,
      recommendedModule: template.module,
      confidence: template.confidence,
      reasoning: template.reasoning,
      estimatedROI: template.estimatedROI,
      priority: template.priority,
      createdAt: new Date()
    });
  });
  
  return recommendations;
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY_USAGE)) {
    localStorage.setItem(STORAGE_KEY_USAGE, JSON.stringify(generateMockUsage()));
  }
  if (!localStorage.getItem(STORAGE_KEY_RECOMMENDATIONS)) {
    localStorage.setItem(STORAGE_KEY_RECOMMENDATIONS, JSON.stringify(generateMockRecommendations()));
  }
}

export function getModuleUsage(employerId: string, days: number = 30): ModuleUsageMetric[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY_USAGE);
  if (!data) return [];
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return JSON.parse(data)
    .filter((metric: any) => 
      metric.employerId === employerId && 
      new Date(metric.date) >= cutoffDate
    )
    .map((metric: any) => ({
      ...metric,
      date: new Date(metric.date)
    }));
}

export function getModuleRecommendations(employerId: string): ModuleRecommendation[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY_RECOMMENDATIONS);
  if (!data) return [];
  
  return JSON.parse(data)
    .filter((rec: any) => rec.employerId === employerId)
    .map((rec: any) => ({
      ...rec,
      createdAt: new Date(rec.createdAt)
    }));
}

export function dismissRecommendation(recommendationId: string): void {
  const data = localStorage.getItem(STORAGE_KEY_RECOMMENDATIONS);
  if (!data) return;
  
  const recommendations = JSON.parse(data);
  const filtered = recommendations.filter((rec: any) => rec.id !== recommendationId);
  localStorage.setItem(STORAGE_KEY_RECOMMENDATIONS, JSON.stringify(filtered));
}

export function getModuleAdoptionRate(employerId: string, module: ModuleName, days: number = 7): number {
  const usage = getModuleUsage(employerId, days);
  const moduleUsage = usage.filter(u => u.moduleName === module);
  
  if (moduleUsage.length === 0) return 0;
  
  const totalSessions = moduleUsage.reduce((sum, u) => sum + u.totalSessions, 0);
  return totalSessions / days;
}
