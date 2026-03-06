import { EmployerContact, ContactRole } from "@/shared/types/employerCRM";
import { mockEmployers } from "./mockTableData";

const firstNames = ["John", "Sarah", "Michael", "Emily", "David", "Jennifer", "Robert", "Lisa", "James", "Maria"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const titles = [
  "CEO", "VP of Human Resources", "HR Manager", "Finance Director", 
  "Technical Lead", "Hiring Manager", "Operations Director", "CFO", "CTO", "COO"
];

const rolesByTitle: Record<string, ContactRole[]> = {
  "CEO": ["decision-maker"],
  "VP of Human Resources": ["decision-maker", "hr"],
  "HR Manager": ["hr", "recruiter"],
  "Finance Director": ["billing", "decision-maker"],
  "Technical Lead": ["technical"],
  "Hiring Manager": ["hr", "recruiter"],
  "Operations Director": ["decision-maker"],
  "CFO": ["billing", "decision-maker"],
  "CTO": ["technical", "decision-maker"],
  "COO": ["decision-maker"],
};

// Generate 2-4 contacts per employer
export const mockContacts: EmployerContact[] = mockEmployers.flatMap(employer => {
  const count = Math.floor(Math.random() * 3) + 2; // 2-4 contacts
  return Array.from({ length: count }, (_, i) => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const roles = rolesByTitle[title] || ["other"];
    
    const daysAgo = Math.floor(Math.random() * 90);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    
    return {
      id: `contact_${employer.id}_${i}`,
      employerId: employer.id,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${employer.website?.replace(/^https?:\/\//, '').replace('www.', '') || 'example.com'}`,
      phone: `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      title,
      department: roles.includes('hr') ? 'Human Resources' : roles.includes('billing') ? 'Finance' : roles.includes('technical') ? 'Engineering' : 'Executive',
      isPrimary: i === 0, // First contact is primary
      roles,
      linkedInUrl: Math.random() > 0.5 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : undefined,
      notes: i === 0 ? 'Primary decision maker for recruitment services' : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    };
  });
});

export function initializeMockContacts() {
  if (!localStorage.getItem('employer_contacts')) {
    localStorage.setItem('employer_contacts', JSON.stringify(mockContacts));
  }
}
