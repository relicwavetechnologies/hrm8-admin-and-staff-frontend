import { Brain, User, Code, Users, Heart, Building, FileText } from 'lucide-react';
import type { AssessmentType, AssessmentProvider } from '@/shared/types/assessment';
import type { LucideIcon } from 'lucide-react';

export interface AssessmentTypePricing {
  type: AssessmentType;
  name: string;
  description: string;
  providers: AssessmentProvider[];
  cost: number;
  duration: number; // minutes
  icon: LucideIcon;
}

export const ASSESSMENT_PRICING: Record<AssessmentType, AssessmentTypePricing> = {
  'cognitive': {
    type: 'cognitive',
    name: 'Cognitive Ability Test',
    description: 'Measures reasoning, problem-solving, and analytical thinking',
    providers: ['testgorilla', 'criteria', 'shl'],
    cost: 69,
    duration: 30,
    icon: Brain
  },
  'personality': {
    type: 'personality',
    name: 'Personality Assessment',
    description: 'Big-5, DISC, or similar behavioral profiling',
    providers: ['testgorilla', 'criteria', 'harver'],
    cost: 59,
    duration: 20,
    icon: User
  },
  'technical-skills': {
    type: 'technical-skills',
    name: 'Technical Skills Test',
    description: 'Role-specific technical evaluation',
    providers: ['codility', 'vervoe', 'testgorilla'],
    cost: 89,
    duration: 60,
    icon: Code
  },
  'situational-judgment': {
    type: 'situational-judgment',
    name: 'Situational Judgment Test',
    description: 'Evaluates decision-making in work scenarios',
    providers: ['testgorilla', 'harver', 'shl'],
    cost: 65,
    duration: 25,
    icon: Users
  },
  'behavioral': {
    type: 'behavioral',
    name: 'Behavioral Assessment',
    description: 'Analyzes behavioral patterns and work style',
    providers: ['criteria', 'harver', 'testgorilla'],
    cost: 59,
    duration: 20,
    icon: Heart
  },
  'culture-fit': {
    type: 'culture-fit',
    name: 'Culture Fit Assessment',
    description: 'Measures alignment with company values',
    providers: ['testgorilla', 'harver'],
    cost: 55,
    duration: 15,
    icon: Building
  },
  'custom': {
    type: 'custom',
    name: 'Custom Assessment',
    description: 'Employer-created custom assessment',
    providers: ['internal'],
    cost: 49,
    duration: 30,
    icon: FileText
  }
};

export function calculateTotalCost(assessmentTypes: AssessmentType[]): number {
  return assessmentTypes.reduce((total, type) => 
    total + ASSESSMENT_PRICING[type].cost, 0
  );
}

export function getCostBreakdown(assessmentTypes: AssessmentType[]) {
  return assessmentTypes.map(type => ({
    assessmentType: type,
    ...ASSESSMENT_PRICING[type]
  }));
}
