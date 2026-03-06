import { useState, useCallback } from 'react';

export interface ComparisonCandidate {
  id: string;
  name: string;
  email: string;
  photo?: string;
  position: string;
  experience: string;
  education: string;
  skills: string[];
  overallScore: number;
  technicalScore: number;
  culturalFitScore: number;
  communicationScore: number;
  status: string;
  appliedDate: Date;
  notes: string;
}

interface UseCandidateComparisonOptions {
  candidateIds: string[];
}

export const useCandidateComparison = ({ candidateIds }: UseCandidateComparisonOptions) => {
  const [candidates] = useState<ComparisonCandidate[]>([
    {
      id: 'cand-1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      position: 'Senior Full Stack Developer',
      experience: '8 years',
      education: 'BS Computer Science, MIT',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      overallScore: 4.5,
      technicalScore: 4.8,
      culturalFitScore: 4.2,
      communicationScore: 4.5,
      status: 'Final Round',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      notes: 'Strong technical background, excellent problem-solving skills',
    },
    {
      id: 'cand-2',
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      position: 'Senior Full Stack Developer',
      experience: '10 years',
      education: 'MS Computer Science, Stanford',
      skills: ['React', 'Python', 'TypeScript', 'GCP', 'Kubernetes'],
      overallScore: 4.7,
      technicalScore: 4.9,
      culturalFitScore: 4.5,
      communicationScore: 4.8,
      status: 'Final Round',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      notes: 'Exceptional technical skills, strong leadership experience',
    },
    {
      id: 'cand-3',
      name: 'Alex Brown',
      email: 'alex.brown@email.com',
      position: 'Senior Full Stack Developer',
      experience: '7 years',
      education: 'BS Software Engineering, UC Berkeley',
      skills: ['Vue.js', 'Node.js', 'JavaScript', 'Azure', 'MongoDB'],
      overallScore: 4.2,
      technicalScore: 4.3,
      culturalFitScore: 4.0,
      communicationScore: 4.3,
      status: 'Technical Interview',
      appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      notes: 'Solid technical skills, good team player',
    },
  ]);

  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(
    candidateIds.slice(0, 3)
  );

  const [comparisonNotes, setComparisonNotes] = useState<Record<string, string>>({});

  const addCandidate = useCallback((candidateId: string) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) return prev;
      return [...prev, candidateId];
    });
  }, []);

  const removeCandidate = useCallback((candidateId: string) => {
    setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
  }, []);

  const addComparisonNote = useCallback((note: string) => {
    const noteId = Date.now().toString();
    setComparisonNotes(prev => ({ ...prev, [noteId]: note }));
  }, []);

  const getSelectedCandidates = useCallback(() => {
    return candidates.filter(c => selectedCandidates.includes(c.id));
  }, [candidates, selectedCandidates]);

  return {
    allCandidates: candidates,
    selectedCandidates: getSelectedCandidates(),
    addCandidate,
    removeCandidate,
    comparisonNotes,
    addComparisonNote,
  };
};
