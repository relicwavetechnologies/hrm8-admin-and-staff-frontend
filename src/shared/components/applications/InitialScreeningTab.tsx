import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Application, ApplicationStage } from "@/shared/types/application";
import { applicationService } from "@/shared/lib/applicationService";
import { AutomatedScreeningPanel } from "./screening/AutomatedScreeningPanel";
import { ManualScreeningPanel } from "./screening/ManualScreeningPanel";

import type { Job } from '@/shared/types/job';

interface InitialScreeningTabProps {
  jobId: string;
  jobTitle: string;
  jobRequirements: string[];
  jobDescription: string;
  job: Job;
}

export function InitialScreeningTab({
  jobId,
  jobTitle,
  jobRequirements,
  jobDescription,
  job,
}: InitialScreeningTabProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"automated" | "manual">("automated");

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
            candidateId: app.candidateId,
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

  const handleScreeningComplete = () => {
    // Refresh applications after screening
    // onRefresh?.(); // Removed as onRefresh doesn't exist on these props
    loadApplications();
  };
  void handleScreeningComplete;


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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Initial Screening</CardTitle>
          <CardDescription>
            Use AI-powered matching to highlight top candidates, or manually review resumes and answers based on predefined criteria.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "automated" | "manual")}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="automated">Automated Screening</TabsTrigger>
          <TabsTrigger value="manual">Manual Screening</TabsTrigger>
        </TabsList>

        <TabsContent value="automated" className="mt-6">
          <AutomatedScreeningPanel
            job={job}
            applications={applications}
            onRefresh={loadApplications}
          />
        </TabsContent>

        <TabsContent value="manual" className="mt-6">
          <ManualScreeningPanel
            jobId={jobId}
            jobTitle={jobTitle}
            jobRequirements={jobRequirements || []}
            jobDescription={jobDescription}
            applications={applications}
            onRefresh={loadApplications}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

