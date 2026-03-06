/**
 * Domain validation utilities for frontend
 */

/**
 * Extract email domain from email address
 */
export function extractEmailDomain(email: string): string {
  const parts = email.split('@');
  if (parts.length !== 2) {
    throw new Error(`Invalid email format: ${email}`);
  }
  return parts[1].toLowerCase().trim();
}

/**
 * Check if two domains belong to the same organization
 * This compares the base domains (e.g., "tata.com" matches "tata.com" and "mail.tata.com")
 */
export function doDomainsBelongToSameOrg(domain1: string, domain2: string): boolean {
  try {
    // Normalize both domains
    const normalized1 = domain1.toLowerCase().trim();
    const normalized2 = domain2.toLowerCase().trim();
    
    // Direct match
    if (normalized1 === normalized2) {
      return true;
    }
    
    // Extract base domain (remove subdomains)
    // For example: "mail.tata.com" -> "tata.com"
    const getBaseDomain = (domain: string): string => {
      const parts = domain.split('.');
      // If domain has 2 or fewer parts, return as is
      if (parts.length <= 2) {
        return domain;
      }
      // Return last two parts (e.g., "tata.com" from "mail.tata.com")
      return parts.slice(-2).join('.');
    };
    
    const base1 = getBaseDomain(normalized1);
    const base2 = getBaseDomain(normalized2);
    
    return base1 === base2;
  } catch {
    return false;
  }
}

/**
 * Check if email domain matches company domain
 */
export function isEmailDomainMatching(email: string, companyDomain: string): boolean {
  try {
    const emailDomain = extractEmailDomain(email);
    return doDomainsBelongToSameOrg(emailDomain, companyDomain);
  } catch {
    return false;
  }
}

