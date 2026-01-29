import type { Candidate } from '@/shared/types/entities';

export interface DuplicateMatch {
  id: string;
  candidate1: Candidate;
  candidate2: Candidate;
  matchScore: number;
  matchReasons: string[];
  detectedAt: Date;
}

export interface DuplicateMatchCriteria {
  emailMatch: boolean;
  phoneMatch: boolean;
  nameMatch: boolean;
  skillsMatch: boolean;
  locationMatch: boolean;
}

/**
 * Calculate similarity between two strings (Levenshtein distance based)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Normalize phone numbers for comparison
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Calculate Jaccard similarity for skill sets
 */
function calculateSkillsSimilarity(skills1: string[], skills2: string[]): number {
  if (skills1.length === 0 && skills2.length === 0) return 0;
  if (skills1.length === 0 || skills2.length === 0) return 0;
  
  const set1 = new Set(skills1.map(s => s.toLowerCase()));
  const set2 = new Set(skills2.map(s => s.toLowerCase()));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return (intersection.size / union.size) * 100;
}

/**
 * Detect potential duplicate candidates
 */
export function detectDuplicates(candidates: Candidate[]): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];
  
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const c1 = candidates[i];
      const c2 = candidates[j];
      
      const matchReasons: string[] = [];
      let matchScore = 0;
      
      // Email match (highest weight)
      if (c1.email.toLowerCase() === c2.email.toLowerCase()) {
        matchScore += 40;
        matchReasons.push('Exact email match');
      }
      
      // Phone match (high weight)
      if (normalizePhone(c1.phone) === normalizePhone(c2.phone)) {
        matchScore += 30;
        matchReasons.push('Exact phone match');
      }
      
      // Name similarity (medium weight)
      const nameSimilarity = calculateStringSimilarity(c1.name, c2.name);
      if (nameSimilarity > 85) {
        matchScore += 20;
        matchReasons.push(`${nameSimilarity.toFixed(0)}% name similarity`);
      }
      
      // Skills similarity (lower weight)
      const skillsSimilarity = calculateSkillsSimilarity(c1.skills, c2.skills);
      if (skillsSimilarity > 60) {
        matchScore += 10;
        matchReasons.push(`${skillsSimilarity.toFixed(0)}% skill overlap`);
      }
      
      // Location match (bonus)
      if (c1.city && c2.city && c1.city.toLowerCase() === c2.city.toLowerCase()) {
        matchScore += 5;
        matchReasons.push('Same city');
      }
      
      // If match score is above threshold, consider it a duplicate
      if (matchScore >= 50) {
        duplicates.push({
          id: `dup-${c1.id}-${c2.id}`,
          candidate1: c1,
          candidate2: c2,
          matchScore,
          matchReasons,
          detectedAt: new Date(),
        });
      }
    }
  }
  
  return duplicates.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Check if a new candidate is a potential duplicate
 */
export function checkForDuplicates(
  newCandidate: Partial<Candidate>,
  existingCandidates: Candidate[]
): DuplicateMatch[] {
  const tempCandidate: Candidate = {
    id: 'temp',
    name: newCandidate.name || '',
    email: newCandidate.email || '',
    phone: newCandidate.phone || '',
    skills: newCandidate.skills || [],
    city: newCandidate.city,
    ...newCandidate,
  } as Candidate;
  
  return detectDuplicates([...existingCandidates, tempCandidate])
    .filter(dup => dup.candidate1.id === 'temp' || dup.candidate2.id === 'temp');
}
