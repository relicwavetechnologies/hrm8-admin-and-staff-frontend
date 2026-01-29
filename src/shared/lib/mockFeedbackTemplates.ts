export interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'behavioral' | 'leadership' | 'general';
  sections: {
    type: string;
    prompt: string;
    placeholder: string;
  }[];
}

export const feedbackTemplates: FeedbackTemplate[] = [
  {
    id: 'technical-swe',
    name: 'Software Engineer - Technical',
    description: 'Comprehensive technical assessment for software engineering roles',
    category: 'technical',
    sections: [
      {
        type: 'technical',
        prompt: 'Technical Skills & Problem Solving',
        placeholder: 'Evaluate coding skills, algorithm knowledge, system design capabilities...'
      },
      {
        type: 'technical',
        prompt: 'Code Quality & Best Practices',
        placeholder: 'Assess code organization, naming conventions, error handling...'
      },
      {
        type: 'strength',
        prompt: 'Technical Strengths',
        placeholder: 'Highlight areas of technical excellence...'
      },
      {
        type: 'improvement',
        prompt: 'Areas for Technical Growth',
        placeholder: 'Identify opportunities for skill development...'
      }
    ]
  },
  {
    id: 'behavioral-general',
    name: 'Behavioral Assessment',
    description: 'Standard behavioral interview evaluation',
    category: 'behavioral',
    sections: [
      {
        type: 'strength',
        prompt: 'Communication & Collaboration',
        placeholder: 'Assess verbal communication, active listening, teamwork...'
      },
      {
        type: 'strength',
        prompt: 'Problem-Solving Approach',
        placeholder: 'Evaluate analytical thinking, decision-making process...'
      },
      {
        type: 'cultural',
        prompt: 'Cultural Fit & Values Alignment',
        placeholder: 'Comment on alignment with company values and culture...'
      },
      {
        type: 'general',
        prompt: 'Overall Behavioral Assessment',
        placeholder: 'Provide holistic view of candidate\'s behavioral competencies...'
      }
    ]
  },
  {
    id: 'leadership-manager',
    name: 'Leadership & Management',
    description: 'Assessment template for management and leadership roles',
    category: 'leadership',
    sections: [
      {
        type: 'strength',
        prompt: 'Leadership Style & Effectiveness',
        placeholder: 'Evaluate leadership approach, team motivation, vision setting...'
      },
      {
        type: 'technical',
        prompt: 'Strategic Thinking',
        placeholder: 'Assess ability to think strategically, plan long-term...'
      },
      {
        type: 'strength',
        prompt: 'People Management',
        placeholder: 'Review conflict resolution, mentoring, performance management...'
      },
      {
        type: 'improvement',
        prompt: 'Leadership Development Areas',
        placeholder: 'Identify growth opportunities in leadership capabilities...'
      }
    ]
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Evaluation for product management candidates',
    category: 'technical',
    sections: [
      {
        type: 'technical',
        prompt: 'Product Sense & Vision',
        placeholder: 'Assess product thinking, user empathy, market understanding...'
      },
      {
        type: 'technical',
        prompt: 'Data-Driven Decision Making',
        placeholder: 'Evaluate use of metrics, A/B testing, analytics...'
      },
      {
        type: 'strength',
        prompt: 'Cross-Functional Collaboration',
        placeholder: 'Review ability to work with engineering, design, sales...'
      },
      {
        type: 'general',
        prompt: 'Execution & Delivery',
        placeholder: 'Comment on project management, prioritization, shipping...'
      }
    ]
  },
  {
    id: 'designer-ux',
    name: 'UX/UI Designer',
    description: 'Design role assessment focusing on creativity and user-centered thinking',
    category: 'technical',
    sections: [
      {
        type: 'technical',
        prompt: 'Design Process & Methodology',
        placeholder: 'Evaluate research methods, ideation, prototyping approach...'
      },
      {
        type: 'technical',
        prompt: 'Visual Design & Craft',
        placeholder: 'Assess aesthetic sensibility, attention to detail, polish...'
      },
      {
        type: 'strength',
        prompt: 'User Empathy & Research',
        placeholder: 'Review user research skills, empathy, usability testing...'
      },
      {
        type: 'improvement',
        prompt: 'Design Growth Opportunities',
        placeholder: 'Identify areas for design skill enhancement...'
      }
    ]
  },
  {
    id: 'sales-rep',
    name: 'Sales Representative',
    description: 'Sales role evaluation template',
    category: 'behavioral',
    sections: [
      {
        type: 'strength',
        prompt: 'Sales Skills & Techniques',
        placeholder: 'Evaluate prospecting, qualifying, closing abilities...'
      },
      {
        type: 'strength',
        prompt: 'Relationship Building',
        placeholder: 'Assess rapport building, trust establishment, networking...'
      },
      {
        type: 'technical',
        prompt: 'Product Knowledge & Communication',
        placeholder: 'Review understanding of product/service, value articulation...'
      },
      {
        type: 'general',
        prompt: 'Drive & Motivation',
        placeholder: 'Comment on ambition, resilience, goal orientation...'
      }
    ]
  },
  {
    id: 'generic-structured',
    name: 'General Structured Interview',
    description: 'Universal template for any role',
    category: 'general',
    sections: [
      {
        type: 'strength',
        prompt: 'Key Strengths Observed',
        placeholder: 'List and elaborate on the candidate\'s notable strengths...'
      },
      {
        type: 'improvement',
        prompt: 'Areas for Development',
        placeholder: 'Identify potential areas where candidate could grow...'
      },
      {
        type: 'cultural',
        prompt: 'Team & Culture Fit',
        placeholder: 'Comment on how well candidate aligns with team and culture...'
      },
      {
        type: 'general',
        prompt: 'Overall Assessment',
        placeholder: 'Provide comprehensive summary of interview performance...'
      }
    ]
  }
];

export function getTemplatesByCategory(category: FeedbackTemplate['category']) {
  return feedbackTemplates.filter(t => t.category === category);
}

export function getTemplateById(id: string) {
  return feedbackTemplates.find(t => t.id === id);
}
