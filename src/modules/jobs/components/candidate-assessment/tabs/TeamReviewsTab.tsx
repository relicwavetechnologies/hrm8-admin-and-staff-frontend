// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Application } from "@/shared/types/application";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { toast } from "sonner";
import { Loader2, MessageSquare, MoveRight, Send, Star } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { applicationService } from "@/modules/applications/lib/applicationService";

interface TeamReviewsTabProps {
  application: Application;
  onUpdate?: () => void;
}

type RowType = "review" | "evaluation" | "note" | "move";

interface TimelineRow {
  id: string;
  type: RowType;
  date: Date;
  by: string;
  title: string;
  detail?: string;
  score?: number;
  recommendation?: string;
}

const recommendationClass = (rec?: string) => {
  if (!rec) return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";
  const value = rec.toLowerCase();
  if (value.includes("strong-hire") || value.includes("approve") || value === "hire") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
  }
  if (value.includes("pending") || value.includes("maybe")) {
    return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
  }
  if (value.includes("reject") || value.includes("no-hire")) {
    return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  }
  return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800";
};

function formatTimestamp(date: Date) {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const y = date.getFullYear();
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  const s = date.getSeconds().toString().padStart(2, "0");
  return `${d}/${m}/${y}, ${h}:${min}:${s}`;
}

function parseRecruiterNotes(text: string | null | undefined, createdAt: string, updatedAt: string): TimelineRow[] {
  if (!text?.trim()) return [];

  const rows: TimelineRow[] = [];
  const entryRegex = /\[(\d{1,2}[/-]\d{1,2}[/-]\d{4}.*?)\]/g;

  let match: RegExpExecArray | null;
  let foundAny = false;

  while ((match = entryRegex.exec(text)) !== null) {
    foundAny = true;
    const start = match.index + match[0].length;
    const next = entryRegex.exec(text);
    const end = next ? next.index : text.length;
    if (next) entryRegex.lastIndex = next.index;

    const content = text
      .slice(start, end)
      .replace(/^[:\-\s]+/, "")
      .replace(/\[Auto-schedule failed:[\s\S]*?\]/g, "")
      .trim();

    if (!content) continue;

    const dateStr = match[1];
    let parsed = new Date(dateStr);

    const dateParts = dateStr.split(",")[0].trim().split(/[/-]/);
    if (dateParts.length === 3) {
      const day = Number(dateParts[0]);
      const month = Number(dateParts[1]);
      const year = Number(dateParts[2]);
      const timePart = dateStr.includes(",") ? dateStr.split(",")[1].trim() : "00:00:00";
      const [time] = timePart.split(" ");
      const [h = "0", m = "0", s = "0"] = time.split(":");
      const strict = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(Number(h)).padStart(2, "0")}:${String(Number(m)).padStart(2, "0")}:${String(Number(s)).padStart(2, "0")}`);
      if (!Number.isNaN(strict.getTime())) parsed = strict;
    }
    if (Number.isNaN(parsed.getTime())) parsed = new Date();

    const lower = content.toLowerCase();
    const isMove = lower.startsWith("moved to") || lower.startsWith("moved candidate to") || (lower.includes("moved to") && lower.length < 100);

    rows.push({
      id: `note-${rows.length}-${parsed.getTime()}`,
      type: isMove ? "move" : "note",
      date: parsed,
      by: isMove ? "System" : "You",
      title: isMove ? "Round changed" : "Recruiter note",
      detail: content,
    });
  }

  if (!foundAny) {
    rows.push({
      id: "legacy-note",
      type: "note",
      date: new Date(updatedAt || createdAt),
      by: "Recruiter",
      title: "Recruiter note",
      detail: text.trim(),
    });
  }

  return rows;
}

export function TeamReviewsTab({ application, onUpdate }: TeamReviewsTabProps) {
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempRows, setTempRows] = useState<TimelineRow[]>([]);

  useEffect(() => {
    setTempRows([]);
  }, [application]);

  const reviewRows = useMemo<TimelineRow[]>(() => {
    const raw = application.teamReviews || [];
    return raw.map((review: any, index: number) => ({
      id: `review-${review.id || index}`,
      type: "review",
      date: new Date(review.submittedAt || review.createdAt || application.updatedAt),
      by: review.reviewerName || review.user?.name || "Team member",
      title: "Team review",
      detail: Array.isArray(review.comments)
        ? review.comments.map((c: any) => c.content).filter(Boolean).join("\n")
        : review.comment || "No detailed review provided.",
      score: Number(review.overallScore || review.score || 0),
      recommendation: review.recommendation || review.decision,
    }));
  }, [application]);

  const evaluationRows = useMemo<TimelineRow[]>(() => {
    const raw = application.evaluations || [];
    return raw.map((evaluation: any, index: number) => ({
      id: `evaluation-${evaluation.id || index}`,
      type: "evaluation",
      date: new Date(evaluation.created_at || evaluation.createdAt || application.updatedAt),
      by: evaluation.user?.name || evaluation.reviewerName || "Team member",
      title: "Evaluation",
      detail: evaluation.comment || "No evaluation details provided.",
      score: Number(evaluation.score || 0),
      recommendation: evaluation.decision || "PENDING",
    }));
  }, [application]);

  const noteRows = useMemo(
    () => parseRecruiterNotes(application.recruiterNotes, String(application.createdAt), String(application.updatedAt)),
    [application.recruiterNotes, application.createdAt, application.updatedAt]
  );

  const legacyNoteRows = useMemo<TimelineRow[]>(() => {
    const raw = application.notes || [];
    return raw.map((note: any, index: number) => ({
      id: `legacy-${note.id || index}`,
      type: "note",
      date: new Date(note.createdAt || application.updatedAt),
      by: note.authorName || note.userName || "Team member",
      title: "Team note",
      detail: note.content || "",
    }));
  }, [application]);

  const rows = useMemo(() => {
    return [...reviewRows, ...evaluationRows, ...noteRows, ...legacyNoteRows, ...tempRows].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );
  }, [reviewRows, evaluationRows, noteRows, legacyNoteRows, tempRows]);

  const counts = useMemo(() => {
    const reviewCount = rows.filter((row) => row.type === "review" || row.type === "evaluation").length;
    const noteCount = rows.filter((row) => row.type === "note").length;
    const moveCount = rows.filter((row) => row.type === "move").length;
    return { total: rows.length, reviewCount, noteCount, moveCount };
  }, [rows]);

  const handleAddNote = async () => {
    const content = newNote.trim();
    if (!content) return;

    setIsSubmitting(true);
    const now = new Date();
    const optimistic: TimelineRow = {
      id: `temp-${now.getTime()}`,
      type: "note",
      date: now,
      by: "You",
      title: "Recruiter note",
      detail: content,
    };
    setTempRows((prev) => [optimistic, ...prev]);

    try {
      const currentNotes = application.recruiterNotes || "";
      const appendText = currentNotes
        ? `${currentNotes}\n\n[${formatTimestamp(now)}]: ${content}`
        : `[${formatTimestamp(now)}]: ${content}`;

      await applicationService.updateNotes(application.id, appendText);
      setNewNote("");
      toast.success("Note added");
      onUpdate?.();
    } catch (error) {
      console.error("Failed to add note", error);
      toast.error("Failed to add note");
      setTempRows((prev) => prev.filter((item) => item.id !== optimistic.id));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-2">
      <div className="border rounded-md bg-muted/10 px-2 py-1.5 mb-2">
        <div className="flex items-center gap-2 text-[11px]">
          <Badge variant="outline" className="h-6 rounded-md bg-background">Total {counts.total}</Badge>
          <Badge variant="outline" className="h-6 rounded-md bg-background">Reviews {counts.reviewCount}</Badge>
          <Badge variant="outline" className="h-6 rounded-md bg-background">Notes {counts.noteCount}</Badge>
          <Badge variant="outline" className="h-6 rounded-md bg-background">Moves {counts.moveCount}</Badge>
        </div>
      </div>

      <div className="border rounded-md bg-background mb-2">
        <div className="p-2 border-b bg-muted/10">
          <p className="text-[11px] font-medium text-muted-foreground">Add team note</p>
        </div>
        <div className="p-2 flex gap-2 items-end">
          <Textarea
            placeholder="Add hiring feedback, discussion points, or next-step note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[56px] max-h-[120px] text-xs resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAddNote();
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Send className="h-3.5 w-3.5 mr-1" />}
            Add
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 border rounded-md bg-background overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow className="h-8 bg-muted/20">
                <TableHead className="text-[11px] font-semibold w-[155px]">Time</TableHead>
                <TableHead className="text-[11px] font-semibold w-[120px]">Type</TableHead>
                <TableHead className="text-[11px] font-semibold w-[140px]">By</TableHead>
                <TableHead className="text-[11px] font-semibold">Details</TableHead>
                <TableHead className="text-[11px] font-semibold w-[160px] text-right">Score / Decision</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      No team activity yet.
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id} className="align-top">
                    <TableCell className="py-2.5 text-[11px] text-muted-foreground whitespace-nowrap">
                      {format(row.date, "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell className="py-2.5">
                      {row.type === "move" ? (
                        <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                          <MoveRight className="h-3 w-3 mr-1" />Round Move
                        </Badge>
                      ) : row.type === "review" || row.type === "evaluation" ? (
                        <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                          <Star className="h-3 w-3 mr-1" />{row.type === "review" ? "Review" : "Evaluation"}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800">Note</Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 text-[11px] font-medium">{row.by}</TableCell>
                    <TableCell className="py-2.5">
                      <div className="space-y-1">
                        <p className="text-[11px] font-medium">{row.title}</p>
                        <p className={cn("text-xs text-muted-foreground whitespace-pre-wrap", row.type === "move" && "text-indigo-700")}>{row.detail || "-"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-right">
                      {(row.type === "review" || row.type === "evaluation") ? (
                        <div className="inline-flex flex-col items-end gap-1">
                          <Badge variant="outline" className={cn("text-[10px]", recommendationClass(row.recommendation))}>
                            {(row.recommendation || "PENDING").replace(/-/g, " ")}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">Score {row.score || 0}/10</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
