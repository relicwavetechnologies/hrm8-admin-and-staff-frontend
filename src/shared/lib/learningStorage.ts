import type { Course, TrainingPath, CourseEnrollment, EmployeeCertification, SkillDevelopmentProgram, LearningAnalytics } from '@/shared/types/performance';
import { mockCourses, mockTrainingPaths, mockCourseEnrollments, mockEmployeeCertifications, mockSkillDevelopmentPrograms, mockLearningAnalytics } from '@/shared/data/mockLearningData';

const COURSES_KEY = 'courses';
const COURSE_ENROLLMENTS_KEY = 'courseEnrollments';
const LEARNING_ANALYTICS_KEY = 'learningAnalytics';

export function getCourses(): Course[] {
  const stored = localStorage.getItem(COURSES_KEY);
  return stored ? JSON.parse(stored) : mockCourses;
}

export function getTrainingPaths(): TrainingPath[] {
  return mockTrainingPaths;
}

export function getCourseEnrollments(employeeId?: string): CourseEnrollment[] {
  const stored = localStorage.getItem(COURSE_ENROLLMENTS_KEY);
  const enrollments = stored ? JSON.parse(stored) : mockCourseEnrollments;
  return employeeId ? enrollments.filter((e: CourseEnrollment) => e.employeeId === employeeId) : enrollments;
}

export function getEmployeeCertifications(employeeId?: string): EmployeeCertification[] {
  const certs = mockEmployeeCertifications;
  return employeeId ? certs.filter(c => c.employeeId === employeeId) : certs;
}

export function getSkillDevelopmentPrograms(employeeId?: string): SkillDevelopmentProgram[] {
  const programs = mockSkillDevelopmentPrograms;
  return employeeId ? programs.filter(p => p.employeeId === employeeId) : programs;
}

export function getLearningAnalytics(employeeId: string): LearningAnalytics | undefined {
  const stored = localStorage.getItem(LEARNING_ANALYTICS_KEY);
  const analytics = stored ? JSON.parse(stored) : mockLearningAnalytics;
  return analytics.find((a: LearningAnalytics) => a.employeeId === employeeId);
}
