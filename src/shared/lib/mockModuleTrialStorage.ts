export interface ModuleTrial {
  id: string;
  employerId: string;
  moduleName: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'converted' | 'cancelled';
  usageCount: number;
  conversionDate?: Date;
  cancellationReason?: string;
}

const STORAGE_KEY = 'hrm8_module_trials';

function generateMockTrials(): ModuleTrial[] {
  const trials: ModuleTrial[] = [];
  const employerIds = ['1', '2', '3', '4', '5'];
  const modules = ['hrms.payroll', 'hrms.performance', 'ats.ai-screening', 'addon.video-interviewing'];
  
  employerIds.forEach((employerId, idx) => {
    const module = modules[idx % modules.length];
    const startDate = new Date(2024, 11, Math.floor(Math.random() * 15) + 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 14);
    
    const statuses: ModuleTrial['status'][] = ['active', 'active', 'expired', 'converted', 'cancelled'];
    const status = statuses[idx % statuses.length];
    
    trials.push({
      id: `trial-${idx + 1}`,
      employerId,
      moduleName: module,
      startDate,
      endDate,
      status,
      usageCount: Math.floor(Math.random() * 50) + 10,
      conversionDate: status === 'converted' ? new Date(endDate.getTime() + 86400000) : undefined,
      cancellationReason: status === 'cancelled' ? 'Not meeting our needs' : undefined
    });
  });
  
  return trials;
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(generateMockTrials()));
  }
}

export function getModuleTrials(): ModuleTrial[] {
  initializeStorage();
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  return JSON.parse(data).map((trial: any) => ({
    ...trial,
    startDate: new Date(trial.startDate),
    endDate: new Date(trial.endDate),
    conversionDate: trial.conversionDate ? new Date(trial.conversionDate) : undefined
  }));
}

export function getTrialsByEmployer(employerId: string): ModuleTrial[] {
  return getModuleTrials().filter(trial => trial.employerId === employerId);
}

export function getActiveTrials(employerId: string): ModuleTrial[] {
  return getTrialsByEmployer(employerId).filter(trial => trial.status === 'active');
}

export function startTrial(employerId: string, moduleName: string): ModuleTrial {
  const trials = getModuleTrials();
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 14);
  
  const newTrial: ModuleTrial = {
    id: `trial-${Date.now()}`,
    employerId,
    moduleName,
    startDate,
    endDate,
    status: 'active',
    usageCount: 0
  };
  
  trials.push(newTrial);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
  return newTrial;
}

export function updateTrialStatus(
  trialId: string, 
  status: ModuleTrial['status'],
  conversionDate?: Date,
  cancellationReason?: string
): void {
  const trials = getModuleTrials();
  const index = trials.findIndex(t => t.id === trialId);
  if (index !== -1) {
    trials[index].status = status;
    if (conversionDate) trials[index].conversionDate = conversionDate;
    if (cancellationReason) trials[index].cancellationReason = cancellationReason;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
  }
}

export function incrementTrialUsage(trialId: string): void {
  const trials = getModuleTrials();
  const index = trials.findIndex(t => t.id === trialId);
  if (index !== -1) {
    trials[index].usageCount++;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trials));
  }
}
