// @ts-nocheck
import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/shared/components/ui/sheet";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import type { Application } from "@/shared/types/application";

interface AIScreeningAnalysisDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application | null;
  analysis?: any;
}

type ScoreItem = {
  key: string;
  label: string;
  value: number;
  derived?: boolean;
};

const COLORS = {
  excellent: "#059669",
  good: "#0891B2",
  average: "#D97706",
  low: "#DC2626",
  muted: "#94A3B8",
};

const PIE_COLORS = ["#059669", "#DC2626", "#D97706"];

const recommendationLabel = (value?: unknown): string => {
  if (!value || typeof value !== "string") return "Pending";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const normalizeText = (value: unknown): string | null => {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value.map((item) => normalizeText(item)).filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" | ") : null;
  }
  if (value && typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>)
      .map((item) => normalizeText(item))
      .filter((item): item is string => Boolean(item));
    return values.length ? values.join(" | ") : null;
  }
  return null;
};

const normalizeList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter((item): item is string => Boolean(item));
  }
  const text = normalizeText(value);
  return text ? [text] : [];
};

const clampScore = (value: number) => Math.max(0, Math.min(100, value));

const scoreColor = (score: number) => {
  if (score >= 80) return COLORS.excellent;
  if (score >= 65) return COLORS.good;
  if (score >= 50) return COLORS.average;
  return COLORS.low;
};

const numericFromUnknown = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/\d+(\.\d+)?/);
    if (match) return Number(match[0]);
  }
  return null;
};

const sentimentDelta = (text: string | null): number => {
  if (!text) return 0;
  const low = text.toLowerCase();
  const positive = ["strong", "excellent", "good", "solid", "proficient", "promising", "aligned", "fit", "leadership", "effective"];
  const negative = ["limited", "lacks", "weak", "concern", "absence", "gap", "risk", "insufficient", "poor", "shortfall"];

  const posCount = positive.reduce((acc, word) => acc + (low.includes(word) ? 1 : 0), 0);
  const negCount = negative.reduce((acc, word) => acc + (low.includes(word) ? 1 : 0), 0);

  return (posCount - negCount) * 3;
};

const getOverallScore = (analysis: any, fallback = 0) => {
  const direct = [
    analysis?.overallScore,
    analysis?.scores?.overall,
    analysis?.score,
    analysis?.matchScore,
    fallback,
  ];

  for (const candidate of direct) {
    const value = numericFromUnknown(candidate);
    if (value != null) return clampScore(value);
  }
  return 0;
};

const deriveDimensionScore = ({
  explicit,
  overall,
  detailText,
  strengths,
  concerns,
}: {
  explicit: unknown;
  overall: number;
  detailText: string | null;
  strengths: string[];
  concerns: string[];
}) => {
  const direct = numericFromUnknown(explicit);
  if (direct != null && direct > 0) {
    return { value: clampScore(direct), derived: false };
  }

  const base = overall > 0 ? overall : 62;
  const strengthBoost = Math.min(10, strengths.length * 2);
  const concernPenalty = Math.min(10, concerns.length * 2);
  const sentiment = sentimentDelta(detailText);
  const value = clampScore(base + strengthBoost - concernPenalty + sentiment);

  return { value, derived: true };
};

export function AIScreeningAnalysisDrawer({
  open,
  onOpenChange,
  application,
  analysis,
}: AIScreeningAnalysisDrawerProps) {
  const strengths = useMemo(() => normalizeList(analysis?.strengths), [analysis]);
  const concerns = useMemo(() => normalizeList(analysis?.concerns), [analysis]);
  const improvements = useMemo(() => normalizeList(analysis?.improvementAreas), [analysis]);

  const overallScore = useMemo(
    () => getOverallScore(analysis, application?.aiMatchScore ?? application?.score ?? 0),
    [analysis, application]
  );

  const detailedMap = useMemo(() => {
    const raw = analysis?.detailedAnalysis || {};
    return {
      skills: normalizeText(raw.skillsAnalysis),
      experience: normalizeText(raw.experienceAnalysis),
      education: normalizeText(raw.educationAnalysis),
      culture: normalizeText(raw.culturalFitAnalysis),
      overall: normalizeText(raw.overallAssessment) || normalizeText(analysis?.justification),
      communication: normalizeText(analysis?.communicationStyle),
    };
  }, [analysis]);

  const scoreItems = useMemo<ScoreItem[]>(() => {
    const scores = analysis?.scores || {};
    const list: Array<{ key: string; label: string; explicit: unknown; detail: string | null }> = [
      { key: "skills", label: "Skills", explicit: scores.skills ?? analysis?.skillsScore, detail: detailedMap.skills },
      { key: "experience", label: "Experience", explicit: scores.experience ?? analysis?.experienceScore, detail: detailedMap.experience },
      { key: "education", label: "Education", explicit: scores.education ?? analysis?.educationScore, detail: detailedMap.education },
      { key: "communication", label: "Communication", explicit: scores.communication ?? analysis?.communicationScore, detail: detailedMap.communication },
      { key: "culture", label: "Culture Fit", explicit: scores.culture ?? analysis?.culturalFit?.score ?? analysis?.cultureScore, detail: detailedMap.culture },
      { key: "risk", label: "Retention Safety", explicit: scores.risk ? 100 - scores.risk : analysis?.flightRisk?.score ? 100 - analysis.flightRisk.score : analysis?.riskAssessment ? 100 - analysis.riskAssessment : undefined, detail: normalizeText(analysis?.flightRisk?.reason) },
    ];

    return list.map((item) => {
      const result = deriveDimensionScore({
        explicit: item.explicit,
        overall: overallScore,
        detailText: item.detail,
        strengths,
        concerns,
      });
      return {
        key: item.key,
        label: item.label,
        value: result.value,
        derived: result.derived,
      };
    });
  }, [analysis, concerns, detailedMap, overallScore, strengths]);

  const detailedNarrative = useMemo(() => {
    return [
      { label: "Skills Analysis", value: detailedMap.skills },
      { label: "Experience Analysis", value: detailedMap.experience },
      { label: "Education Analysis", value: detailedMap.education },
      { label: "Cultural Fit Analysis", value: detailedMap.culture },
      { label: "Overall Assessment", value: detailedMap.overall },
    ].filter((item) => item.value);
  }, [detailedMap]);

  const qualityDistribution = useMemo(
    () => [
      { name: "Strengths", value: strengths.length },
      { name: "Concerns", value: concerns.length },
      { name: "Improvements", value: improvements.length },
    ],
    [strengths, concerns, improvements]
  );

  const hasDerivedScores = scoreItems.some((item) => item.derived);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[920px] p-0">
        <SheetTitle className="sr-only">AI Analysis</SheetTitle>
        <SheetDescription className="sr-only">Detailed AI analysis with score charts and insights.</SheetDescription>
        <div className="h-full flex flex-col">
          <div className="border-b px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">AI Analysis</p>
                <h2 className="text-lg font-semibold leading-tight mt-0.5">
                  {application?.candidateName || application?.candidateEmail || "Candidate"}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">AI screening intelligence with multidimensional scoring and narrative diagnostics.</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge variant="outline" className="text-xs">{recommendationLabel(analysis?.recommendation)}</Badge>
                <Badge variant="secondary" className="text-xs">Overall {Math.round(overallScore)}%</Badge>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-5 space-y-5">
              {!analysis && (
                <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
                  No AI analysis is available yet. Run re-analysis to generate detailed insights.
                </div>
              )}

              {analysis && (
                <>
                  {hasDerivedScores && (
                    <div className="rounded-md border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] text-amber-800">
                      Some dimension scores are inferred from available AI narrative because raw numeric values were missing.
                    </div>
                  )}

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <div className="rounded-lg border bg-background p-4 xl:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Competency Radar</p>
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={scoreItems}>
                            <PolarGrid stroke="#E2E8F0" />
                            <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Radar dataKey="value" stroke="#0F766E" fill="#0F766E" fillOpacity={0.35} strokeWidth={2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Signal Mix</p>
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={qualityDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={82}>
                              {qualityDistribution.map((entry, idx) => (
                                <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Score Breakdown</p>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreItems} margin={{ top: 8, right: 10, bottom: 8, left: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={52} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {scoreItems.map((item) => (
                              <Cell key={item.key} fill={scoreColor(item.value)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Justification</p>
                    <p className="text-sm leading-6 text-foreground/90">{normalizeText(analysis?.justification) || "No justification available."}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Strengths</p>
                      <div className="space-y-2">
                        {(strengths.length ? strengths : ["No strengths captured."]).map((item, idx) => (
                          <p key={`strength-${idx}`} className="text-sm leading-5">• {item}</p>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Concerns</p>
                      <div className="space-y-2">
                        {(concerns.length ? concerns : ["No concerns captured."]).map((item, idx) => (
                          <p key={`concern-${idx}`} className="text-sm leading-5">• {item}</p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Detailed Narrative</p>
                    <div className="space-y-3">
                      {detailedNarrative.length === 0 && <p className="text-sm text-muted-foreground">No detailed narrative provided.</p>}
                      {detailedNarrative.map((item, idx) => (
                        <div key={`detail-${idx}`}>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground leading-6 mt-1">{item.value}</p>
                          {idx < detailedNarrative.length - 1 && <Separator className="mt-3" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Improvement Areas</p>
                    <div className="space-y-2">
                      {(improvements.length ? improvements : ["No improvement areas captured."]).map((item, idx) => (
                        <p key={`improvement-${idx}`} className="text-sm leading-5">• {item}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
