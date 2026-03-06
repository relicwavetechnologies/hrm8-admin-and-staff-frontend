export interface MockUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@hrm8.com',
    role: 'Senior Recruiter',
    department: 'Talent Acquisition',
  },
  {
    id: 'user-2',
    name: 'Michael Chen',
    email: 'michael.chen@hrm8.com',
    role: 'Hiring Manager',
    department: 'Engineering',
  },
  {
    id: 'user-3',
    name: 'Emma Williams',
    email: 'emma.williams@hrm8.com',
    role: 'HR Coordinator',
    department: 'Human Resources',
  },
  {
    id: 'user-4',
    name: 'David Brown',
    email: 'david.brown@hrm8.com',
    role: 'Technical Recruiter',
    department: 'Talent Acquisition',
  },
  {
    id: 'user-5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@hrm8.com',
    role: 'Department Head',
    department: 'Marketing',
  },
];
