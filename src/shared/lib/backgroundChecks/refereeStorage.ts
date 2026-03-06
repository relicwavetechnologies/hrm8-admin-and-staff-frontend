import type { RefereeDetails } from '@/shared/types/referee';

const REFEREES_KEY = 'hrm8_referees';

function initializeStorage() {
  if (!localStorage.getItem(REFEREES_KEY)) {
    localStorage.setItem(REFEREES_KEY, JSON.stringify([]));
  }
}

export function saveReferee(referee: RefereeDetails): void {
  initializeStorage();
  const referees = getReferees();
  referees.push(referee);
  localStorage.setItem(REFEREES_KEY, JSON.stringify(referees));
}

export function getReferees(): RefereeDetails[] {
  initializeStorage();
  const data = localStorage.getItem(REFEREES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getRefereeById(id: string): RefereeDetails | undefined {
  return getReferees().find(r => r.id === id);
}

export function getRefereeByToken(token: string): RefereeDetails | undefined {
  return getReferees().find(r => r.token === token);
}

export function updateReferee(id: string, updates: Partial<RefereeDetails>): void {
  const referees = getReferees();
  const index = referees.findIndex(r => r.id === id);
  if (index !== -1) {
    referees[index] = {
      ...referees[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(REFEREES_KEY, JSON.stringify(referees));
  }
}

export function deleteReferee(id: string): void {
  const referees = getReferees();
  const filtered = referees.filter(r => r.id !== id);
  localStorage.setItem(REFEREES_KEY, JSON.stringify(filtered));
}

export function getRefereesByCandidate(candidateId: string): RefereeDetails[] {
  return getReferees().filter(r => r.candidateId === candidateId);
}

export function getRefereesByBackgroundCheck(backgroundCheckId: string): RefereeDetails[] {
  return getReferees().filter(r => r.backgroundCheckId === backgroundCheckId);
}

export function getPendingReferees(): RefereeDetails[] {
  const now = new Date();
  return getReferees().filter(r => {
    if (r.status === 'completed' as any) return false;
    if (!r.invitedDate) return false;
    
    const invitedDate = new Date(r.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceInvite >= 3 && r.status !== 'completed';
  });
}

export function getOverdueReferees(): RefereeDetails[] {
  const now = new Date();
  return getReferees().filter(r => {
    if (r.status === 'completed' as any) return false;
    if (!r.invitedDate) return false;
    
    const invitedDate = new Date(r.invitedDate);
    const daysSinceInvite = Math.floor((now.getTime() - invitedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceInvite >= 10;
  });
}
