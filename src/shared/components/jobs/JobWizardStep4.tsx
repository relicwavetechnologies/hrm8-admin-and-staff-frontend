import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { ApplicationQuestion } from "@/shared/types/applicationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/shared/components/ui/form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet";
import { ApplicationQuestionCard } from "./ApplicationQuestionCard";
import { AddQuestionDialog } from "./AddQuestionDialog";
import { ApplicationFormPreview } from "./ApplicationFormPreview";
import { QuestionLibraryBrowser } from "./QuestionLibraryBrowser";
import { AIGenerateQuestionsDialog } from "./AIGenerateQuestionsDialog";
import { useState } from "react";
import { FileQuestion, Plus, Eye, FileStack, BookOpen, Sparkles } from "lucide-react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { reorderQuestions } from "@/shared/lib/applicationFormUtils";
import { saveQuestionToLibrary, incrementQuestionUsage } from "@/shared/lib/questionLibraryStorage";
import { Switch } from "@/shared/components/ui/switch";
import { useToast } from "@/shared/hooks/use-toast";

interface JobWizardStep4Props {
  form: UseFormReturn<JobFormData>;
  jobId?: string | null;
}

export function JobWizardStep4({ form, jobId }: JobWizardStep4Props) {
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ApplicationQuestion | null>(null);
  const [libraryBrowserOpen, setLibraryBrowserOpen] = useState(false);
  const [aiGenerateDialogOpen, setAiGenerateDialogOpen] = useState(false);
  const { toast } = useToast();

  const questions = form.watch('applicationForm.questions') || [];
  // const _standardFields = form.watch('applicationForm.includeStandardFields');

  const handleAddQuestion = (question: ApplicationQuestion) => {
    const currentQuestions = form.getValues('applicationForm.questions') || [];

    if (editingQuestion) {
      // Update existing question
      const updatedQuestions = currentQuestions.map((q) =>
        q.id === question.id ? question : q
      );
      form.setValue('applicationForm.questions', updatedQuestions);
      setEditingQuestion(null);
    } else {
      // Add new question
      form.setValue('applicationForm.questions', [...currentQuestions, question]);
    }
  };

  const handleEditQuestion = (question: ApplicationQuestion) => {
    setEditingQuestion(question);
    setQuestionDialogOpen(true);
  };

  const handleDuplicateQuestion = (question: ApplicationQuestion) => {
    const duplicate: ApplicationQuestion = {
      ...question,
      id: `question-${Date.now()}`,
      order: questions.length + 1,
    };
    form.setValue('applicationForm.questions', [...questions, duplicate]);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions
      .filter((q) => q.id !== questionId)
      .map((q, index) => ({ ...q, order: index + 1 }));
    form.setValue('applicationForm.questions', updatedQuestions);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    const reordered = reorderQuestions(questions, oldIndex, newIndex);
    form.setValue('applicationForm.questions', reordered);
  };

  const handleAddFromLibrary = (libraryQuestion: ApplicationQuestion) => {
    const newQuestion: ApplicationQuestion = {
      ...libraryQuestion,
      id: `question-${Date.now()}`,
      order: questions.length + 1,
    };

    form.setValue('applicationForm.questions', [...questions, newQuestion]);

    // Increment usage count if it's a library question
    if ((libraryQuestion as any).libraryId) {
      incrementQuestionUsage((libraryQuestion as any).libraryId);
    }

    setLibraryBrowserOpen(false);
    toast({
      title: "Question Added",
      description: "Question added to your application form",
    });
  };

  const handleAIGeneratedQuestions = (generatedQuestions: ApplicationQuestion[]) => {
    const currentQuestions = form.getValues('applicationForm.questions') || [];
    const newQuestions = generatedQuestions.map((q, index) => ({
      ...q,
      id: q.id || `question-${Date.now()}-${index}`,
      order: currentQuestions.length + index + 1,
    }));

    form.setValue('applicationForm.questions', [...currentQuestions, ...newQuestions]);
  };

  const handleSaveQuestionToLibrary = (question: ApplicationQuestion) => {
    saveQuestionToLibrary({
      ...question,
      libraryId: `user-${Date.now()}`,
      isSystemTemplate: false,
      savedAt: new Date().toISOString(),
      usageCount: 0,
    });

    toast({
      title: "Question Saved",
      description: "Question added to your library for future use",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileQuestion className="h-5 w-5" />
          Application Form & Questionnaire
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure what information you want from applicants
        </p>
      </div>

      {/* Standard Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Standard Fields</CardTitle>
          <CardDescription>
            Select the standard information you want to collect from applicants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="applicationForm.includeStandardFields.resume"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value.included}
                      disabled
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Resume / CV</FormLabel>
                    <FormDescription>
                      Resume is always required for all applications
                    </FormDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <Switch checked={field.value.required} disabled />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationForm.includeStandardFields.coverLetter"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value.included}
                      onCheckedChange={(checked) =>
                        field.onChange({ ...field.value, included: checked })
                      }
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cover Letter</FormLabel>
                    <FormDescription>
                      Request a cover letter from applicants
                    </FormDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <Switch
                    checked={field.value.required}
                    disabled={!field.value.included}
                    onCheckedChange={(checked) =>
                      field.onChange({ ...field.value, required: checked })
                    }
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationForm.includeStandardFields.portfolio"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value.included}
                      onCheckedChange={(checked) =>
                        field.onChange({ ...field.value, included: checked })
                      }
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Portfolio / Work Samples</FormLabel>
                    <FormDescription>
                      Request portfolio or work sample links
                    </FormDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <Switch
                    checked={field.value.required}
                    disabled={!field.value.included}
                    onCheckedChange={(checked) =>
                      field.onChange({ ...field.value, required: checked })
                    }
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationForm.includeStandardFields.linkedIn"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value.included}
                      onCheckedChange={(checked) =>
                        field.onChange({ ...field.value, included: checked })
                      }
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>LinkedIn Profile</FormLabel>
                    <FormDescription>
                      Request LinkedIn profile URL
                    </FormDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <Switch
                    checked={field.value.required}
                    disabled={!field.value.included}
                    onCheckedChange={(checked) =>
                      field.onChange({ ...field.value, required: checked })
                    }
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="applicationForm.includeStandardFields.website"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between space-y-0">
                <div className="flex items-start space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value.included}
                      onCheckedChange={(checked) =>
                        field.onChange({ ...field.value, included: checked })
                      }
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Personal Website</FormLabel>
                    <FormDescription>
                      Request personal website or blog URL
                    </FormDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Required</span>
                  <Switch
                    checked={field.value.required}
                    disabled={!field.value.included}
                    onCheckedChange={(checked) =>
                      field.onChange({ ...field.value, required: checked })
                    }
                  />
                </div>
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Custom Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Questions</CardTitle>
          <CardDescription>
            Add custom questions to gather additional information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <FileStack className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">
                No custom questions added yet
              </p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={() => setAiGenerateDialogOpen(true)} variant="default" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <Button onClick={() => setLibraryBrowserOpen(true)} variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Question Library
                </Button>
                <Button onClick={() => setQuestionDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Question
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DndContext
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {questions
                      .sort((a, b) => a.order - b.order)
                      .map((question) => (
                        <ApplicationQuestionCard
                          key={question.id}
                          question={question}
                          onEdit={handleEditQuestion}
                          onDuplicate={handleDuplicateQuestion}
                          onDelete={handleDeleteQuestion}
                          onSaveToLibrary={handleSaveQuestionToLibrary}
                        />
                      ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setAiGenerateDialogOpen(true)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLibraryBrowserOpen(true)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add from Library
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingQuestion(null);
                    setQuestionDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Question
                </Button>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Application Form
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Application Form Preview</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ApplicationFormPreview formConfig={form.watch('applicationForm')} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardContent>
      </Card>

      <AddQuestionDialog
        open={questionDialogOpen}
        onOpenChange={(open) => {
          setQuestionDialogOpen(open);
          if (!open) setEditingQuestion(null);
        }}
        onAdd={handleAddQuestion}
        editQuestion={editingQuestion}
        nextOrder={questions.length + 1}
      />

      <QuestionLibraryBrowser
        open={libraryBrowserOpen}
        onOpenChange={setLibraryBrowserOpen}
        onSelectQuestion={handleAddFromLibrary}
        currentQuestions={questions}
      />

      <AIGenerateQuestionsDialog
        open={aiGenerateDialogOpen}
        onOpenChange={setAiGenerateDialogOpen}
        onQuestionsSelected={handleAIGeneratedQuestions}
        jobId={jobId || ''}
        jobTitle={form.getValues('title') || ''}
        jobDescription={form.getValues('description') || ''}
        requirements={form.getValues('requirements')?.map((r: any) => typeof r === 'string' ? r : r.text) || []}
        responsibilities={form.getValues('responsibilities')?.map((r: any) => typeof r === 'string' ? r : r.text) || []}
      />
    </div>
  );
}
