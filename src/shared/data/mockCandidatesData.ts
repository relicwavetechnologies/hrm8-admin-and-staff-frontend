import type { Candidate, CandidateNote } from '@/shared/types/entities';

const firstNames = ['Sarah', 'Michael', 'Emily', 'James', 'Lisa', 'David', 'Maria', 'Robert', 'Jennifer', 'William', 'Patricia', 'Richard', 'Linda', 'Thomas', 'Elizabeth', 'Charles', 'Susan', 'Christopher', 'Jessica', 'Daniel', 'Karen', 'Matthew', 'Nancy', 'Anthony', 'Betty', 'Mark', 'Margaret', 'Donald', 'Sandra', 'Steven', 'Ashley', 'Paul', 'Kimberly', 'Andrew', 'Rachel', 'Joshua', 'Donna', 'Kenneth', 'Michelle', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Dorothy', 'Timothy', 'Melissa', 'Ronald', 'Deborah', 'Edward', 'Stephanie', 'Jason', 'Rebecca', 'Jeffrey', 'Sharon', 'Ryan', 'Laura', 'Jacob', 'Cynthia', 'Gary', 'Angela', 'Nicholas', 'Shirley', 'Eric', 'Anna', 'Jonathan', 'Brenda', 'Stephen', 'Pamela', 'Larry', 'Nicole', 'Justin', 'Emma', 'Scott', 'Samantha', 'Brandon', 'Katherine', 'Benjamin', 'Christine', 'Samuel', 'Debra', 'Gregory', 'Rachel', 'Alexander', 'Carolyn', 'Frank', 'Janet', 'Patrick', 'Maria', 'Raymond', 'Heather', 'Jack', 'Diane'];

const lastNames = ['Johnson', 'Chen', 'Rodriguez', 'Wilson', 'Anderson', 'Kim', 'Garcia', 'Taylor', 'Martinez', 'Brown', 'Lee', 'Davis', 'Miller', 'Moore', 'Jackson', 'Martin', 'Thompson', 'White', 'Lopez', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy', 'Cook', 'Rogers', 'Morgan', 'Peterson', 'Cooper', 'Reed', 'Bailey', 'Bell', 'Gomez', 'Kelly', 'Howard', 'Ward', 'Cox', 'Diaz', 'Richardson', 'Wood', 'Watson', 'Brooks', 'Bennett', 'Gray', 'James', 'Reyes', 'Cruz', 'Hughes', 'Price', 'Myers', 'Long', 'Foster', 'Sanders', 'Ross', 'Morales', 'Powell', 'Sullivan', 'Russell', 'Ortiz', 'Jenkins', 'Gutierrez', 'Perry', 'Butler', 'Barnes', 'Fisher'];

const currentPositions = ['Software Engineer', 'Senior Developer', 'Data Analyst', 'Product Manager', 'UX Designer', 'Marketing Manager', 'Financial Analyst', 'DevOps Engineer', 'Business Analyst', 'Project Manager', 'Account Manager', 'Sales Executive', 'HR Specialist', 'Operations Manager', 'Content Writer', 'Graphic Designer', 'Network Engineer', 'Quality Assurance', 'System Administrator', 'Customer Success Manager'];

const desiredPositions = ['Senior Software Engineer', 'Lead Developer', 'Senior Data Scientist', 'Director of Product', 'Head of Design', 'VP Marketing', 'Senior Financial Analyst', 'Principal Engineer', 'Senior Business Analyst', 'Program Manager', 'Enterprise Account Executive', 'VP Sales', 'HR Director', 'COO', 'Content Director', 'Creative Director', 'Cloud Architect', 'QA Manager', 'IT Director', 'Chief Customer Officer'];

const skillSets = [
  ['React', 'TypeScript', 'Node.js', 'AWS', 'GraphQL'],
  ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Visualization'],
  ['JavaScript', 'Vue.js', 'Docker', 'Kubernetes', 'CI/CD'],
  ['Java', 'Spring Boot', 'Microservices', 'MySQL', 'Redis'],
  ['Figma', 'UI/UX', 'Prototyping', 'Design Systems', 'User Research'],
  ['SEO', 'Content Strategy', 'Google Analytics', 'Social Media', 'Email Marketing'],
  ['Excel', 'PowerBI', 'Financial Modeling', 'Bloomberg Terminal', 'Risk Analysis'],
  ['Terraform', 'Ansible', 'Jenkins', 'Monitoring', 'Linux'],
  ['Agile', 'Scrum', 'JIRA', 'Stakeholder Management', 'Budget Planning'],
  ['Salesforce', 'CRM', 'Negotiation', 'Lead Generation', 'Account Management'],
  ['Product Strategy', 'Roadmapping', 'A/B Testing', 'Analytics', 'Wireframing'],
  ['C++', 'Algorithms', 'System Design', 'Performance Optimization', 'Debugging'],
  ['Angular', 'RxJS', 'NgRx', 'REST APIs', 'Unit Testing'],
  ['Go', 'gRPC', 'Kafka', 'MongoDB', 'API Design'],
  ['Adobe Creative Suite', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects'],
];

const educationLevels = [
  'B.S. Computer Science',
  'M.S. Data Science',
  'B.A. Business Administration',
  'MBA',
  'B.S. Information Technology',
  'M.S. Software Engineering',
  'B.A. Marketing',
  'M.S. Finance',
  'B.S. Electrical Engineering',
  'Ph.D. Computer Science',
];

const cities = ['San Francisco', 'New York', 'Boston', 'Seattle', 'Austin', 'Chicago', 'Los Angeles', 'Denver', 'Portland', 'Atlanta', 'Miami', 'Phoenix', 'Dallas', 'Houston', 'San Diego'];
const states = ['CA', 'NY', 'MA', 'WA', 'TX', 'IL', 'CA', 'CO', 'OR', 'GA', 'FL', 'AZ', 'TX', 'TX', 'CA'];

const sources: ('job_board' | 'referral' | 'direct' | 'linkedin' | 'agency' | 'career_fair' | 'other')[] = ['job_board', 'linkedin', 'referral', 'direct', 'job_board', 'linkedin', 'agency', 'career_fair'];

const tagOptions = ['Remote Ready', 'Top Performer', 'Quick Starter', 'Leadership', 'Certified', 'Bilingual', 'Security Clearance', 'Startup Experience', 'Enterprise Experience', 'Recently Available'];

export const mockCandidatesData: Candidate[] = Array.from({ length: 100 }, (_, i) => {
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  const experienceYears = 1 + (i % 15);
  const cityIndex = i % cities.length;
  
  const expLevel: ('entry' | 'mid' | 'senior' | 'executive') = 
    experienceYears < 3 ? 'entry' : 
    experienceYears < 7 ? 'mid' : 
    experienceYears < 12 ? 'senior' : 'executive';

  const statusOptions: ('active' | 'placed' | 'inactive')[] = ['active', 'active', 'active', 'active', 'placed', 'inactive'];
  
  const workArrangements: ('remote' | 'hybrid' | 'onsite' | 'flexible')[] = ['remote', 'hybrid', 'onsite', 'flexible'];
  
  const employmentTypes: ('full-time' | 'part-time' | 'contract')[][] = [
    ['full-time'],
    ['full-time', 'contract'],
    ['full-time', 'part-time'],
    ['contract'],
  ];

  // Calculate dates
  const createdDate = new Date(2024, 0, 1 + (i % 90));
  const appliedDate = new Date(2024, 0, 1 + (i % 90));
  const daysAgo = i % 60;
  const lastContactDate = i % 4 === 0 ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000) : undefined;
  const nextFollowUp = i % 5 === 0 ? new Date(Date.now() + (7 + i % 14) * 24 * 60 * 60 * 1000) : undefined;

  const availabilityDays = [0, 7, 14, 30, 60, 90];
  const availabilityDate = new Date(Date.now() + availabilityDays[i % availabilityDays.length] * 24 * 60 * 60 * 1000);

  // Select random tags (0-3 tags)
  const numTags = i % 4;
  const candidateTags: string[] = [];
  for (let j = 0; j < numTags; j++) {
    const tag = tagOptions[(i + j) % tagOptions.length];
    if (!candidateTags.includes(tag)) {
      candidateTags.push(tag);
    }
  }

  return {
    id: `cand-${i + 1}`,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    photo: i % 3 === 0 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}` : undefined,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `(555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).padStart(4, '0')}`,
    
    currentPosition: currentPositions[i % currentPositions.length],
    desiredPosition: desiredPositions[i % desiredPositions.length],
    position: currentPositions[i % currentPositions.length],
    experience: `${experienceYears} years`,
    experienceYears,
    experienceLevel: expLevel,
    
    skills: skillSets[i % skillSets.length],
    education: educationLevels[i % educationLevels.length],
    certifications: i % 3 === 0 ? ['AWS Certified', 'Scrum Master'] : undefined,
    
    salaryMin: 50000 + (experienceYears * 5000) + (i % 20) * 5000,
    salaryMax: 80000 + (experienceYears * 7000) + (i % 20) * 5000,
    salaryCurrency: 'USD',
    workArrangement: workArrangements[i % workArrangements.length],
    employmentTypePreferences: employmentTypes[i % employmentTypes.length],
    noticePeriod: i % 4 === 0 ? 'Immediate' : i % 4 === 1 ? '2 weeks' : i % 4 === 2 ? '1 month' : '2 months',
    availabilityDate,
    
    resumeUrl: i % 2 === 0 ? `https://example.com/resumes/${firstName}-${lastName}-resume.pdf` : undefined,
    coverLetterUrl: i % 5 === 0 ? `https://example.com/letters/${firstName}-${lastName}-cover.pdf` : undefined,
    portfolioUrl: i % 4 === 0 ? `https://portfolio-${firstName.toLowerCase()}-${lastName.toLowerCase()}.com` : undefined,
    linkedInUrl: i % 2 === 0 ? `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}` : undefined,
    githubUrl: (i % 3 === 0 && expLevel !== 'entry') ? `https://github.com/${firstName.toLowerCase()}${lastName.toLowerCase()}` : undefined,
    websiteUrl: i % 7 === 0 ? `https://www.${firstName.toLowerCase()}${lastName.toLowerCase()}.dev` : undefined,
    
    location: `${cities[cityIndex]}, ${states[cityIndex]}`,
    city: cities[cityIndex],
    state: states[cityIndex],
    country: 'United States',
    
    status: statusOptions[i % statusOptions.length],
    source: sources[i % sources.length],
    sourceDetails: i % 3 === 0 ? 'Referred by John Smith' : undefined,
    tags: candidateTags,
    rating: i % 5 === 0 ? 3 + Math.random() * 2 : undefined,
    score: i % 3 === 0 ? 60 + Math.floor(Math.random() * 40) : undefined,
    
    assignedTo: i % 4 === 0 ? 'recruiter-1' : i % 4 === 1 ? 'recruiter-2' : undefined,
    
    appliedDate,
    lastContactedDate: lastContactDate,
    nextFollowUpDate: nextFollowUp,
    createdAt: createdDate,
    updatedAt: new Date(createdDate.getTime() + (i % 30) * 24 * 60 * 60 * 1000),
  };
});

export const mockCandidateNotes: CandidateNote[] = [
  {
    id: 'note-1',
    candidateId: 'cand-1',
    userId: 'user-1',
    userName: 'John Recruiter',
    noteType: 'phone_screen',
    content: 'Excellent communication skills. Very interested in the position. Strong technical background.',
    isPrivate: false,
    createdAt: new Date(2024, 0, 15),
    updatedAt: new Date(2024, 0, 15),
  },
  {
    id: 'note-2',
    candidateId: 'cand-1',
    userId: 'user-2',
    userName: 'Jane Manager',
    noteType: 'interview_feedback',
    content: 'Performed well in technical interview. Demonstrated strong problem-solving abilities.',
    isPrivate: false,
    createdAt: new Date(2024, 0, 20),
    updatedAt: new Date(2024, 0, 20),
  },
];
