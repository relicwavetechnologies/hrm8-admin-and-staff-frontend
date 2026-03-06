// Mock AI resume parser that extracts information from resume text
export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience?: string;
  experienceYears?: number;
  education?: string;
  currentPosition?: string;
}

export function parseResume(text: string): Promise<ParsedResume> {
  return new Promise((resolve) => {
    // Simulate AI processing delay
    setTimeout(() => {
      const parsed: ParsedResume = {
        skills: [],
      };

      // Extract email (simple regex)
      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) {
        parsed.email = emailMatch[0];
      }

      // Extract phone (simple regex)
      const phoneMatch = text.match(/(\+\d{1,3})?[\s.-]?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
      if (phoneMatch) {
        parsed.phone = phoneMatch[0];
      }

      // Extract common skills (basic keyword matching)
      const commonSkills = [
        'JavaScript', 'Python', 'Java', 'React', 'Angular', 'Node.js',
        'SQL', 'AWS', 'Docker', 'Leadership', 'Communication', 'Project Management',
      ];
      
      const lowerText = text.toLowerCase();
      parsed.skills = commonSkills.filter(skill => 
        lowerText.includes(skill.toLowerCase())
      );

      // Extract years of experience (simple pattern matching)
      const yearsMatch = text.match(/(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?experience/i);
      if (yearsMatch) {
        parsed.experienceYears = parseInt(yearsMatch[1]);
        parsed.experience = `${yearsMatch[1]} years`;
      }

      // Mock education extraction
      const educationKeywords = ['Bachelor', 'Master', 'PhD', 'B.S.', 'M.S.', 'MBA', 'B.A.', 'M.A.'];
      const foundEducation = educationKeywords.find(keyword => 
        text.includes(keyword)
      );
      if (foundEducation) {
        parsed.education = `${foundEducation} Degree`;
      }

      resolve(parsed);
    }, 1000);
  });
}

export function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    } else {
      // For PDF/DOC files, return mock text (in real app, would use PDF.js or similar)
      resolve(`Mock extracted text from ${file.name}. 
        Email: john.doe@example.com
        Phone: +1 555-123-4567
        5 years of experience in JavaScript, React, Node.js
        Bachelor's Degree in Computer Science
      `);
    }
  });
}