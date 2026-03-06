import type {
  OnboardingWorkflow,
  OnboardingChecklistItem,
  OnboardingDocument,
  TrainingModule,
  OnboardingTemplate,

} from '@/shared/types/onboarding';

const ONBOARDING_KEY = 'onboarding_workflows';
const TEMPLATES_KEY = 'onboarding_templates';

// Workflow Management
export function getAllWorkflows(): OnboardingWorkflow[] {
  const stored = localStorage.getItem(ONBOARDING_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getWorkflowById(id: string): OnboardingWorkflow | undefined {
  return getAllWorkflows().find(w => w.id === id);
}

export function getConsultantWorkflow(consultantId: string): OnboardingWorkflow | undefined {
  return getAllWorkflows().find(w => w.consultantId === consultantId);
}

export function createWorkflow(
  workflow: Omit<OnboardingWorkflow, 'id' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'checklistProgress' | 'documentProgress' | 'trainingProgress'>
): OnboardingWorkflow {
  const all = getAllWorkflows();

  const newWorkflow: OnboardingWorkflow = {
    ...workflow,
    id: `onboarding_${Date.now()}`,
    overallProgress: 0,
    checklistProgress: 0,
    documentProgress: 0,
    trainingProgress: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  all.push(newWorkflow);
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all));

  return newWorkflow;
}

function calculateProgress(workflow: OnboardingWorkflow): OnboardingWorkflow {
  const checklistTotal = workflow.checklist.filter(item => item.isRequired).length;
  const checklistCompleted = workflow.checklist.filter(item =>
    item.isRequired && item.status === 'completed'
  ).length;

  const documentTotal = workflow.documents.filter(doc => doc.isRequired).length;
  const documentCompleted = workflow.documents.filter(doc =>
    doc.isRequired && doc.status === 'approved'
  ).length;

  const trainingTotal = workflow.training.filter(t => t.isRequired).length;
  const trainingCompleted = workflow.training.filter(t =>
    t.isRequired && t.status === 'completed'
  ).length;

  const checklistProgress = checklistTotal > 0 ? (checklistCompleted / checklistTotal) * 100 : 100;
  const documentProgress = documentTotal > 0 ? (documentCompleted / documentTotal) * 100 : 100;
  const trainingProgress = trainingTotal > 0 ? (trainingCompleted / trainingTotal) * 100 : 100;

  const overallProgress = (checklistProgress + documentProgress + trainingProgress) / 3;

  return {
    ...workflow,
    checklistProgress: Math.round(checklistProgress),
    documentProgress: Math.round(documentProgress),
    trainingProgress: Math.round(trainingProgress),
    overallProgress: Math.round(overallProgress),
    status: overallProgress === 100 ? 'completed' :
      overallProgress > 0 ? 'in-progress' : 'not-started',
    updatedAt: new Date().toISOString(),
    lastActivityDate: new Date().toISOString(),
  };
}

export function updateWorkflow(
  id: string,
  updates: Partial<OnboardingWorkflow>
): OnboardingWorkflow | null {
  const all = getAllWorkflows();
  const index = all.findIndex(w => w.id === id);

  if (index === -1) return null;

  all[index] = calculateProgress({
    ...all[index],
    ...updates,
  });

  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(all));
  return all[index];
}

// Checklist Management
export function updateChecklistItem(
  workflowId: string,
  itemId: string,
  updates: Partial<OnboardingChecklistItem>
): OnboardingWorkflow | null {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return null;

  const checklist = workflow.checklist.map(item =>
    item.id === itemId ? { ...item, ...updates } : item
  );

  return updateWorkflow(workflowId, { checklist });
}

export function completeChecklistItem(
  workflowId: string,
  itemId: string,
  completedBy: string
): OnboardingWorkflow | null {
  return updateChecklistItem(workflowId, itemId, {
    status: 'completed',
    completedDate: new Date().toISOString(),
    completedBy,
  });
}

// Document Management
export function updateDocument(
  workflowId: string,
  documentId: string,
  updates: Partial<OnboardingDocument>
): OnboardingWorkflow | null {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return null;

  const documents = workflow.documents.map(doc =>
    doc.id === documentId ? { ...doc, ...updates } : doc
  );

  return updateWorkflow(workflowId, { documents });
}

export function submitDocument(
  workflowId: string,
  documentId: string,
  fileUrl: string,
  fileName: string
): OnboardingWorkflow | null {
  return updateDocument(workflowId, documentId, {
    status: 'submitted',
    fileUrl,
    fileName,
    uploadedDate: new Date().toISOString(),
  });
}

export function reviewDocument(
  workflowId: string,
  documentId: string,
  status: 'approved' | 'rejected' | 'revision-required',
  reviewedBy: string,
  reviewNotes?: string
): OnboardingWorkflow | null {
  return updateDocument(workflowId, documentId, {
    status,
    reviewedBy,
    reviewedDate: new Date().toISOString(),
    reviewNotes,
  });
}

// Training Management
export function updateTraining(
  workflowId: string,
  trainingId: string,
  updates: Partial<TrainingModule>
): OnboardingWorkflow | null {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return null;

  const training = workflow.training.map(t =>
    t.id === trainingId ? { ...t, ...updates } : t
  );

  return updateWorkflow(workflowId, { training });
}

export function startTraining(
  workflowId: string,
  trainingId: string
): OnboardingWorkflow | null {
  return updateTraining(workflowId, trainingId, {
    status: 'in-progress',
    startedDate: new Date().toISOString(),
  });
}

export function completeTraining(
  workflowId: string,
  trainingId: string,
  score: number
): OnboardingWorkflow | null {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return null;

  const training = workflow.training.find(t => t.id === trainingId);
  if (!training) return null;

  const passed = score >= training.passingScore;
  const newAttempts = training.attempts + 1;

  return updateTraining(workflowId, trainingId, {
    status: passed ? 'completed' : newAttempts >= training.maxAttempts ? 'failed' : 'in-progress',
    completedDate: passed ? new Date().toISOString() : undefined,
    score,
    attempts: newAttempts,
  });
}

// Templates
export function getAllTemplates(): OnboardingTemplate[] {
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : getDefaultTemplates();
}

export function getTemplateById(id: string): OnboardingTemplate | undefined {
  return getAllTemplates().find(t => t.id === id);
}

export function createWorkflowFromTemplate(
  templateId: string,
  consultantId: string,
  consultantName: string,
  startDate: string,
  createdBy: string
): OnboardingWorkflow | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  const targetDate = new Date(startDate);
  targetDate.setDate(targetDate.getDate() + template.defaultDuration);

  return createWorkflow({
    consultantId,
    consultantName,
    consultantType: template.consultantType,
    status: 'not-started',
    startDate,
    targetCompletionDate: targetDate.toISOString(),
    checklist: template.checklistItems.map((item, index) => ({
      ...item,
      id: `checklist_${Date.now()}_${index}`,
      status: 'pending',
    })),
    documents: template.documents.map((doc, index) => ({
      ...doc,
      id: `document_${Date.now()}_${index}`,
      status: 'not-submitted',
    })),
    training: template.training.map((t, index) => ({
      ...t,
      id: `training_${Date.now()}_${index}`,
      status: 'not-started',
      attempts: 0,
    })),
    welcomeMessageSent: false,
    createdBy,
  });
}

function getDefaultTemplates(): OnboardingTemplate[] {
  const employeeTemplate: OnboardingTemplate = {
    id: 'template_employee',
    name: 'Full-Time Employee Onboarding',
    description: 'Complete onboarding for direct employees',
    consultantType: 'employee',
    defaultDuration: 30,
    checklistItems: [
      {
        title: 'Send Welcome Email',
        description: 'Send personalized welcome email with first day details',
        priority: 'high',
        category: 'hr',
        order: 1,
        isRequired: true,
        applicableFor: ['employee', 'contractor'],
      },
      {
        title: 'Setup Workstation',
        description: 'Prepare desk, computer, and necessary equipment',
        priority: 'high',
        category: 'it',
        order: 2,
        isRequired: true,
        applicableFor: ['employee'],
      },
      {
        title: 'Create IT Accounts',
        description: 'Setup email, Slack, and system access',
        priority: 'high',
        category: 'it',
        order: 3,
        isRequired: true,
        applicableFor: ['employee', 'contractor'],
      },
      {
        title: 'First Day Orientation',
        description: 'Conduct office tour and team introductions',
        priority: 'high',
        category: 'hr',
        order: 4,
        isRequired: true,
        applicableFor: ['employee'],
      },
      {
        title: 'Benefits Enrollment',
        description: 'Complete health insurance and 401k setup',
        priority: 'high',
        category: 'hr',
        order: 5,
        isRequired: true,
        applicableFor: ['employee'],
      },
    ],
    documents: [
      {
        name: 'Employment Contract',
        description: 'Signed employment agreement',
        category: 'contract',
        isRequired: true,
        applicableFor: ['employee'],
      },
      {
        name: 'W-4 Tax Form',
        description: 'Federal tax withholding form',
        category: 'tax',
        isRequired: true,
        applicableFor: ['employee'],
      },
      {
        name: 'I-9 Verification',
        description: 'Employment eligibility verification',
        category: 'identity',
        isRequired: true,
        applicableFor: ['employee'],
      },
      {
        name: 'Direct Deposit Form',
        description: 'Banking information for payroll',
        category: 'banking',
        isRequired: true,
        applicableFor: ['employee'],
      },
    ],
    training: [
      {
        title: 'Company Overview',
        description: 'Learn about company history, mission, and values',
        category: 'hr-policy',
        duration: 30,
        passingScore: 80,
        maxAttempts: 3,
        isRequired: true,
        applicableFor: ['employee', 'contractor'],
        order: 1,
      },
      {
        title: 'HR Policies & Procedures',
        description: 'Understand workplace policies and guidelines',
        category: 'hr-policy',
        duration: 45,
        passingScore: 80,
        maxAttempts: 3,
        isRequired: true,
        applicableFor: ['employee'],
        order: 2,
      },
      {
        title: 'Workplace Safety',
        description: 'Safety protocols and emergency procedures',
        category: 'safety',
        duration: 20,
        passingScore: 100,
        maxAttempts: 5,
        isRequired: true,
        applicableFor: ['employee', 'contractor'],
        order: 3,
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const contractorTemplate: OnboardingTemplate = {
    id: 'template_contractor',
    name: 'Contractor Onboarding',
    description: 'Streamlined onboarding for contractors',
    consultantType: 'contractor',
    defaultDuration: 14,
    checklistItems: [
      {
        title: 'Send Welcome Email',
        description: 'Send welcome email with project details',
        priority: 'high',
        category: 'hr',
        order: 1,
        isRequired: true,
        applicableFor: ['contractor'],
      },
      {
        title: 'Create System Access',
        description: 'Setup necessary system and tool access',
        priority: 'high',
        category: 'it',
        order: 2,
        isRequired: true,
        applicableFor: ['contractor'],
      },
      {
        title: 'Project Briefing',
        description: 'Introduce to project scope and expectations',
        priority: 'high',
        category: 'admin',
        order: 3,
        isRequired: true,
        applicableFor: ['contractor'],
      },
    ],
    documents: [
      {
        name: 'Contractor Agreement',
        description: 'Signed independent contractor agreement',
        category: 'contract',
        isRequired: true,
        applicableFor: ['contractor'],
      },
      {
        name: 'W-9 Form',
        description: 'Taxpayer identification form',
        category: 'tax',
        isRequired: true,
        applicableFor: ['contractor'],
      },
      {
        name: 'NDA',
        description: 'Non-disclosure agreement',
        category: 'compliance',
        isRequired: true,
        applicableFor: ['contractor'],
      },
    ],
    training: [
      {
        title: 'Company Overview',
        description: 'Brief introduction to company and culture',
        category: 'hr-policy',
        duration: 20,
        passingScore: 80,
        maxAttempts: 3,
        isRequired: true,
        applicableFor: ['contractor'],
        order: 1,
      },
      {
        title: 'Security & Compliance',
        description: 'Data security and compliance requirements',
        category: 'compliance',
        duration: 30,
        passingScore: 90,
        maxAttempts: 3,
        isRequired: true,
        applicableFor: ['contractor'],
        order: 2,
      },
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const templates = [employeeTemplate, contractorTemplate];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  return templates;
}

// Statistics
export function getOnboardingStats() {
  const workflows = getAllWorkflows();

  return {
    total: workflows.length,
    active: workflows.filter(w => w.status === 'in-progress').length,
    completed: workflows.filter(w => w.status === 'completed').length,
    overdue: workflows.filter(w => {
      if (w.status === 'completed') return false;
      return new Date(w.targetCompletionDate) < new Date();
    }).length,
    employees: workflows.filter(w => w.consultantType === 'employee').length,
    contractors: workflows.filter(w => w.consultantType === 'contractor').length,
    avgProgress: workflows.length > 0
      ? Math.round(workflows.reduce((sum, w) => sum + w.overallProgress, 0) / workflows.length)
      : 0,
  };
}
