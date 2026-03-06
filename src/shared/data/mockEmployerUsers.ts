import { EmployerUser } from "@/shared/types/employerUser";
import { mockEmployers } from "./mockTableData";

const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Lisa", "James", "Maria"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];
const titles = ["CEO", "HR Manager", "Recruiter", "Talent Acquisition Manager", "Hiring Manager", "Department Head"];

function generateUsersForEmployer(employerId: string, companyName: string): EmployerUser[] {
  const userCount = Math.floor(Math.random() * 3) + 2; // 2-4 users per employer
  const users: EmployerUser[] = [];
  const now = new Date();

  // Always create an owner first
  const ownerFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ownerLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  users.push({
    id: `user-${employerId}-1`,
    employerId,
    firstName: ownerFirstName,
    lastName: ownerLastName,
    email: `${ownerFirstName.toLowerCase()}.${ownerLastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1-555-${Math.floor(Math.random() * 9000) + 1000}`,
    title: "CEO",
    department: "Executive",
    role: "owner",
    status: "active",
    permissions: ['manage_jobs', 'view_jobs', 'manage_candidates', 'view_candidates', 'manage_billing', 'view_billing', 'manage_users', 'manage_settings'],
    lastLoginAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Create additional users
  for (let i = 1; i < userCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const roles: EmployerUser['role'][] = ['admin', 'recruiter', 'hiring-manager'];
    const role = roles[Math.floor(Math.random() * roles.length)];
    const statuses: EmployerUser['status'][] = ['active', 'active', 'active', 'invited'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const createdAt = new Date(now.getTime() - Math.random() * 150 * 24 * 60 * 60 * 1000);
    
    users.push({
      id: `user-${employerId}-${i + 1}`,
      employerId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: Math.random() > 0.3 ? `+1-555-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      title: titles[Math.floor(Math.random() * titles.length)],
      department: ['HR', 'Recruiting', 'Operations', 'Engineering'][Math.floor(Math.random() * 4)],
      role,
      status,
      permissions: role === 'admin' 
        ? ['manage_jobs', 'view_jobs', 'manage_candidates', 'view_candidates', 'view_billing', 'manage_users', 'manage_settings']
        : role === 'recruiter'
        ? ['manage_jobs', 'view_jobs', 'manage_candidates', 'view_candidates']
        : ['view_jobs', 'view_candidates'],
      lastLoginAt: status === 'active' 
        ? new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      invitedAt: status === 'invited' ? createdAt.toISOString() : undefined,
      invitedBy: status === 'invited' ? users[0].id : undefined,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return users;
}

// Generate users for all employers
export const mockEmployerUsers: EmployerUser[] = mockEmployers.flatMap(employer => 
  generateUsersForEmployer(employer.id, employer.name)
);
