import type { PerformanceGoal, PerformanceReviewTemplate, PerformanceReview, Feedback360, ReviewSchedule, OneOnOneMeeting, MeetingAgendaTemplate, CalibrationSession } from '@/shared/types/performance';
import { mockPerformanceGoals, mockReviewTemplates, mockPerformanceReviews, mockFeedback360, mockReviewSchedules, mockCompanyOKRs, mockTeamObjectives } from '@/shared/data/mockPerformanceData';
import { mockOneOnOneMeetings, mockMeetingTemplates } from '@/shared/data/mockMeetingData';


// Export OKR data
export { mockCompanyOKRs, mockTeamObjectives };

const GOALS_KEY = 'hrms_performance_goals';


const TEMPLATES_KEY = 'hrms_review_templates';
const REVIEWS_KEY = 'hrms_performance_reviews';
const FEEDBACK_360_KEY = 'hrms_feedback_360';
const SCHEDULES_KEY = 'hrms_review_schedules';
const MEETINGS_KEY = 'hrms_one_on_one_meetings';
const MEETING_TEMPLATES_KEY = 'hrms_meeting_templates';

// Performance Goals
export function getPerformanceGoals(employeeId?: string, status?: string): PerformanceGoal[] {
  const stored = localStorage.getItem(GOALS_KEY);
  let goals = stored ? JSON.parse(stored) : mockPerformanceGoals;

  if (employeeId) {
    goals = goals.filter((g: PerformanceGoal) => g.employeeId === employeeId);
  }

  if (status) {
    goals = goals.filter((g: PerformanceGoal) => g.status === status);
  }

  return goals.sort((a: PerformanceGoal, b: PerformanceGoal) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getGoalById(id: string): PerformanceGoal | undefined {
  return getPerformanceGoals().find(g => g.id === id);
}

export function savePerformanceGoal(goal: PerformanceGoal): void {
  const goals = getPerformanceGoals();
  const index = goals.findIndex(g => g.id === goal.id);

  if (index >= 0) {
    goals[index] = { ...goal, updatedAt: new Date().toISOString() };
  } else {
    goals.push({
      ...goal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function deletePerformanceGoal(id: string): void {
  const goals = getPerformanceGoals().filter(g => g.id !== id);
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// Review Templates
export function getReviewTemplates(): PerformanceReviewTemplate[] {
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : mockReviewTemplates;
}

export function getTemplateById(id: string): PerformanceReviewTemplate | undefined {
  return getReviewTemplates().find(t => t.id === id);
}

export function saveReviewTemplate(template: PerformanceReviewTemplate): void {
  const templates = getReviewTemplates();
  const index = templates.findIndex(t => t.id === template.id);

  if (index >= 0) {
    templates[index] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push({
      ...template,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// Performance Reviews
export function getPerformanceReviews(filters?: {
  employeeId?: string;
  reviewerId?: string;
  status?: string;
}): PerformanceReview[] {
  const stored = localStorage.getItem(REVIEWS_KEY);
  let reviews = stored ? JSON.parse(stored) : mockPerformanceReviews;

  if (filters?.employeeId) {
    reviews = reviews.filter((r: PerformanceReview) => r.employeeId === filters.employeeId);
  }

  if (filters?.reviewerId) {
    reviews = reviews.filter((r: PerformanceReview) => r.reviewerId === filters.reviewerId);
  }

  if (filters?.status) {
    reviews = reviews.filter((r: PerformanceReview) => r.status === filters.status);
  }

  return reviews.sort((a: PerformanceReview, b: PerformanceReview) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReviewById(id: string): PerformanceReview | undefined {
  return getPerformanceReviews().find(r => r.id === id);
}

export function savePerformanceReview(review: PerformanceReview): void {
  const reviews = getPerformanceReviews();
  const index = reviews.findIndex(r => r.id === review.id);

  if (index >= 0) {
    reviews[index] = { ...review, updatedAt: new Date().toISOString() };
  } else {
    reviews.push({
      ...review,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

// 360 Feedback
export function getFeedback360(employeeId?: string): Feedback360[] {
  const stored = localStorage.getItem(FEEDBACK_360_KEY);
  let feedback = stored ? JSON.parse(stored) : mockFeedback360;

  if (employeeId) {
    feedback = feedback.filter((f: Feedback360) => f.employeeId === employeeId);
  }

  return feedback.sort((a: Feedback360, b: Feedback360) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveFeedback360(feedback: Feedback360): void {
  const allFeedback = getFeedback360();
  const index = allFeedback.findIndex(f => f.id === feedback.id);

  if (index >= 0) {
    allFeedback[index] = feedback;
  } else {
    allFeedback.push({
      ...feedback,
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(FEEDBACK_360_KEY, JSON.stringify(allFeedback));
}

// Review Schedules
export function getReviewSchedules(): ReviewSchedule[] {
  const stored = localStorage.getItem(SCHEDULES_KEY);
  return stored ? JSON.parse(stored) : mockReviewSchedules;
}

export function saveReviewSchedule(schedule: ReviewSchedule): void {
  const schedules = getReviewSchedules();
  const index = schedules.findIndex(s => s.id === schedule.id);

  if (index >= 0) {
    schedules[index] = { ...schedule, updatedAt: new Date().toISOString() };
  } else {
    schedules.push({
      ...schedule,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(SCHEDULES_KEY, JSON.stringify(schedules));
}

// One-on-One Meetings
export function getOneOnOneMeetings(filters?: {
  employeeId?: string;
  managerId?: string;
  status?: string;
}): OneOnOneMeeting[] {
  const stored = localStorage.getItem(MEETINGS_KEY);
  let meetings = stored ? JSON.parse(stored) : mockOneOnOneMeetings;

  if (filters?.employeeId) {
    meetings = meetings.filter((m: OneOnOneMeeting) => m.employeeId === filters.employeeId);
  }

  if (filters?.managerId) {
    meetings = meetings.filter((m: OneOnOneMeeting) => m.managerId === filters.managerId);
  }

  if (filters?.status) {
    meetings = meetings.filter((m: OneOnOneMeeting) => m.status === filters.status);
  }

  return meetings.sort((a: OneOnOneMeeting, b: OneOnOneMeeting) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  );
}

export function getMeetingById(id: string): OneOnOneMeeting | undefined {
  const meetings = getOneOnOneMeetings();
  return meetings.find(meeting => meeting.id === id);
}

export function saveOneOnOneMeeting(meeting: OneOnOneMeeting): void {
  const meetings = getOneOnOneMeetings();
  const index = meetings.findIndex(m => m.id === meeting.id);

  if (index >= 0) {
    meetings[index] = { ...meeting, updatedAt: new Date().toISOString() };
  } else {
    meetings.push(meeting);
  }

  localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
}

export function deleteOneOnOneMeeting(id: string): void {
  const meetings = getOneOnOneMeetings();
  const filtered = meetings.filter(meeting => meeting.id !== id);
  localStorage.setItem(MEETINGS_KEY, JSON.stringify(filtered));
}

// Meeting Templates
export function getMeetingTemplates(): MeetingAgendaTemplate[] {
  const stored = localStorage.getItem(MEETING_TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : mockMeetingTemplates;
}

export function getMeetingTemplateById(id: string): MeetingAgendaTemplate | undefined {
  const templates = getMeetingTemplates();
  return templates.find(template => template.id === id);
}

export function saveMeetingTemplate(template: MeetingAgendaTemplate): void {
  const templates = getMeetingTemplates();
  const index = templates.findIndex(t => t.id === template.id);

  if (index >= 0) {
    templates[index] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push(template);
  }

  localStorage.setItem(MEETING_TEMPLATES_KEY, JSON.stringify(templates));
}

// Calibration Sessions
const CALIBRATION_KEY = 'hrms_calibration_sessions';

export function getCalibrationSessions(): CalibrationSession[] {
  const stored = localStorage.getItem(CALIBRATION_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getCalibrationSessionById(id: string): CalibrationSession | undefined {
  const sessions = getCalibrationSessions();
  return sessions.find(session => session.id === id);
}

export function saveCalibrationSession(session: CalibrationSession): void {
  const sessions = getCalibrationSessions();
  const index = sessions.findIndex(s => s.id === session.id);

  if (index >= 0) {
    sessions[index] = { ...session, updatedAt: new Date().toISOString() };
  } else {
    sessions.push(session);
  }

  localStorage.setItem(CALIBRATION_KEY, JSON.stringify(sessions));
}

export function updateCalibrationSession(id: string, updates: Partial<CalibrationSession>): void {
  const sessions = getCalibrationSessions();
  const index = sessions.findIndex(s => s.id === id);

  if (index >= 0) {
    sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(sessions));
  }
}

export function deleteCalibrationSession(id: string): void {
  const sessions = getCalibrationSessions().filter(s => s.id !== id);
  localStorage.setItem(CALIBRATION_KEY, JSON.stringify(sessions));
}

// Skills Assessments
const SKILLS_ASSESSMENTS_KEY = 'hrms_skills_assessments';

export function getSkillsAssessments(employeeId?: string): any[] {
  const stored = localStorage.getItem(SKILLS_ASSESSMENTS_KEY);
  let assessments = stored ? JSON.parse(stored) : [];

  if (employeeId) {
    assessments = assessments.filter((a: any) => a.employeeId === employeeId);
  }

  return assessments.sort((a: any, b: any) =>
    new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
  );
}

export function saveSkillsAssessment(assessment: any): void {
  const assessments = getSkillsAssessments();
  const index = assessments.findIndex(a => a.id === assessment.id);

  if (index >= 0) {
    assessments[index] = { ...assessment, updatedAt: new Date().toISOString() };
  } else {
    assessments.push(assessment);
  }

  localStorage.setItem(SKILLS_ASSESSMENTS_KEY, JSON.stringify(assessments));
}

export function updateSkillsAssessment(id: string, updates: any): void {
  const assessments = getSkillsAssessments();
  const index = assessments.findIndex(a => a.id === id);

  if (index >= 0) {
    assessments[index] = { ...assessments[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(SKILLS_ASSESSMENTS_KEY, JSON.stringify(assessments));
  }
}

// Performance Improvement Plans
const PIPS_KEY = 'hrms_performance_improvement_plans';

export function getPIPs(employeeId?: string): any[] {
  const stored = localStorage.getItem(PIPS_KEY);
  let pips = stored ? JSON.parse(stored) : [];

  if (employeeId) {
    pips = pips.filter((p: any) => p.employeeId === employeeId);
  }

  return pips.sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function savePIP(pip: any): void {
  const pips = getPIPs();
  const index = pips.findIndex(p => p.id === pip.id);

  if (index >= 0) {
    pips[index] = { ...pip, updatedAt: new Date().toISOString() };
  } else {
    pips.push(pip);
  }

  localStorage.setItem(PIPS_KEY, JSON.stringify(pips));
}

export function updatePIP(id: string, updates: any): void {
  const pips = getPIPs();
  const index = pips.findIndex(p => p.id === id);

  if (index >= 0) {
    pips[index] = { ...pips[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(PIPS_KEY, JSON.stringify(pips));
  }
}

// Succession Planning
const SUCCESSION_PLANS_KEY = 'hrms_succession_plans';

export function getSuccessionPlans(department?: string): any[] {
  const stored = localStorage.getItem(SUCCESSION_PLANS_KEY);
  let plans = stored ? JSON.parse(stored) : [];

  if (department && department !== 'all') {
    plans = plans.filter((p: any) => p.department === department);
  }

  return plans.sort((a: any, b: any) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function saveSuccessionPlan(plan: any): void {
  const plans = getSuccessionPlans();
  const index = plans.findIndex(p => p.id === plan.id);

  if (index >= 0) {
    plans[index] = { ...plan, updatedAt: new Date().toISOString() };
  } else {
    plans.push(plan);
  }

  localStorage.setItem(SUCCESSION_PLANS_KEY, JSON.stringify(plans));
}

export function updateSuccessionPlan(id: string, updates: any): void {
  const plans = getSuccessionPlans();
  const index = plans.findIndex(p => p.id === id);

  if (index >= 0) {
    plans[index] = { ...plans[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(SUCCESSION_PLANS_KEY, JSON.stringify(plans));
  }
}

// Legacy functions for consultants module
export function getPerformanceBreakdown(_consultantId: string) {
  return [];
}

export function getMonthlyPlacementTrends(_consultantId: string, _year: number) {
  return [];
}

export function getMonthlyRevenueTrends(_consultantId: string, _year: number) {
  return [];
}

