import { useState, useEffect } from "react";
import { type QuestionType, type QuestionOption, type QuestionEvaluationSettings as IQuestionEvaluationSettings } from "@/shared/types/applicationForm";
import { ApplicationStage } from "@/shared/types/application";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { Badge } from "@/shared/components/ui/badge";

interface QuestionEvaluationSettingsProps {
  questionType: QuestionType;
  options?: QuestionOption[];
  evaluation: IQuestionEvaluationSettings | undefined;
  onChange: (evaluation: IQuestionEvaluationSettings | undefined) => void;
}

const APPLICATION_STAGES: ApplicationStage[] = [
  'New Application',
  'Resume Review',
  'Phone Screen',
  'Technical Interview',
  'Manager Interview',
  'Final Round',
  'Reference Check',
  'Offer Extended',
  'Offer Accepted',
  'Rejected',
  'Withdrawn',
];

const ASSESSMENT_TYPES = [
  { value: 'coding', label: 'Coding Assessment' },
  { value: 'personality', label: 'Personality Test' },
  { value: 'cognitive', label: 'Cognitive Ability' },
  { value: 'language', label: 'Language Proficiency' },
  { value: 'skills', label: 'Skills Assessment' },
];

const ASSESSMENT_PROVIDERS = [
  { value: 'hackerrank', label: 'HackerRank' },
  { value: 'cognify', label: 'Cognify' },
  { value: 'pymetrics', label: 'Pymetrics' },
  { value: 'testgorilla', label: 'TestGorilla' },
  { value: 'custom', label: 'Custom' },
];

export function QuestionEvaluationSettings({
  questionType,
  options = [],
  evaluation,
  onChange,
}: QuestionEvaluationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localEvaluation, setLocalEvaluation] = useState<IQuestionEvaluationSettings>(
    evaluation || {}
  );

  // Sync local state with prop when evaluation changes externally
  useEffect(() => {
    setLocalEvaluation(evaluation || {});

  }, [evaluation]);

  const hasOptions = ['multiple_choice', 'checkbox', 'dropdown'].includes(questionType);
  const isTextType = ['short_text', 'long_text'].includes(questionType);

  const updateEvaluation = (newEvaluation: IQuestionEvaluationSettings) => {
    // Remove properties that are undefined, null, or have enabled: false
    const cleaned: Partial<IQuestionEvaluationSettings> = {};

    Object.entries(newEvaluation).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      // If it's an object with enabled property, only include if enabled is true
      if (typeof value === 'object' && value !== null && 'enabled' in value) {
        if (value.enabled === true) {
          (cleaned as any)[key] = value;
        }
      } else {
        (cleaned as any)[key] = value;
      }
    });

    const finalEvaluation = Object.keys(cleaned).length > 0 ? (cleaned as IQuestionEvaluationSettings) : undefined;
    setLocalEvaluation(finalEvaluation || {});
    onChange(finalEvaluation);
  };

  const updateMandatory = (updates: Partial<NonNullable<IQuestionEvaluationSettings['mandatory']>>) => {
    const newEvaluation = {
      ...localEvaluation,
      mandatory: {
        enabled: true,
        disqualifyIfBlank: false,
        ...localEvaluation.mandatory,
        ...updates,
      },
    };
    updateEvaluation(newEvaluation);
  };

  const updateScoring = (updates: Partial<NonNullable<IQuestionEvaluationSettings['scoring']>>) => {
    const newEvaluation = {
      ...localEvaluation,
      scoring: {
        enabled: true,
        ...localEvaluation.scoring,
        ...updates,
      },
    };
    updateEvaluation(newEvaluation);
  };

  const updateAutoTagging = (updates: Partial<NonNullable<IQuestionEvaluationSettings['autoTagging']>>) => {
    const newEvaluation = {
      ...localEvaluation,
      autoTagging: {
        enabled: true,
        rules: [],
        ...localEvaluation.autoTagging,
        ...updates,
      },
    };
    updateEvaluation(newEvaluation);
  };

  const updateTriggers = (updates: Partial<NonNullable<IQuestionEvaluationSettings['triggers']>>) => {
    const newEvaluation = {
      ...localEvaluation,
      triggers: {
        enabled: true,
        ...localEvaluation.triggers,
        ...updates,
      },
    };
    updateEvaluation(newEvaluation);
  };

  const toggleMandatory = (enabled: boolean) => {
    if (enabled) {
      updateMandatory({ enabled: true });
    } else {
      // Create new object without mandatory property using destructuring
      const { mandatory, ...rest } = localEvaluation;
      updateEvaluation(rest as IQuestionEvaluationSettings);
    }
  };

  const toggleScoring = (enabled: boolean) => {
    if (enabled) {
      updateScoring({ enabled: true });
    } else {
      // Create new object without scoring property using destructuring
      const { scoring, ...rest } = localEvaluation;
      updateEvaluation(rest as IQuestionEvaluationSettings);
    }
  };

  const toggleAutoTagging = (enabled: boolean) => {
    if (enabled) {
      updateAutoTagging({ enabled: true });
    } else {
      // Create new object without autoTagging property using destructuring
      const { autoTagging, ...rest } = localEvaluation;
      updateEvaluation(rest as IQuestionEvaluationSettings);
    }
  };

  const toggleTriggers = (enabled: boolean) => {
    if (enabled) {
      updateTriggers({ enabled: true });
    } else {
      // Create new object without triggers property using destructuring
      const { triggers, ...rest } = localEvaluation;
      updateEvaluation(rest as IQuestionEvaluationSettings);
    }
  };

  const addTaggingRule = () => {
    const rules = (localEvaluation.autoTagging as any)?.rules || [];
    updateAutoTagging({
      rules: [
        ...rules,
        {
          condition: 'equals',
          value: '',
          tags: [],
        },
      ],
    });
  };

  const updateTaggingRule = (index: number, updates: Partial<NonNullable<NonNullable<IQuestionEvaluationSettings['autoTagging']>['rules']>[0]>) => {
    const rules = localEvaluation.autoTagging?.rules || [];
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    updateAutoTagging({ rules: newRules });
  };

  const removeTaggingRule = (index: number) => {
    const rules = localEvaluation.autoTagging?.rules || [];
    updateAutoTagging({
      rules: rules.filter((_: any, i: number) => i !== index),
    });
  };

  const updatePointsForOption = (optionValue: string, points: number) => {
    const pointsPerAnswer = localEvaluation.scoring?.pointsPerAnswer || {};
    updateScoring({
      pointsPerAnswer: {
        ...pointsPerAnswer,
        [optionValue]: points,
      },
    });
  };

  const hasEvaluationEnabled =
    localEvaluation.mandatory?.enabled ||
    localEvaluation.scoring?.enabled ||
    localEvaluation.autoTagging?.enabled ||
    localEvaluation.triggers?.enabled;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          type="button"
        >
          <span className="flex items-center gap-2">
            Smart Evaluation Settings
            {hasEvaluationEnabled && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </span>
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Configure automatic evaluation rules for this question. These settings will be used to evaluate candidate responses.
        </div>

        {/* Mandatory Response */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Mandatory Response</CardTitle>
              <Switch
                checked={localEvaluation.mandatory?.enabled || false}
                onCheckedChange={toggleMandatory}
              />
            </div>
          </CardHeader>
          {localEvaluation.mandatory?.enabled && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Auto-disqualify if blank</Label>
                <Switch
                  checked={localEvaluation.mandatory.disqualifyIfBlank}
                  onCheckedChange={(checked) => updateMandatory({ disqualifyIfBlank: checked })}
                />
              </div>

              {hasOptions && (
                <>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto-disqualify if incorrect</Label>
                    <Switch
                      checked={localEvaluation.mandatory.disqualifyIfIncorrect || false}
                      onCheckedChange={(checked) => updateMandatory({ disqualifyIfIncorrect: checked })}
                    />
                  </div>
                  {localEvaluation.mandatory.disqualifyIfIncorrect && (
                    <div className="space-y-2">
                      <Label className="text-sm">Correct Answers (select all that apply)</Label>
                      <div className="space-y-2">
                        {options.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <Checkbox
                              checked={localEvaluation.mandatory?.correctAnswers?.includes(option.value) || false}
                              onCheckedChange={(checked) => {
                                const correctAnswers = localEvaluation.mandatory?.correctAnswers || [];
                                updateMandatory({
                                  correctAnswers: checked
                                    ? [...correctAnswers, option.value]
                                    : correctAnswers.filter((v) => v !== option.value),
                                });
                              }}
                            />
                            <Label className="text-sm font-normal">{option.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {isTextType && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Auto-disqualify if incorrect</Label>
                    <Switch
                      checked={localEvaluation.mandatory.disqualifyIfIncorrect || false}
                      onCheckedChange={(checked) => updateMandatory({ disqualifyIfIncorrect: checked })}
                    />
                  </div>
                  {localEvaluation.mandatory.disqualifyIfIncorrect && (
                    <>
                      <Label className="text-sm">Correct Pattern (Regex)</Label>
                      <Input
                        placeholder="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                        value={localEvaluation.mandatory.correctPattern || ''}
                        onChange={(e) => updateMandatory({ correctPattern: e.target.value })}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={localEvaluation.mandatory.caseSensitive || false}
                          onCheckedChange={(checked) => updateMandatory({ caseSensitive: !!checked })}
                        />
                        <Label className="text-sm font-normal">Case sensitive</Label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Scoring Rules */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Scoring Rules</CardTitle>
              <Switch
                checked={localEvaluation.scoring?.enabled || false}
                onCheckedChange={toggleScoring}
              />
            </div>
          </CardHeader>
          {localEvaluation.scoring?.enabled && (
            <CardContent className="space-y-4">
              {hasOptions && (
                <div className="space-y-2">
                  <Label className="text-sm">Points per Answer</Label>
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <Label className="text-sm w-32">{option.label}:</Label>
                      <Input
                        type="number"
                        className="w-20"
                        value={localEvaluation.scoring?.pointsPerAnswer?.[option.value] || 0}
                        onChange={(e) => updatePointsForOption(option.value, parseInt(e.target.value) || 0)}
                      />
                      <span className="text-sm text-muted-foreground">points</span>
                    </div>
                  ))}
                </div>
              )}

              {isTextType && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm w-32">Points if correct:</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={localEvaluation.scoring?.pointsForCorrect || 0}
                      onChange={(e) => updateScoring({ pointsForCorrect: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm w-32">Points if incorrect:</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={localEvaluation.scoring?.pointsForIncorrect || 0}
                      onChange={(e) => updateScoring({ pointsForIncorrect: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              )}

              <Separator />
              <div className="flex items-center gap-2">
                <Label className="text-sm w-32">Max Points:</Label>
                <Input
                  type="number"
                  className="w-20"
                  value={localEvaluation.scoring?.maxPoints || 0}
                  onChange={(e) => updateScoring({ maxPoints: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm w-32">Min Points to Pass:</Label>
                <Input
                  type="number"
                  className="w-20"
                  value={localEvaluation.scoring?.minPointsToPass || 0}
                  onChange={(e) => updateScoring({ minPointsToPass: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Auto-tagging */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Auto-tagging</CardTitle>
              <Switch
                checked={localEvaluation.autoTagging?.enabled || false}
                onCheckedChange={toggleAutoTagging}
              />
            </div>
          </CardHeader>
          {localEvaluation.autoTagging?.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {(localEvaluation.autoTagging as any)?.rules?.map((rule: any, index: number) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start justify-between mb-3">
                      <Label className="text-sm font-medium">Rule {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => removeTaggingRule(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-20">If answer</Label>
                        <Select
                          value={rule.condition}
                          onValueChange={(value) => updateTaggingRule(index, { condition: value as any })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">equals</SelectItem>
                            <SelectItem value="contains">contains</SelectItem>
                            <SelectItem value="matches">matches</SelectItem>
                            <SelectItem value="greater_than">greater than</SelectItem>
                            <SelectItem value="less_than">less than</SelectItem>
                            <SelectItem value="in_range">in range</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          className="h-8 flex-1"
                          placeholder="value"
                          value={typeof rule.value === 'string' ? rule.value : String(rule.value)}
                          onChange={(e) => updateTaggingRule(index, { value: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs w-20">Add tags:</Label>
                        <Input
                          className="h-8 flex-1"
                          placeholder="Tag1, Tag2"
                          value={rule.tags.join(', ')}
                          onChange={(e) => updateTaggingRule(index, { tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTaggingRule}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Trigger Next Steps */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Trigger Next Steps</CardTitle>
              <Switch
                checked={localEvaluation.triggers?.enabled || false}
                onCheckedChange={toggleTriggers}
              />
            </div>
          </CardHeader>
          {localEvaluation.triggers?.enabled && (
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">On Pass</Label>
                <div className="space-y-2 pl-4 border-l-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Move to stage:</Label>
                    <Select
                      value={localEvaluation.triggers.onPass?.moveToStage || ''}
                      onValueChange={(value) => updateTriggers({ onPass: { ...localEvaluation.triggers?.onPass, moveToStage: value } })}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_STAGES.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={!!localEvaluation.triggers.onPass?.sendAssessmentInvite}
                        onCheckedChange={(checked) => {
                          updateTriggers({
                            onPass: {
                              ...localEvaluation.triggers?.onPass,
                              sendAssessmentInvite: checked
                                ? { assessmentType: 'coding', provider: 'hackerrank' }
                                : undefined,
                            },
                          });
                        }}
                      />
                      <Label className="text-xs">Send assessment invite</Label>
                    </div>
                    {localEvaluation.triggers.onPass?.sendAssessmentInvite && (
                      <div className="space-y-2 pl-6">
                        <div className="space-y-2">
                          <Label className="text-xs">Assessment Type:</Label>
                          <Select
                            value={localEvaluation.triggers.onPass.sendAssessmentInvite.assessmentType}
                            onValueChange={(value) => {
                              updateTriggers({
                                onPass: {
                                  ...localEvaluation.triggers?.onPass,
                                  sendAssessmentInvite: {
                                    ...localEvaluation.triggers?.onPass?.sendAssessmentInvite!,
                                    assessmentType: value,
                                  },
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSESSMENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Provider:</Label>
                          <Select
                            value={localEvaluation.triggers.onPass.sendAssessmentInvite.provider}
                            onValueChange={(value) => {
                              updateTriggers({
                                onPass: {
                                  ...localEvaluation.triggers?.onPass,
                                  sendAssessmentInvite: {
                                    ...localEvaluation.triggers?.onPass?.sendAssessmentInvite!,
                                    provider: value,
                                  },
                                },
                              });
                            }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSESSMENT_PROVIDERS.map((provider) => (
                                <SelectItem key={provider.value} value={provider.value}>
                                  {provider.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Add tags:</Label>
                    <Input
                      className="h-8"
                      placeholder="Tag1, Tag2"
                      value={localEvaluation.triggers.onPass?.addTags?.join(', ') || ''}
                      onChange={(e) => updateTriggers({
                        onPass: {
                          ...localEvaluation.triggers?.onPass,
                          addTags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                        },
                      })}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-sm font-medium">On Fail</Label>
                  <div className="space-y-2 pl-4 border-l-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Move to stage:</Label>
                      <Select
                        value={localEvaluation.triggers.onFail?.moveToStage || ''}
                        onValueChange={(value) => updateTriggers({ onFail: { ...localEvaluation.triggers?.onFail, moveToStage: value } })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                          {APPLICATION_STAGES.map((stage) => (
                            <SelectItem key={stage} value={stage}>
                              {stage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Add tags:</Label>
                      <Input
                        className="h-8"
                        placeholder="Tag1, Tag2"
                        value={localEvaluation.triggers.onFail?.addTags?.join(', ') || ''}
                        onChange={(e) => updateTriggers({
                          onFail: {
                            ...localEvaluation.triggers?.onFail,
                            addTags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                          },
                        })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={localEvaluation.triggers.onFail?.sendRejectionEmail || false}
                        onCheckedChange={(checked) => updateTriggers({
                          onFail: {
                            ...localEvaluation.triggers?.onFail,
                            sendRejectionEmail: !!checked,
                          },
                        })}
                      />
                      <Label className="text-xs">Send rejection email</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
}

