import type { SalaryBand, CompensationReview, BonusPlan, EquityGrant, CompensationStats } from '@/shared/types/compensation';
import { mockSalaryBands, mockCompensationReviews } from '@/shared/data/mockCompensationData';

const BANDS_KEY = 'salary_bands';
const REVIEWS_KEY = 'compensation_reviews';
const BONUSES_KEY = 'bonus_plans';
const EQUITY_KEY = 'equity_grants';

function initializeData() {
  if (!localStorage.getItem(BANDS_KEY)) {
    localStorage.setItem(BANDS_KEY, JSON.stringify(mockSalaryBands));
  }
  if (!localStorage.getItem(REVIEWS_KEY)) {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(mockCompensationReviews));
  }
}

export function getSalaryBands(): SalaryBand[] {
  initializeData();
  const stored = localStorage.getItem(BANDS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSalaryBand(band: Omit<SalaryBand, 'id' | 'createdAt' | 'updatedAt'>): SalaryBand {
  const bands = getSalaryBands();
  const newBand: SalaryBand = {
    ...band,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  bands.push(newBand);
  localStorage.setItem(BANDS_KEY, JSON.stringify(bands));
  return newBand;
}

export function getCompensationReviews(): CompensationReview[] {
  initializeData();
  const stored = localStorage.getItem(REVIEWS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveCompensationReview(review: Omit<CompensationReview, 'id' | 'createdAt' | 'updatedAt'>): CompensationReview {
  const reviews = getCompensationReviews();
  const newReview: CompensationReview = {
    ...review,
    
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  reviews.push(newReview);
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return newReview;
}

export function updateCompensationReview(id: string, updates: Partial<CompensationReview>): CompensationReview | null {
  const reviews = getCompensationReviews();
  const index = reviews.findIndex(r => r.id === id);
  if (index === -1) return null;
  
  reviews[index] = {
    ...reviews[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  return reviews[index];
}

export function getBonusPlans(): BonusPlan[] {
  const stored = localStorage.getItem(BONUSES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getEquityGrants(): EquityGrant[] {
  const stored = localStorage.getItem(EQUITY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function calculateCompensationStats(): CompensationStats {
  const reviews = getCompensationReviews();
  const currentYear = new Date().getFullYear();
  const currentYearReviews = reviews.filter(r => r.reviewYear === currentYear);

  const pendingReviews = currentYearReviews.filter(r => r.status === 'pending').length;
  const completedReviews = currentYearReviews.filter(r => ['approved', 'implemented'].includes(r.status)).length;

  const totalBudget = currentYearReviews
    .filter(r => r.status === 'approved' || r.status === 'implemented')
    .reduce((sum, r) => sum + r.increaseAmount, 0);

  const avgIncrease = completedReviews > 0
    ? currentYearReviews
        .filter(r => r.status === 'approved' || r.status === 'implemented')
        .reduce((sum, r) => sum + r.increasePercentage, 0) / completedReviews
    : 0;

  return {
    totalCompensationBudget: totalBudget,
    averageIncrease: avgIncrease,
    budgetUtilization: 0, // Would need total budget to calculate
    pendingReviews,
    completedReviews,
  };
}
