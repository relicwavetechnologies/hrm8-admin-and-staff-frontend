import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Application } from "@/shared/types/application";
import { Mail, Phone, Linkedin, MapPin, Calendar, Star, Flag, Bell, BellOff, Tag, Globe } from "lucide-react";
import { AIMatchBadge } from "@/shared/components/applications/AIMatchBadge";
import { formatDistanceToNow } from "date-fns";

interface CandidateProfileHeaderProps {
  application: Application;
  jobTitle: string;
}

export function CandidateProfileHeader({ application, jobTitle }: CandidateProfileHeaderProps) {
  const [rating, setRating] = useState(application.rating || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPriority, setIsPriority] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      applied: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      screening: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      interview: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      offer: "bg-green-500/10 text-green-700 dark:text-green-400",
      hired: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      rejected: "bg-red-500/10 text-red-700 dark:text-red-400",
      withdrawn: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return colors[status] || colors.applied;
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      "New Application": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      "Resume Review": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      "Phone Screen": "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      "Technical Interview": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
      "Manager Interview": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      "Final Round": "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
      "Reference Check": "bg-lime-500/10 text-lime-700 dark:text-lime-400",
      "Offer Extended": "bg-green-500/10 text-green-700 dark:text-green-400",
      "Offer Accepted": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      "Rejected": "bg-red-500/10 text-red-700 dark:text-red-400",
      "Withdrawn": "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    };
    return colors[stage] || "bg-muted text-muted-foreground";
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "??";
    const parts = name.split(' ');
    return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase();
  };
  const initials = getInitials(application.candidateName);

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-20 w-20 border-2 border-border">
          <AvatarImage src={application.candidatePhoto} alt={application.candidateName} />
          <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
        </Avatar>

        {/* Main Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold truncate">{application.candidateName || 'Unknown Candidate'}</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Applied for <span className="font-medium text-foreground">{jobTitle}</span>
              </p>
            </div>

            {/* AI Match Score */}
            <div className="flex items-center gap-2">
              {application.aiMatchScore && (
                <AIMatchBadge score={application.aiMatchScore} size="lg" />
              )}
            </div>
          </div>

          {/* Status & Stage Badges */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
            <Badge className={getStageColor(application.stage)}>
              {application.stage}
            </Badge>
            {isPriority && (
              <Badge variant="destructive" className="gap-1">
                <Flag className="h-3 w-3" />
                Priority
              </Badge>
            )}
            {application.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>

          {/* Contact & Meta Info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
            <a
              href={`mailto:${application.candidateEmail}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Mail className="h-4 w-4" />
              {application.candidateEmail}
            </a>

            {application.candidatePhone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{application.candidatePhone}</span>
              </div>
            )}

            {(application.candidateCity || application.candidateState || application.candidateCountry) && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>
                  {[
                    application.candidateCity,
                    application.candidateState,
                    application.candidateCountry
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Applied {formatDistanceToNow(application.appliedDate, { addSuffix: true })}</span>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-2 mt-4">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-4 w-4 ${star <= rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground"
                      }`}
                  />
                </Button>
              ))}
            </div>

            <div className="h-5 w-px bg-border" />

            {/* Priority Flag */}
            <Button
              variant={isPriority ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setIsPriority(!isPriority)}
            >
              <Flag className="h-4 w-4" />
              {isPriority ? "Priority" : "Set Priority"}
            </Button>

            {/* Follow */}
            <Button
              variant={isFollowing ? "default" : "ghost"}
              size="sm"
              className="gap-2"
              onClick={() => setIsFollowing(!isFollowing)}
            >
              {isFollowing ? (
                <>
                  <Bell className="h-4 w-4" />
                  Following
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4" />
                  Follow
                </>
              )}
            </Button>

            {/* LinkedIn */}
            {application.linkedInUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                asChild
              >
                <a href={application.linkedInUrl} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </Button>
            )}

            {/* Portfolio */}
            {application.portfolioUrl && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                asChild
              >
                <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />
                  Portfolio
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
