import type { 
  Skill, 
  SkillAssessment, 
  DevelopmentPlan, 
  Certification,
  SkillGap,
  ProficiencyLevel,
  CompetencyProfile
} from '@/shared/types/skills';

const SKILLS_KEY = 'skills';
const ASSESSMENTS_KEY = 'skill_assessments';
const PLANS_KEY = 'development_plans';
const CERTIFICATIONS_KEY = 'certifications';

// Skills Management
export function getAllSkills(): Skill[] {
  const stored = localStorage.getItem(SKILLS_KEY);
  return stored ? JSON.parse(stored) : getDefaultSkills();
}

export function getSkillById(id: string): Skill | undefined {
  return getAllSkills().find(s => s.id === id);
}

export function addSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Skill {
  const all = getAllSkills();
  const newSkill: Skill = {
    ...skill,
    id: `skill_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  all.push(newSkill);
  localStorage.setItem(SKILLS_KEY, JSON.stringify(all));
  return newSkill;
}

// Assessments
export function getAllAssessments(): SkillAssessment[] {
  const stored = localStorage.getItem(ASSESSMENTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantAssessments(consultantId: string): SkillAssessment[] {
  return getAllAssessments()
    .filter(a => a.consultantId === consultantId)
    .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
}

export function getSkillAssessment(consultantId: string, skillId: string): SkillAssessment | undefined {
  return getAllAssessments().find(a => 
    a.consultantId === consultantId && a.skillId === skillId
  );
}

export function addAssessment(
  assessment: Omit<SkillAssessment, 'id' | 'createdAt' | 'updatedAt'>
): SkillAssessment {
  const all = getAllAssessments();
  
  // Remove old assessment for same consultant/skill if exists
  const filtered = all.filter(a => 
    !(a.consultantId === assessment.consultantId && a.skillId === assessment.skillId)
  );
  
  const newAssessment: SkillAssessment = {
    ...assessment,
    id: `assessment_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  filtered.push(newAssessment);
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(filtered));
  return newAssessment;
}

export function updateAssessment(
  id: string,
  updates: Partial<SkillAssessment>
): SkillAssessment | null {
  const all = getAllAssessments();
  const index = all.findIndex(a => a.id === id);
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all));
  return all[index];
}

// Gap Analysis
export function calculateSkillGaps(consultantId: string): SkillGap[] {
  const skills = getAllSkills();
  const assessments = getConsultantAssessments(consultantId);
  const gaps: SkillGap[] = [];
  
  const levelValues: { [key in ProficiencyLevel]: number } = {
    'none': 0,
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
  };
  
  skills.forEach(skill => {
    if (!skill.requiredLevel) return;
    
    const assessment = assessments.find(a => a.skillId === skill.id);
    const currentLevel = assessment?.currentLevel || 'none';
    const currentValue = levelValues[currentLevel];
    const requiredValue = levelValues[skill.requiredLevel];
    
    if (currentValue < requiredValue) {
      const gap = requiredValue - currentValue;
      gaps.push({
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        currentLevel,
        requiredLevel: skill.requiredLevel,
        gap,
        priority: gap >= 3 ? 'critical' : gap >= 2 ? 'high' : gap >= 1 ? 'medium' : 'low',
        impactOnRole: skill.isCore ? 'Core skill for role' : 'Supporting skill',
        suggestedActions: getSuggestedActions(skill.name, currentLevel, skill.requiredLevel),
      });
    }
  });
  
  return gaps.sort((a, b) => b.gap - a.gap);
}

function getSuggestedActions(skillName: string, current: ProficiencyLevel, target: ProficiencyLevel): string[] {
  const actions = [
    `Complete ${skillName} training course`,
    `Work on project requiring ${skillName}`,
    `Find mentor with ${skillName} expertise`,
  ];
  
  if (current === 'none' || current === 'beginner') {
    actions.push('Complete foundational certification');
  }
  
  if (target === 'expert' || target === 'advanced') {
    actions.push('Lead ${skillName} initiative');
    actions.push('Mentor others in ${skillName}');
  }
  
  return actions;
}

// Development Plans
export function getAllPlans(): DevelopmentPlan[] {
  const stored = localStorage.getItem(PLANS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantPlans(consultantId: string): DevelopmentPlan[] {
  return getAllPlans()
    .filter(p => p.consultantId === consultantId)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function addPlan(
  plan: Omit<DevelopmentPlan, 'id' | 'createdAt' | 'updatedAt' | 'completionPercentage'>
): DevelopmentPlan {
  const all = getAllPlans();
  
  const newPlan: DevelopmentPlan = {
    ...plan,
    id: `plan_${Date.now()}`,
    completionPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  all.push(newPlan);
  localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  return newPlan;
}

export function updatePlan(
  id: string,
  updates: Partial<DevelopmentPlan>
): DevelopmentPlan | null {
  const all = getAllPlans();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  const plan = { ...all[index], ...updates };
  
  // Recalculate completion percentage
  if (plan.actions.length > 0) {
    const completed = plan.actions.filter(a => a.status === 'completed').length;
    plan.completionPercentage = Math.round((completed / plan.actions.length) * 100);
  }
  
  plan.updatedAt = new Date().toISOString();
  all[index] = plan;
  
  localStorage.setItem(PLANS_KEY, JSON.stringify(all));
  return all[index];
}

// Certifications
export function getAllCertifications(): Certification[] {
  const stored = localStorage.getItem(CERTIFICATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getConsultantCertifications(consultantId: string): Certification[] {
  return getAllCertifications()
    .filter(c => c.consultantId === consultantId)
    .sort((a, b) => {
      if (!a.issueDate) return 1;
      if (!b.issueDate) return -1;
      return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
    });
}

export function addCertification(
  cert: Omit<Certification, 'id' | 'createdAt' | 'updatedAt' | 'expiryNotificationSent' | 'renewalReminderSent'>
): Certification {
  const all = getAllCertifications();
  
  const newCert: Certification = {
    ...cert,
    id: `cert_${Date.now()}`,
    expiryNotificationSent: false,
    renewalReminderSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  all.push(newCert);
  localStorage.setItem(CERTIFICATIONS_KEY, JSON.stringify(all));
  return newCert;
}

export function updateCertification(
  id: string,
  updates: Partial<Certification>
): Certification | null {
  const all = getAllCertifications();
  const index = all.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  all[index] = {
    ...all[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(CERTIFICATIONS_KEY, JSON.stringify(all));
  return all[index];
}

export function getExpiringCertifications(consultantId: string, daysThreshold: number = 90): Certification[] {
  const certs = getConsultantCertifications(consultantId);
  const threshold = new Date();
  threshold.setDate(threshold.getDate() + daysThreshold);
  
  return certs.filter(c => 
    c.status === 'active' && 
    c.expiryDate && 
    new Date(c.expiryDate) <= threshold
  );
}

// Competency Profile
export function getCompetencyProfile(consultantId: string): CompetencyProfile {
  const skills = getAllSkills();
  const assessments = getConsultantAssessments(consultantId);
  const plans = getConsultantPlans(consultantId);
  const certs = getConsultantCertifications(consultantId);
  const gaps = calculateSkillGaps(consultantId);
  
  const skillsByCategory: CompetencyProfile['skillsByCategory'] = {};
  
  skills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = { total: 0, assessed: 0, averageLevel: 0 };
    }
    skillsByCategory[skill.category].total++;
    
    const assessment = assessments.find(a => a.skillId === skill.id);
    if (assessment) {
      skillsByCategory[skill.category].assessed++;
    }
  });
  
  const consultant = assessments[0];
  
  return {
    consultantId,
    consultantName: consultant?.consultantId || 'Consultant',
    totalSkills: skills.length,
    assessedSkills: assessments.length,
    skillCompletionRate: skills.length > 0 ? Math.round((assessments.length / skills.length) * 100) : 0,
    skillsByCategory,
    criticalGaps: gaps.filter(g => g.priority === 'critical').length,
    highPriorityGaps: gaps.filter(g => g.priority === 'high').length,
    activeDevelopmentPlans: plans.filter(p => p.status === 'active').length,
    activeCertifications: certs.filter(c => c.status === 'active').length,
    expiringCertifications: getExpiringCertifications(consultantId).length,
    lastAssessmentDate: assessments[0]?.assessmentDate,
    nextReviewDate: assessments[0]?.nextReviewDate,
  };
}

// Default Skills
function getDefaultSkills(): Skill[] {
  const skills: Skill[] = [
    {
      id: 'skill_1',
      name: 'JavaScript',
      description: 'Modern JavaScript programming',
      category: 'technical',
      isCore: true,
      requiredLevel: 'advanced',
      tags: ['programming', 'frontend', 'backend'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'skill_2',
      name: 'React',
      description: 'React framework and ecosystem',
      category: 'technical',
      isCore: true,
      requiredLevel: 'advanced',
      tags: ['frontend', 'ui', 'framework'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'skill_3',
      name: 'Communication',
      description: 'Effective verbal and written communication',
      category: 'soft-skills',
      isCore: true,
      requiredLevel: 'advanced',
      tags: ['communication', 'collaboration'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'skill_4',
      name: 'Leadership',
      description: 'Team leadership and mentoring',
      category: 'leadership',
      isCore: false,
      requiredLevel: 'intermediate',
      tags: ['leadership', 'management'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'skill_5',
      name: 'Project Management',
      description: 'Planning and executing projects',
      category: 'soft-skills',
      isCore: true,
      requiredLevel: 'intermediate',
      tags: ['management', 'planning'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  
  localStorage.setItem(SKILLS_KEY, JSON.stringify(skills));
  return skills;
}
