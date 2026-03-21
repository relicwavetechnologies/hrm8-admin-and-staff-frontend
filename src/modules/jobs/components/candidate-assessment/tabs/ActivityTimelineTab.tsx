// @ts-nocheck
import { useState, useMemo, useEffect } from "react";
import { Application } from "@/shared/types/application";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { apiClient } from "@/shared/lib/api";
import {
  Clock,
  FileText,
  Mail,
  Calendar,
  MessageSquare,
  UserCheck,
  Star,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Users,
  ClipboardCheck,
  Upload,
} from "lucide-react";

interface ActivityTimelineTabProps {
  application: Application;
}

type ActivityType = string;

interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export function ActivityTimelineTab({ application }: ActivityTimelineTabProps) {
  const [fetchedActivities, setFetchedActivities] = useState<TimelineActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!application.id) return;
      setIsLoading(true);
      try {
        let response = await apiClient.get<{ activities: any[] }>(`/api/applications/${application.id}/activities`);
        if (!response.success && response.status === 404) {
          response = await apiClient.get<{ activities: any[] }>(`/api/applications/${application.id}/activity`);
        }

        if (response.success && response.data?.activities) {
          const mapped: TimelineActivity[] = response.data.activities.map((item: any) => ({
            id: item.id,
            type: item.action || item.type || "other",
            title: item.subject || getActivityTitle(item.action || item.type || "other"),
            description: item.description || "",
            userId: item.createdBy,
            userName: item.createdByName || (item.createdBy === "system" ? "System" : undefined),
            timestamp: new Date(item.createdAt),
            metadata: item.metadata || {},
          }));
          setFetchedActivities(mapped);
        } else {
          setFetchedActivities([]);
        }
      } catch (error) {
        console.error("Failed to fetch activity timeline", error);
        setFetchedActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [application.id]);

  const allActivities = useMemo(() => {
    return fetchedActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [fetchedActivities]);

  const groupedActivities = useMemo(() => {
    const groups: Record<string, TimelineActivity[]> = {};

    allActivities.forEach((activity) => {
      const dateKey = activity.timestamp.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [allActivities]);

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case "stage_changed":
      case "round_changed":
        return <TrendingUp className="h-3.5 w-3.5" />;
      case "note_added":
      case "notes_updated":
      case "annotation_commented":
      case "annotation_highlighted":
      case "annotation_deleted":
      case "assessment_comment_added":
      case "interview_note_added":
      case "interview_note_deleted":
        return <MessageSquare className="h-3.5 w-3.5" />;
      case "email_sent":
      case "email_reply_sent":
        return <Mail className="h-3.5 w-3.5" />;
      case "interview_scheduled":
      case "interview_status_updated":
      case "interview_updated":
      case "interview_cancelled":
      case "interview_feedback_added":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "assessment_invited":
      case "assessment_started":
      case "assessment_response_saved":
      case "assessment_submitted":
      case "assessment_resend":
      case "assessment_graded":
      case "assessment_vote_added":
      case "assessment_finalized":
        return <FileText className="h-3.5 w-3.5" />;
      case "application_submitted":
      case "application_created_manual":
      case "application_created_talent_pool":
      case "application_shortlisted":
      case "application_unshortlisted":
      case "application_withdrawn":
      case "application_deleted":
      case "application_marked_read":
        return <UserCheck className="h-3.5 w-3.5" />;
      case "score_updated":
      case "rank_updated":
      case "tags_updated":
      case "manual_screening_updated":
      case "evaluation_added":
      case "ai_analysis_completed":
      case "ai_analysis_failed":
        return <Star className="h-3.5 w-3.5" />;
      case "task_created":
      case "task_updated":
      case "task_assigned":
      case "task_deleted":
        return <ClipboardCheck className="h-3.5 w-3.5" />;
      case "call_logged":
        return <Calendar className="h-3.5 w-3.5" />;
      case "sms_sent":
      case "slack_message_sent":
        return <Users className="h-3.5 w-3.5" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case "stage_changed":
      case "round_changed":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";
      case "note_added":
      case "notes_updated":
      case "annotation_commented":
      case "annotation_highlighted":
      case "annotation_deleted":
      case "assessment_comment_added":
      case "interview_note_added":
      case "interview_note_deleted":
        return "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900/50 dark:text-zinc-300 dark:border-zinc-800";
      case "email_sent":
      case "email_reply_sent":
        return "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/50 dark:text-stone-300 dark:border-stone-800";
      case "interview_scheduled":
      case "interview_status_updated":
      case "interview_updated":
      case "interview_cancelled":
      case "interview_feedback_added":
        return "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900/50 dark:text-neutral-300 dark:border-neutral-800";
      case "assessment_invited":
      case "assessment_started":
      case "assessment_response_saved":
      case "assessment_submitted":
      case "assessment_resend":
      case "assessment_graded":
      case "assessment_vote_added":
      case "assessment_finalized":
        return "bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-900/50 dark:text-stone-300 dark:border-stone-800";
      case "application_submitted":
      case "application_created_manual":
      case "application_created_talent_pool":
      case "application_shortlisted":
      case "application_unshortlisted":
      case "application_withdrawn":
      case "application_deleted":
      case "application_marked_read":
      case "score_updated":
      case "rank_updated":
      case "tags_updated":
      case "manual_screening_updated":
      case "evaluation_added":
      case "ai_analysis_completed":
      case "ai_analysis_failed":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";
      case "task_created":
      case "task_updated":
      case "task_assigned":
      case "task_deleted":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-800";
      case "sms_sent":
      case "slack_message_sent":
      case "call_logged":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";
      default:
        return "bg-muted/60 text-muted-foreground border-border";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>Activity Timeline</span>
        </div>
        <span className="text-xs text-muted-foreground">{allActivities.length} activities</span>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-6 text-center text-xs text-muted-foreground">Loading activity timeline...</CardContent>
        </Card>
      ) : Object.entries(groupedActivities).length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <h3 className="mb-1 text-sm font-semibold">No Activities Found</h3>
            <p className="text-xs text-muted-foreground">Activities will appear here as they occur</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{date}</h3>
                <Separator className="flex-1" />
              </div>

              <div className="relative space-y-2 pl-5 before:absolute before:bottom-2 before:left-[8px] before:top-2 before:w-px before:bg-border">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative">
                    <div
                      className={`absolute left-[-18px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-background ${getActivityColor(activity.type)}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>

                    <Card className="border-border/80 shadow-none">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-semibold">{activity.title}</h4>
                              <Badge variant="outline" className={`h-5 px-1.5 text-[10px] font-medium ${getActivityColor(activity.type)}`}>
                                {activity.type.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <p className="text-xs leading-4 text-muted-foreground">{activity.description}</p>
                            {activity.userName && (
                              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <UserCheck className="h-3 w-3" />
                                <span>{activity.userName}</span>
                              </div>
                            )}
                          </div>
                          <div className="whitespace-nowrap text-[11px] text-muted-foreground">
                            {activity.timestamp.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getActivityTitle(type: string): string {
  switch (type) {
    case "stage_changed":
      return "Stage Changed";
    case "round_changed":
      return "Round Changed";
    case "application_submitted":
      return "Application Submitted";
    case "application_created_manual":
      return "Application Added Manually";
    case "application_created_talent_pool":
      return "Application Added From Talent Pool";
    case "application_shortlisted":
      return "Candidate Shortlisted";
    case "application_unshortlisted":
      return "Candidate Unshortlisted";
    case "application_withdrawn":
      return "Application Withdrawn";
    case "application_deleted":
      return "Application Deleted";
    case "application_marked_read":
      return "Application Marked Read";
    case "score_updated":
      return "Score Updated";
    case "rank_updated":
      return "Rank Updated";
    case "tags_updated":
      return "Tags Updated";
    case "manual_screening_updated":
      return "Manual Screening Updated";
    case "evaluation_added":
      return "Evaluation Added";
    case "ai_analysis_completed":
      return "AI Analysis Completed";
    case "ai_analysis_failed":
      return "AI Analysis Failed";
    case "note_added":
      return "Note Added";
    case "notes_updated":
      return "Notes Updated";
    case "assessment_invited":
      return "Assessment Sent";
    case "assessment_started":
      return "Assessment Started";
    case "assessment_response_saved":
      return "Assessment Response Saved";
    case "assessment_submitted":
      return "Assessment Submitted";
    case "assessment_resend":
      return "Assessment Resent";
    case "assessment_graded":
      return "Assessment Graded";
    case "assessment_vote_added":
      return "Assessment Vote Added";
    case "assessment_comment_added":
      return "Assessment Comment Added";
    case "assessment_finalized":
      return "Assessment Finalized";
    case "email_sent":
      return "Email Sent";
    case "email_reply_sent":
      return "Email Reply Sent";
    case "interview_scheduled":
      return "Interview Scheduled";
    case "interview_status_updated":
      return "Interview Status Updated";
    case "interview_updated":
      return "Interview Updated";
    case "interview_cancelled":
      return "Interview Cancelled";
    case "interview_feedback_added":
      return "Interview Feedback Added";
    case "interview_note_added":
      return "Interview Note Added";
    case "interview_note_deleted":
      return "Interview Note Deleted";
    case "task_created":
      return "Task Created";
    case "task_updated":
      return "Task Updated";
    case "task_assigned":
      return "Task Assigned";
    case "task_deleted":
      return "Task Deleted";
    case "annotation_commented":
      return "Annotation Commented";
    case "annotation_highlighted":
      return "Annotation Highlighted";
    case "annotation_deleted":
      return "Annotation Deleted";
    case "sms_sent":
      return "SMS Sent";
    case "slack_message_sent":
      return "Slack Message Sent";
    case "call_logged":
      return "Call Logged";
    default:
      return "Activity";
  }
}
