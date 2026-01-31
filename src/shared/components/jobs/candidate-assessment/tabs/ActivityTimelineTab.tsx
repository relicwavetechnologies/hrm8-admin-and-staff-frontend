import { useState, useMemo, useEffect } from "react";
import { Application } from "@/shared/types/application";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { toast } from "@/shared/hooks/use-toast";
import {
  Clock,
  Search,
  Filter,
  FileText,
  Mail,
  Calendar,
  MessageSquare,
  UserCheck,
  Star,
  TrendingUp,
  CheckCircle2,
  Users,
  ClipboardCheck,
  Upload,
  Eye,
  EyeOff,
  Download
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

interface ActivityTimelineTabProps {
  application: Application;
}

type ActivityType =
  | 'status_change'
  | 'note_added'
  | 'email_sent'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'document_uploaded'
  | 'rating_changed'
  | 'review_submitted'
  | 'scorecard_completed'
  | 'application_viewed';

interface TimelineActivity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  isRead?: boolean;
}

export function ActivityTimelineTab({ application }: ActivityTimelineTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<ActivityType[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [readActivities, setReadActivities] = useState<Set<string>>(new Set());

  // Mark all activities as read when tab is opened
  useEffect(() => {
    const timer = setTimeout(() => {
      const activityIds = application.activities.map(a => a.id);
      setReadActivities(new Set(activityIds));
    }, 500); // Small delay to simulate viewing

    return () => clearTimeout(timer);
  }, [application.activities]);

  const toggleActivityRead = (activityId: string) => {
    setReadActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  const markAllAsRead = () => {
    const allActivityIds = allActivities.map(a => a.id);
    setReadActivities(new Set(allActivityIds));
  };

  // Compile all activities from different sources
  const allActivities = useMemo(() => {
    const activities: TimelineActivity[] = [];

    // Application activities
    application.activities.forEach(activity => {
      activities.push({
        id: activity.id,
        type: activity.type,
        title: getActivityTitle(activity.type),
        description: activity.description,
        userId: activity.userId,
        userName: activity.userName,
        timestamp: activity.createdAt,
        metadata: activity.metadata,
        isRead: activity.isRead || readActivities.has(activity.id),
      });
    });

    // Interview activities
    application.interviews.forEach(interview => {
      activities.push({
        id: `interview-scheduled-${interview.id}`,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        description: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} interview scheduled with ${interview.interviewers.join(', ')}`,
        timestamp: new Date(interview.scheduledDate.getTime() - 24 * 60 * 60 * 1000),
        metadata: { interview },
      });

      if (interview.status === 'completed') {
        activities.push({
          id: `interview-completed-${interview.id}`,
          type: 'interview_completed',
          title: 'Interview Completed',
          description: `${interview.type.charAt(0).toUpperCase() + interview.type.slice(1)} interview completed${interview.rating ? ` - Rating: ${interview.rating}/5` : ''}`,
          timestamp: interview.scheduledDate,
          metadata: { interview },
        });
      }
    });

    // Scorecard activities
    if (application.scorecards) {
      application.scorecards.forEach(scorecard => {
        if (scorecard.status === 'completed') {
          activities.push({
            id: `scorecard-${scorecard.id}`,
            type: 'scorecard_completed',
            title: 'Scorecard Completed',
            description: `${scorecard.evaluatorName} completed ${scorecard.template} evaluation - Score: ${scorecard.overallScore.toFixed(1)}/5`,
            userName: scorecard.evaluatorName,
            timestamp: scorecard.completedAt,
            metadata: { scorecard },
          });
        }
      });
    }

    // Team review activities
    if (application.teamReviews) {
      application.teamReviews.forEach(review => {
        activities.push({
          id: `review-${review.id}`,
          type: 'review_submitted',
          title: 'Team Review Submitted',
          description: `${review.reviewerName} (${review.reviewerRole}) submitted feedback - Score: ${review.overallScore}, Recommendation: ${review.recommendation.replace(/-/g, ' ')}`,
          userName: review.reviewerName,
          timestamp: new Date(review.submittedAt),
          metadata: { review },
        });
      });
    }

    // Sort by timestamp descending (most recent first)
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [application]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = allActivities;

    // Apply unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(activity => !activity.isRead);
    }

    // Apply type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(activity => selectedFilters.includes(activity.type));
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(query) ||
        activity.description.toLowerCase().includes(query) ||
        activity.userName?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allActivities, selectedFilters, searchQuery, showUnreadOnly]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return allActivities.filter(activity => !activity.isRead).length;
  }, [allActivities]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, TimelineActivity[]> = {};

    filteredActivities.forEach(activity => {
      const dateKey = activity.timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });

    return groups;
  }, [filteredActivities]);

  const toggleFilter = (type: ActivityType) => {
    setSelectedFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setSearchQuery("");
    setShowUnreadOnly(false);
  };

  const exportToCSV = () => {
    const csvData = filteredActivities.map(activity => ({
      Date: activity.timestamp.toLocaleDateString(),
      Time: activity.timestamp.toLocaleTimeString(),
      Type: activity.type.replace(/_/g, ' '),
      Title: activity.title,
      Description: activity.description,
      User: activity.userName || 'System',
      Status: activity.isRead ? 'Read' : 'Unread'
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `activity-timeline-${application.candidateName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: "Export Successful",
      description: `Activity timeline exported as CSV (${filteredActivities.length} activities)`,
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Activity Timeline Report', 14, 20);

    // Add candidate info
    doc.setFontSize(12);
    doc.text(`Candidate: ${application.candidateName}`, 14, 30);
    doc.text(`Position: ${application.jobTitle}`, 14, 37);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

    // Add activities table
    const tableData = filteredActivities.map(activity => [
      activity.timestamp.toLocaleDateString(),
      activity.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      activity.type.replace(/_/g, ' '),
      activity.title,
      activity.description,
      activity.userName || 'System',
      activity.isRead ? 'Read' : 'Unread'
    ]);

    autoTable(doc, {
      head: [['Date', 'Time', 'Type', 'Title', 'Description', 'User', 'Status']],
      body: tableData,
      startY: 52,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 },
        2: { cellWidth: 22 },
        3: { cellWidth: 30 },
        4: { cellWidth: 60 },
        5: { cellWidth: 25 },
        6: { cellWidth: 15 }
      }
    });

    doc.save(`activity-timeline-${application.candidateName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Export Successful",
      description: `Activity timeline exported as PDF (${filteredActivities.length} activities)`,
    });
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'status_change':
        return <TrendingUp className="h-4 w-4" />;
      case 'note_added':
        return <MessageSquare className="h-4 w-4" />;
      case 'email_sent':
        return <Mail className="h-4 w-4" />;
      case 'interview_scheduled':
        return <Calendar className="h-4 w-4" />;
      case 'interview_completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'document_uploaded':
        return <Upload className="h-4 w-4" />;
      case 'rating_changed':
        return <Star className="h-4 w-4" />;
      case 'review_submitted':
        return <Users className="h-4 w-4" />;
      case 'scorecard_completed':
        return <ClipboardCheck className="h-4 w-4" />;
      case 'application_viewed':
        return <FileText className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: ActivityType) => {
    switch (type) {
      case 'status_change':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'note_added':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'email_sent':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      case 'interview_scheduled':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'interview_completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'document_uploaded':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'rating_changed':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'review_submitted':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'scorecard_completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'application_viewed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  function getActivityTitle(type: string): string {
    switch (type) {
      case 'status_change': return 'Status Changed';
      case 'note_added': return 'Note Added';
      case 'email_sent': return 'Email Sent';
      case 'interview_scheduled': return 'Interview Scheduled';
      case 'interview_completed': return 'Interview Completed';
      case 'document_uploaded': return 'Document Uploaded';
      case 'rating_changed': return 'Rating Changed';
      case 'review_submitted': return 'Review Submitted';
      case 'scorecard_completed': return 'Scorecard Completed';
      case 'application_viewed': return 'Application Viewed';
      default: return 'Activity';
    }
  }

  const activityTypes: { value: ActivityType; label: string }[] = [
    { value: 'status_change', label: 'Status Changes' },
    { value: 'note_added', label: 'Notes' },
    { value: 'email_sent', label: 'Emails' },
    { value: 'interview_scheduled', label: 'Interviews Scheduled' },
    { value: 'interview_completed', label: 'Interviews Completed' },
    { value: 'document_uploaded', label: 'Documents' },
    { value: 'rating_changed', label: 'Ratings' },
    { value: 'review_submitted', label: 'Team Reviews' },
    { value: 'scorecard_completed', label: 'Scorecards' },
    { value: 'application_viewed', label: 'Views' },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {selectedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Activity Types</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {activityTypes.map(type => (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={selectedFilters.includes(type.value)}
                    onCheckedChange={() => toggleFilter(type.value)}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className="gap-2"
            >
              <Badge variant={showUnreadOnly ? "secondary" : "outline"} className="h-2 w-2 rounded-full p-0" />
              Unread Only
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={markAllAsRead}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
            {(selectedFilters.length > 0 || searchQuery || showUnreadOnly) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredActivities.length} activities</span>
            {selectedFilters.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {selectedFilters.map(filter => (
                    <Badge key={filter} variant="secondary" className="text-xs">
                      {activityTypes.find(t => t.value === filter)?.label}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {Object.entries(groupedActivities).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activities Found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedFilters.length > 0
                ? 'Try adjusting your filters or search query'
                : 'Activities will appear here as they occur'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, activities]) => (
            <div key={date} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  {date}
                </h3>
                <Separator className="flex-1" />
              </div>

              <div className="space-y-3 relative pl-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                {activities.map((activity) => (
                  <div key={activity.id} className="relative">
                    <div
                      className={`absolute left-[-24px] top-2 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center ${getActivityColor(activity.type)}`}
                    >
                      {getActivityIcon(activity.type)}
                    </div>

                    <Card className={!activity.isRead ? "border-primary/50 bg-primary/5" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold text-sm flex items-center gap-2">
                                {!activity.isRead && (
                                  <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
                                )}
                                {activity.title}
                              </h4>
                              <Badge variant="outline" className={`text-xs ${getActivityColor(activity.type)}`}>
                                {activity.type.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            {activity.userName && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <UserCheck className="h-3 w-3" />
                                <span>{activity.userName}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-muted-foreground whitespace-nowrap">
                              {activity.timestamp.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => toggleActivityRead(activity.id)}
                                  >
                                    {activity.isRead ? (
                                      <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-primary" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{activity.isRead ? "Mark as unread" : "Mark as read"}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
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
