import { SkillCategory, SkillAssessment, RoleSkillRequirement } from "@/shared/types/performance";

export const mockSkillCategories: SkillCategory[] = [
  {
    id: "cat-tech-1",
    name: "Frontend Development",
    description: "Client-side web development skills",
    type: "technical",
    skills: [
      { id: "skill-1", name: "React", categoryId: "cat-tech-1", importance: "critical" },
      { id: "skill-2", name: "TypeScript", categoryId: "cat-tech-1", importance: "critical" },
      { id: "skill-3", name: "CSS/Tailwind", categoryId: "cat-tech-1", importance: "high" },
      { id: "skill-4", name: "Performance Optimization", categoryId: "cat-tech-1", importance: "high" },
      { id: "skill-5", name: "Responsive Design", categoryId: "cat-tech-1", importance: "high" },
    ]
  },
  {
    id: "cat-tech-2",
    name: "Backend Development",
    description: "Server-side development skills",
    type: "technical",
    skills: [
      { id: "skill-6", name: "Node.js", categoryId: "cat-tech-2", importance: "critical" },
      { id: "skill-7", name: "Database Design", categoryId: "cat-tech-2", importance: "critical" },
      { id: "skill-8", name: "API Design", categoryId: "cat-tech-2", importance: "high" },
      { id: "skill-9", name: "Authentication/Security", categoryId: "cat-tech-2", importance: "critical" },
      { id: "skill-10", name: "Microservices", categoryId: "cat-tech-2", importance: "medium" },
    ]
  },
  {
    id: "cat-soft-1",
    name: "Communication",
    description: "Interpersonal and communication abilities",
    type: "soft",
    skills: [
      { id: "skill-11", name: "Written Communication", categoryId: "cat-soft-1", importance: "high" },
      { id: "skill-12", name: "Verbal Communication", categoryId: "cat-soft-1", importance: "high" },
      { id: "skill-13", name: "Presentation Skills", categoryId: "cat-soft-1", importance: "medium" },
      { id: "skill-14", name: "Active Listening", categoryId: "cat-soft-1", importance: "high" },
      { id: "skill-15", name: "Cross-team Collaboration", categoryId: "cat-soft-1", importance: "high" },
    ]
  },
  {
    id: "cat-soft-2",
    name: "Problem Solving",
    description: "Analytical and critical thinking skills",
    type: "soft",
    skills: [
      { id: "skill-16", name: "Analytical Thinking", categoryId: "cat-soft-2", importance: "critical" },
      { id: "skill-17", name: "Debugging", categoryId: "cat-soft-2", importance: "critical" },
      { id: "skill-18", name: "System Design", categoryId: "cat-soft-2", importance: "high" },
      { id: "skill-19", name: "Critical Thinking", categoryId: "cat-soft-2", importance: "high" },
      { id: "skill-20", name: "Decision Making", categoryId: "cat-soft-2", importance: "high" },
    ]
  },
  {
    id: "cat-lead-1",
    name: "Leadership",
    description: "Team leadership and management skills",
    type: "leadership",
    skills: [
      { id: "skill-21", name: "Team Management", categoryId: "cat-lead-1", importance: "critical" },
      { id: "skill-22", name: "Mentoring", categoryId: "cat-lead-1", importance: "high" },
      { id: "skill-23", name: "Conflict Resolution", categoryId: "cat-lead-1", importance: "high" },
      { id: "skill-24", name: "Strategic Planning", categoryId: "cat-lead-1", importance: "high" },
      { id: "skill-25", name: "Stakeholder Management", categoryId: "cat-lead-1", importance: "medium" },
    ]
  },
  {
    id: "cat-domain-1",
    name: "Industry Knowledge",
    description: "Domain-specific expertise",
    type: "domain",
    skills: [
      { id: "skill-26", name: "HR Tech", categoryId: "cat-domain-1", importance: "high" },
      { id: "skill-27", name: "Recruitment Processes", categoryId: "cat-domain-1", importance: "high" },
      { id: "skill-28", name: "Employment Law", categoryId: "cat-domain-1", importance: "medium" },
      { id: "skill-29", name: "Performance Management", categoryId: "cat-domain-1", importance: "high" },
      { id: "skill-30", name: "Compensation & Benefits", categoryId: "cat-domain-1", importance: "medium" },
    ]
  },
];

export const mockSkillAssessments: SkillAssessment[] = [
  {
    id: "assess-1",
    employeeId: "1",
    employeeName: "John Smith",
    role: "Senior Software Engineer",
    department: "Engineering",
    assessorId: "manager-1",
    assessorName: "Sarah Johnson",
    assessmentDate: "2024-11-01",
    assessmentType: "manager",
    skillRatings: [
      {
        skillId: "skill-1",
        skillName: "React",
        categoryId: "cat-tech-1",
        currentLevel: "expert",
        requiredLevel: "advanced",
        lastAssessed: "2024-11-01",
        trend: "stable",
        notes: "Exceptional React skills, mentors junior developers"
      },
      {
        skillId: "skill-2",
        skillName: "TypeScript",
        categoryId: "cat-tech-1",
        currentLevel: "advanced",
        targetLevel: "expert",
        requiredLevel: "advanced",
        lastAssessed: "2024-11-01",
        trend: "improving"
      },
      {
        skillId: "skill-3",
        skillName: "CSS/Tailwind",
        categoryId: "cat-tech-1",
        currentLevel: "advanced",
        requiredLevel: "intermediate",
        lastAssessed: "2024-11-01",
        trend: "stable"
      },
      {
        skillId: "skill-11",
        skillName: "Written Communication",
        categoryId: "cat-soft-1",
        currentLevel: "advanced",
        requiredLevel: "intermediate",
        lastAssessed: "2024-11-01",
        trend: "improving"
      },
      {
        skillId: "skill-16",
        skillName: "Analytical Thinking",
        categoryId: "cat-soft-2",
        currentLevel: "expert",
        requiredLevel: "advanced",
        lastAssessed: "2024-11-01",
        trend: "stable"
      },
      {
        skillId: "skill-22",
        skillName: "Mentoring",
        categoryId: "cat-lead-1",
        currentLevel: "intermediate",
        targetLevel: "advanced",
        requiredLevel: "intermediate",
        lastAssessed: "2024-11-01",
        trend: "improving",
        notes: "Actively mentoring 2 junior engineers"
      },
    ],
    overallNotes: "Strong technical skills with good mentoring abilities. Ready for tech lead role.",
    developmentPlan: "Focus on strategic planning and stakeholder management for leadership transition",
    createdAt: "2024-11-01T10:00:00",
    updatedAt: "2024-11-01T10:00:00",
  },
  {
    id: "assess-2",
    employeeId: "2",
    employeeName: "Jane Doe",
    role: "Product Manager",
    department: "Product",
    assessorId: "manager-2",
    assessorName: "Michael Chen",
    assessmentDate: "2024-10-15",
    assessmentType: "manager",
    skillRatings: [
      {
        skillId: "skill-11",
        skillName: "Written Communication",
        categoryId: "cat-soft-1",
        currentLevel: "expert",
        requiredLevel: "advanced",
        lastAssessed: "2024-10-15",
        trend: "stable"
      },
      {
        skillId: "skill-13",
        skillName: "Presentation Skills",
        categoryId: "cat-soft-1",
        currentLevel: "expert",
        requiredLevel: "advanced",
        lastAssessed: "2024-10-15",
        trend: "stable"
      },
      {
        skillId: "skill-18",
        skillName: "System Design",
        categoryId: "cat-soft-2",
        currentLevel: "intermediate",
        targetLevel: "advanced",
        requiredLevel: "intermediate",
        lastAssessed: "2024-10-15",
        trend: "improving"
      },
      {
        skillId: "skill-24",
        skillName: "Strategic Planning",
        categoryId: "cat-lead-1",
        currentLevel: "advanced",
        requiredLevel: "advanced",
        lastAssessed: "2024-10-15",
        trend: "stable"
      },
      {
        skillId: "skill-25",
        skillName: "Stakeholder Management",
        categoryId: "cat-lead-1",
        currentLevel: "advanced",
        requiredLevel: "advanced",
        lastAssessed: "2024-10-15",
        trend: "improving"
      },
    ],
    overallNotes: "Excellent communication and strategic thinking. Strong product leadership.",
    createdAt: "2024-10-15T14:00:00",
    updatedAt: "2024-10-15T14:00:00",
  },
];

export const mockRoleSkillRequirements: RoleSkillRequirement[] = [
  {
    id: "role-req-1",
    roleName: "Senior Software Engineer",
    department: "Engineering",
    level: "senior",
    requiredSkills: [
      { skillId: "skill-1", skillName: "React", categoryId: "cat-tech-1", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-2", skillName: "TypeScript", categoryId: "cat-tech-1", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-3", skillName: "CSS/Tailwind", categoryId: "cat-tech-1", minimumLevel: "intermediate", importance: "required" },
      { skillId: "skill-6", skillName: "Node.js", categoryId: "cat-tech-2", minimumLevel: "intermediate", importance: "preferred" },
      { skillId: "skill-11", skillName: "Written Communication", categoryId: "cat-soft-1", minimumLevel: "intermediate", importance: "required" },
      { skillId: "skill-16", skillName: "Analytical Thinking", categoryId: "cat-soft-2", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-22", skillName: "Mentoring", categoryId: "cat-lead-1", minimumLevel: "intermediate", importance: "preferred" },
    ],
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
  },
  {
    id: "role-req-2",
    roleName: "Product Manager",
    department: "Product",
    level: "mid",
    requiredSkills: [
      { skillId: "skill-11", skillName: "Written Communication", categoryId: "cat-soft-1", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-13", skillName: "Presentation Skills", categoryId: "cat-soft-1", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-18", skillName: "System Design", categoryId: "cat-soft-2", minimumLevel: "intermediate", importance: "required" },
      { skillId: "skill-19", skillName: "Critical Thinking", categoryId: "cat-soft-2", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-24", skillName: "Strategic Planning", categoryId: "cat-lead-1", minimumLevel: "advanced", importance: "required" },
      { skillId: "skill-25", skillName: "Stakeholder Management", categoryId: "cat-lead-1", minimumLevel: "advanced", importance: "required" },
    ],
    createdAt: "2024-01-01T00:00:00",
    updatedAt: "2024-01-01T00:00:00",
  },
];
