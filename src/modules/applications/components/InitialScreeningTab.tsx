// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Application, ApplicationStage } from "@/shared/types/application";
import { applicationService } from "@/shared/lib/applicationService";
import { AutomatedScreeningPanel } from "./screening/AutomatedScreeningPanel";

import type { Job } from '@/shared/types/job';

interface InitialScreeningTabProps {
  jobId: string;
  jobTitle: string;
  jobRequirements: string[];
  jobDescription: string;
  job: Job;
  canUseAiOverride?: boolean;
}

export function InitialScreeningTab({
  jobId,
  job,
  canUseAiOverride,
}: InitialScreeningTabProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  // Map backend ApplicationStatus to frontend ApplicationStatus
  const mapApplicationStatus = (status: string): Application['status'] => {
    const statusMap: Record<string, Application['status']> = {
      'NEW': 'applied',
      'SCREENING': 'screening',
      'INTERVIEW': 'interview',
      'OFFER': 'offer',
      'HIRED': 'hired',
      'REJECTED': 'rejected',
      'WITHDRAWN': 'withdrawn',
    };
    return statusMap[status] || 'applied';
  };

  // Map backend ApplicationStage to frontend ApplicationStage
  const mapApplicationStage = (stage: string): ApplicationStage => {
    const stageMap: Record<string, ApplicationStage> = {
      'NEW_APPLICATION': 'New Application',
      'RESUME_REVIEW': 'Resume Review',
      'PHONE_SCREEN': 'Phone Screen',
      'TECHNICAL_INTERVIEW': 'Technical Interview',
      'ONSITE_INTERVIEW': 'Manager Interview',
      'OFFER_EXTENDED': 'Offer Extended',
      'OFFER_ACCEPTED': 'Offer Accepted',
      'REJECTED': 'Rejected',
    };
    return stageMap[stage] || 'New Application';
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationService.getJobApplications(jobId);
      if (response.success && response.data) {
        const apiApplications = response.data.applications || [];
        // Map API applications to frontend Application type (same as ApplicationPipeline)
        const mappedApplications: Application[] = apiApplications.map((app: any) => {
          // Extract candidate name with fallbacks
          let candidateName = 'Unknown Candidate';
          if (app.candidate?.firstName && app.candidate?.lastName) {
            candidateName = `${app.candidate.firstName} ${app.candidate.lastName}`;
          } else if (app.candidate?.firstName) {
            candidateName = app.candidate.firstName;
          } else if (app.candidate?.email) {
            candidateName = app.candidate.email.split('@')[0];
          }

          return {
            id: app.id,
            candidateId: app.candidateId || app.candidate_id || app.candidate?.id || (app as any).candidate_id,
            candidateName,
            candidateEmail: app.candidate?.email || '',
            candidatePhoto: app.candidate?.photo,
            jobId: app.jobId,
            jobTitle: app.job?.title || 'Unknown Job',
            employerName: app.job?.company?.name || 'Unknown Company',
            appliedDate: new Date(app.appliedDate),
            status: mapApplicationStatus(app.status),
            stage: mapApplicationStage(app.stage),
            resumeUrl: app.resumeUrl,
            coverLetterUrl: app.coverLetterUrl,
            portfolioUrl: app.portfolioUrl,
            linkedInUrl: app.linkedInUrl,
            customAnswers: app.customAnswers || [],
            isRead: app.isRead,
            isNew: app.isNew,
            tags: app.tags || [],
            score: app.score,
            rank: app.rank,
            aiMatchScore: app.score, // Assuming 'score' is the AI match score
            aiAnalysis: app.aiAnalysis, // Include AI analysis from backend
            shortlisted: app.shortlisted || false,
            shortlistedAt: app.shortlistedAt ? new Date(app.shortlistedAt) : undefined,
            shortlistedBy: app.shortlistedBy,
            manuallyAdded: app.manuallyAdded || false,
            addedBy: app.addedBy,
            addedAt: app.addedAt ? new Date(app.addedAt) : undefined,
            recruiterNotes: app.recruiterNotes,
            notes: [],
            activities: [],
            interviews: [],
            createdAt: new Date(app.createdAt),
            updatedAt: new Date(app.updatedAt),
          };
        });
        setApplications(mappedApplications);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/80 shadow-none">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-sm font-semibold">AI Screening</CardTitle>
          <CardDescription className="text-xs">
            Compact AI-first screening with ranked candidates, detailed AI review access, and bulk re-analysis.
          </CardDescription>
        </CardHeader>
      </Card>

      <AutomatedScreeningPanel
        job={job}
        applications={applications}
        onRefresh={loadApplications}
        canUseAiOverride={canUseAiOverride}
      />
    </div>
  );
}
