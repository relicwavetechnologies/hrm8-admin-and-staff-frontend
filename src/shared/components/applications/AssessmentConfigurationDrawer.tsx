/**
 * Assessment Configuration Drawer
 * Allows admins to configure assessments for a job round
 */

import { useState, useEffect } from "react";
import { FormDrawer } from "@/shared/components/ui/form-drawer";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Separator } from "@/shared/components/ui/separator";
import { assessmentService, AssessmentQuestion } from "@/shared/lib/api/assessmentService";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

interface AssessmentConfigurationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  roundId: string;
  roundName: string;
  onSuccess?: () => void;
}

export function AssessmentConfigurationDrawer({
  open,
  onOpenChange,
  jobId,
  roundId,
  roundName,
  onSuccess,
}: AssessmentConfigurationDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Configuration state
  const [enabled, setEnabled] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [deadlineDays, setDeadlineDays] = useState<number | undefined>(7);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>();
  const [passThreshold, setPassThreshold] = useState<number | undefined>(70);
  const [provider, setProvider] = useState<string>("native");
  const [instructions, setInstructions] = useState("");
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);

  // Load existing configuration
  useEffect(() => {
    if (open && jobId && roundId) {
      loadConfiguration();
    }
  }, [open, jobId, roundId]);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const response = await assessmentService.getAssessmentConfig(jobId, roundId);
      if (response.success && response.data?.config) {
        const config = response.data.config;
        setEnabled(config.enabled);
        setAutoAssign(config.autoAssign ?? true);
        setDeadlineDays(config.deadlineDays ?? 7);
        setTimeLimitMinutes(config.timeLimitMinutes);
        setPassThreshold(config.passThreshold ?? 70);
        setProvider(config.provider || "native");
        setInstructions(config.instructions || "");
        setQuestions(config.questions || []);
      } else {
        // Initialize with defaults
        setEnabled(false);
        setAutoAssign(true);
        setDeadlineDays(7);
        setTimeLimitMinutes(undefined);
        setPassThreshold(70);
        setProvider("native");
        setInstructions("");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Failed to load assessment configuration:", error);
      toast.error("Failed to load assessment configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: AssessmentQuestion = {
      questionText: "",
      type: "MULTIPLE_CHOICE",
      options: provider === "native" ? ["", "", "", ""] : undefined,
      points: 1,
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, order: i })));
  };

  const handleQuestionChange = (index: number, field: keyof AssessmentQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    // Reset options when changing type
    if (field === "type") {
      if (value === "MULTIPLE_CHOICE" || value === "MULTIPLE_SELECT") {
        updated[index].options = ["", "", "", ""];
      } else {
        updated[index].options = undefined;
      }
    }

    setQuestions(updated);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options![optionIndex] = value;
    setQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push("");
    setQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
    }
    setQuestions(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate questions
      if (enabled && questions.length === 0) {
        toast.error("Please add at least one question or disable the assessment");
        setSaving(false);
        return;
      }

      const config = {
        enabled,
        autoAssign,
        deadlineDays: deadlineDays || undefined,
        timeLimitMinutes: timeLimitMinutes || undefined,
        passThreshold: passThreshold || undefined,
        provider,
        questions: questions.length > 0 ? questions : undefined,
        instructions: instructions || undefined,
      };

      const response = await assessmentService.configureAssessment(jobId, roundId, config);

      if (response.success) {
        toast.success("Assessment configuration saved successfully");
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error("Failed to save assessment configuration:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormDrawer
      open={open}
      onOpenChange={onOpenChange}
      title={`Configure Assessment: ${roundName}`}
      description="Set up assessment settings, questions, and third-party integrations"
      width="2xl"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading configuration...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enable/Disable Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assessment Settings</CardTitle>
              <CardDescription>Enable and configure the assessment for this round</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled">Enable Assessment</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on assessment for this round
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={enabled}
                  onCheckedChange={setEnabled}
                />
              </div>

              {enabled && (
                <>
                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-assign">Auto-Assign Assessment</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically assign assessment when candidate enters this round
                      </p>
                    </div>
                    <Switch
                      id="auto-assign"
                      checked={autoAssign}
                      onCheckedChange={setAutoAssign}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {enabled && (
            <>
              {/* Timing & Scoring Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timing & Scoring</CardTitle>
                  <CardDescription>Set deadlines, time limits, and passing criteria</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="deadline-days">Deadline (Days)</Label>
                      <Input
                        id="deadline-days"
                        type="number"
                        min="1"
                        value={deadlineDays || ""}
                        onChange={(e) => setDeadlineDays(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="7"
                      />
                      <p className="text-xs text-muted-foreground">
                        Days candidate has to complete assessment
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time-limit">Time Limit (Minutes)</Label>
                      <Input
                        id="time-limit"
                        type="number"
                        min="1"
                        value={timeLimitMinutes || ""}
                        onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Optional"
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum time to complete assessment
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pass-threshold">Passing Score (%)</Label>
                    <Input
                      id="pass-threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={passThreshold || ""}
                      onChange={(e) => setPassThreshold(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="70"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum score percentage required to pass
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Assessment Provider</CardTitle>
                  <CardDescription>Choose how assessments are delivered</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger id="provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="native">Native (Our Platform)</SelectItem>
                        <SelectItem value="hackerrank">HackerRank</SelectItem>
                        <SelectItem value="codility">Codility</SelectItem>
                        <SelectItem value="testgorilla">TestGorilla</SelectItem>
                        <SelectItem value="canditech">Canditech</SelectItem>
                        <SelectItem value="vervoe">Vervoe</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {provider === "native"
                        ? "Create and manage assessments on our platform"
                        : "Integrate with third-party assessment provider (coming soon)"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Questions Section - Only for native provider */}
              {provider === "native" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">Assessment Questions</CardTitle>
                        <CardDescription>Create questions for the assessment</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddQuestion}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {questions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No questions added yet.</p>
                        <p className="text-sm mt-1">Click "Add Question" to create your first question.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {questions.map((question, index) => (
                          <Card key={index} className="relative">
                            <CardContent className="pt-6">
                              <div className="flex items-start gap-2 mb-4">
                                <GripVertical className="h-5 w-5 text-muted-foreground mt-1" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline">Question {index + 1}</Badge>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveQuestion(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label>Question Text</Label>
                                      <Textarea
                                        value={question.questionText}
                                        onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)}
                                        placeholder="Enter your question here..."
                                        rows={2}
                                      />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <Label>Question Type</Label>
                                        <Select
                                          value={question.type}
                                          onValueChange={(value) => handleQuestionChange(index, "type", value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                            <SelectItem value="MULTIPLE_SELECT">Multiple Select</SelectItem>
                                            <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                                            <SelectItem value="LONG_ANSWER">Long Answer</SelectItem>
                                            <SelectItem value="CODE">Code Challenge</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="space-y-2">
                                        <Label>Points</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          value={question.points || 1}
                                          onChange={(e) => handleQuestionChange(index, "points", parseInt(e.target.value) || 1)}
                                        />
                                      </div>
                                    </div>

                                    {(question.type === "MULTIPLE_CHOICE" || question.type === "MULTIPLE_SELECT") && (
                                      <div className="space-y-2">
                                        <Label>Options</Label>
                                        {question.options?.map((option, optIndex) => (
                                          <div key={optIndex} className="flex gap-2">
                                            <Input
                                              value={option}
                                              onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                                              placeholder={`Option ${optIndex + 1}`}
                                            />
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="icon"
                                              onClick={() => handleRemoveOption(index, optIndex)}
                                              disabled={question.options!.length <= 2}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ))}
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleAddOption(index)}
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          Add Option
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Instructions Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Instructions</CardTitle>
                  <CardDescription>Additional instructions for candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Assessment Instructions</Label>
                    <Textarea
                      id="instructions"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Enter any additional instructions for candidates taking this assessment..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>
      )}
    </FormDrawer>
  );
}

