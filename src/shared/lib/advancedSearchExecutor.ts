import type { Candidate } from '@/shared/types/entities';
import type { SearchCondition, SearchGroup } from './savedSearchService';

/**
 * Execute a search condition against a candidate
 */
function matchCondition(candidate: Candidate, condition: SearchCondition): boolean {
  const { field, operator, value } = condition;
  
  let fieldValue: any;
  
  // Extract field value
  switch (field) {
    case 'name':
      fieldValue = candidate.name.toLowerCase();
      break;
    case 'email':
      fieldValue = candidate.email.toLowerCase();
      break;
    case 'phone':
      fieldValue = candidate.phone;
      break;
    case 'skills':
      fieldValue = candidate.skills.map(s => s.toLowerCase());
      break;
    case 'position':
      fieldValue = candidate.position.toLowerCase();
      break;
    case 'location':
      fieldValue = candidate.location.toLowerCase();
      break;
    case 'experienceLevel':
      fieldValue = candidate.experienceLevel;
      break;
    case 'status':
      fieldValue = candidate.status;
      break;
    case 'source':
      fieldValue = candidate.source;
      break;
    case 'tags':
      fieldValue = candidate.tags.map(t => t.toLowerCase());
      break;
    default:
      return false;
  }
  
  const compareValue = typeof value === 'string' ? value.toLowerCase() : value;
  
  // Apply operator
  switch (operator) {
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(v => v.includes(compareValue as string));
      }
      return typeof fieldValue === 'string' && fieldValue.includes(compareValue as string);
      
    case 'equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(compareValue);
      }
      return fieldValue === compareValue;
      
    case 'not_equals':
      if (Array.isArray(fieldValue)) {
        return !fieldValue.includes(compareValue);
      }
      return fieldValue !== compareValue;
      
    case 'starts_with':
      return typeof fieldValue === 'string' && fieldValue.startsWith(compareValue as string);
      
    case 'ends_with':
      return typeof fieldValue === 'string' && fieldValue.endsWith(compareValue as string);
      
    case 'in':
      if (!Array.isArray(value)) return false;
      const inValues = (value as string[]).map(v => v.toLowerCase());
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(v => inValues.includes(v));
      }
      return inValues.includes(fieldValue);
      
    case 'not_in':
      if (!Array.isArray(value)) return false;
      const notInValues = (value as string[]).map(v => v.toLowerCase());
      if (Array.isArray(fieldValue)) {
        return !fieldValue.some(v => notInValues.includes(v));
      }
      return !notInValues.includes(fieldValue);
      
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > (compareValue as number);
      
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < (compareValue as number);
      
    default:
      return false;
  }
}

/**
 * Execute a search group against a candidate
 */
function matchGroup(candidate: Candidate, group: SearchGroup): boolean {
  const { conditions, logicalOperator } = group;
  
  if (conditions.length === 0) return true;
  
  if (logicalOperator === 'AND') {
    return conditions.every(condition => matchCondition(candidate, condition));
  } else {
    return conditions.some(condition => matchCondition(candidate, condition));
  }
}

/**
 * Execute advanced search with Boolean operators
 */
export function executeAdvancedSearch(
  candidates: Candidate[],
  groups: SearchGroup[],
  globalOperator: 'AND' | 'OR'
): Candidate[] {
  if (groups.length === 0) return candidates;
  
  return candidates.filter(candidate => {
    if (globalOperator === 'AND') {
      return groups.every(group => matchGroup(candidate, group));
    } else {
      return groups.some(group => matchGroup(candidate, group));
    }
  });
}
