import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { useState, useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Plus, X, FileText, Check, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { AIJobGenerator } from "./AIJobGenerator";
import { RichTextEditor } from "@/shared/components/ui/rich-text-editor";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { RequirementCard, Requirement } from "./RequirementCard";
import { ResponsibilityCard, Responsibility } from "./ResponsibilityCard";
import { reorderRequirements, reorderResponsibilities } from "@/shared/lib/jobUtils";

interface JobWizardStep2Props {
  form: UseFormReturn<JobFormData>;
}

const STANDARD_TAGS = ["Urgent", "Remote-first", "Hybrid", "Fast-track", "Equity included", "Relocation assistance", "Visa sponsorship", "Entry-level friendly", "Senior role", "Leadership position", "Contract-to-hire", "Flexible hours"];
const getTagVariant = (tag: string): "destructive" | "default" | "purple" | "orange" | "teal" | "secondary" => {
  const tagLower = tag.toLowerCase();
  if (tagLower === 'urgent' || tagLower === 'fast-track') return 'destructive';
  if (tagLower === 'remote-first' || tagLower === 'flexible hours') return 'default';
  if (tagLower === 'hybrid') return 'purple';
  if (tagLower === 'equity included' || tagLower === 'relocation assistance' || tagLower === 'visa sponsorship') return 'orange';
  if (tagLower === 'entry-level friendly' || tagLower === 'senior role' || tagLower === 'leadership position') return 'teal';
  if (tagLower === 'contract-to-hire') return 'purple';
  return 'secondary';
};

export function JobWizardStep2({ form }: JobWizardStep2Props) {
  const { toast } = useToast();
  const [newRequirement, setNewRequirement] = useState("");
  const [newResponsibility, setNewResponsibility] = useState("");
  const [editingRequirement, setEditingRequirement] = useState<Requirement | null>(null);
  const [editingRequirementText, setEditingRequirementText] = useState("");
  const [editingResponsibility, setEditingResponsibility] = useState<Responsibility | null>(null);
  const [editingResponsibilityText, setEditingResponsibilityText] = useState("");

  // Migrate old string array data to new object structure
  useEffect(() => {
    const requirements = form.getValues("requirements");
    const responsibilities = form.getValues("responsibilities");

    // Check if requirements needs migration
    if (requirements && requirements.length > 0) {
      const firstReq = requirements[0];
      if (typeof firstReq === 'string') {
        const migrated = requirements.map((req: any, index: number) => ({
          id: `req-${Date.now()}-${index}`,
          text: req,
          order: index + 1,
        }));
        form.setValue("requirements", migrated as any);
      }
    }

    // Check if responsibilities needs migration
    if (responsibilities && responsibilities.length > 0) {
      const firstResp = responsibilities[0];
      if (typeof firstResp === 'string') {
        const migrated = responsibilities.map((resp: any, index: number) => ({
          id: `resp-${Date.now()}-${index}`,
          text: resp,
          order: index + 1,
        }));
        form.setValue("responsibilities", migrated as any);
      }
    }
  }, []);

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const current = form.getValues("requirements") || [];
      const newReq: Requirement = {
        id: `req-${Date.now()}`,
        text: newRequirement.trim(),
        order: current.length + 1,
      };
      form.setValue("requirements", [...current, newReq] as any);
      setNewRequirement("");
    }
  };

  const removeRequirement = (id: string) => {
    const current = form.getValues("requirements") || [];
    form.setValue("requirements", current.filter((r) => r.id !== id) as any);
  };

  const handleEditRequirement = (requirement: Requirement) => {
    setEditingRequirement(requirement);
    setEditingRequirementText(requirement.text);
  };

  const saveEditRequirement = () => {
    if (editingRequirementText.trim() && editingRequirement) {
      const current = form.getValues("requirements") || [];
      const updated = current.map((r) =>
        r.id === editingRequirement.id
          ? { ...r, text: editingRequirementText.trim() }
          : r
      );
      form.setValue("requirements", updated as any);
      setEditingRequirement(null);
      setEditingRequirementText("");
    }
  };

  const cancelEditRequirement = () => {
    setEditingRequirement(null);
    setEditingRequirementText("");
  };

  const handleRequirementDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const requirements = form.getValues("requirements") || [];
    const oldIndex = requirements.findIndex((r) => r.id === active.id);
    const newIndex = requirements.findIndex((r) => r.id === over.id);

    const reordered = reorderRequirements(requirements, oldIndex, newIndex);
    form.setValue("requirements", reordered as any);
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      const current = form.getValues("responsibilities") || [];
      const newResp: Responsibility = {
        id: `resp-${Date.now()}`,
        text: newResponsibility.trim(),
        order: current.length + 1,
      };
      form.setValue("responsibilities", [...current, newResp] as any);
      setNewResponsibility("");
    }
  };

  const removeResponsibility = (id: string) => {
    const current = form.getValues("responsibilities") || [];
    form.setValue("responsibilities", current.filter((r) => r.id !== id) as any);
  };

  const handleEditResponsibility = (responsibility: Responsibility) => {
    setEditingResponsibility(responsibility);
    setEditingResponsibilityText(responsibility.text);
  };

  const saveEditResponsibility = () => {
    if (editingResponsibilityText.trim() && editingResponsibility) {
      const current = form.getValues("responsibilities") || [];
      const updated = current.map((r) =>
        r.id === editingResponsibility.id
          ? { ...r, text: editingResponsibilityText.trim() }
          : r
      );
      form.setValue("responsibilities", updated as any);
      setEditingResponsibility(null);
      setEditingResponsibilityText("");
    }
  };

  const cancelEditResponsibility = () => {
    setEditingResponsibility(null);
    setEditingResponsibilityText("");
  };

  const handleResponsibilityDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const responsibilities = form.getValues("responsibilities") || [];
    const oldIndex = responsibilities.findIndex((r) => r.id === active.id);
    const newIndex = responsibilities.findIndex((r) => r.id === over.id);

    const reordered = reorderResponsibilities(responsibilities, oldIndex, newIndex);
    form.setValue("responsibilities", reordered as any);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Description
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Describe the role and what makes it unique
        </p>
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description *</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Provide a detailed description of the job, including the role, team, and company culture..."
                className="min-h-[200px]"
                toolbarActions={<AIJobGenerator form={form} />}
              />
            </FormControl>
            <FormDescription>
              Use the toolbar to format your description. This will be displayed on the job board.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requirements"
        render={() => (
          <FormItem>
            <FormLabel>Requirements *</FormLabel>
            <div className="space-y-3">
              {editingRequirement ? (
                <div className="flex items-start gap-2">
                  <Input
                    value={editingRequirementText}
                    onChange={(e) => setEditingRequirementText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEditRequirement();
                      } else if (e.key === 'Escape') {
                        cancelEditRequirement();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={saveEditRequirement}
                    title="Save"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditRequirement}
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleRequirementDragEnd}
                >
                  <SortableContext
                    items={(form.watch("requirements") || []).map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {(form.watch("requirements") || []).map((req) => (
                      <RequirementCard
                        key={req.id}
                        requirement={req}
                        onEdit={handleEditRequirement}
                        onDelete={removeRequirement}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a requirement (e.g., 5+ years of experience)"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addRequirement();
                    }
                  }}
                />
                <Button type="button" onClick={addRequirement} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <FormDescription>
              List the key qualifications and skills needed for this role
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="responsibilities"
        render={() => (
          <FormItem>
            <FormLabel>Responsibilities *</FormLabel>
            <div className="space-y-3">
              {editingResponsibility ? (
                <div className="flex items-start gap-2">
                  <Input
                    value={editingResponsibilityText}
                    onChange={(e) => setEditingResponsibilityText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        saveEditResponsibility();
                      } else if (e.key === 'Escape') {
                        cancelEditResponsibility();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={saveEditResponsibility}
                    title="Save"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={cancelEditResponsibility}
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleResponsibilityDragEnd}
                >
                  <SortableContext
                    items={(form.watch("responsibilities") || []).map((r) => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {(form.watch("responsibilities") || []).map((resp) => (
                      <ResponsibilityCard
                        key={resp.id}
                        responsibility={resp}
                        onEdit={handleEditResponsibility}
                        onDelete={removeResponsibility}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a responsibility (e.g., Design and develop scalable applications)"
                  value={newResponsibility}
                  onChange={(e) => setNewResponsibility(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addResponsibility();
                    }
                  }}
                />
                <Button type="button" onClick={addResponsibility} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <FormDescription>
              Outline the key duties and day-to-day tasks
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags Section */}
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <TagIcon className="h-5 w-5" />
          Job Tags
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Add up to 5 tags to categorize and highlight this job
        </p>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => {
            const [inputValue, setInputValue] = useState("");
            const currentTags = field.value || [];

            const handleAddTag = () => {
              const trimmedValue = inputValue.trim();
              if (!trimmedValue) return;

              if (currentTags.length >= 5) {
                toast({
                  title: "Maximum tags reached",
                  description: "You can only add up to 5 tags per job",
                  variant: "destructive"
                });
                return;
              }

              if (currentTags.includes(trimmedValue)) {
                toast({
                  title: "Duplicate tag",
                  description: "This tag has already been added",
                  variant: "destructive"
                });
                return;
              }

              if (trimmedValue.length > 20) {
                toast({
                  title: "Tag too long",
                  description: "Tags must be 20 characters or less",
                  variant: "destructive"
                });
                return;
              }

              field.onChange([...currentTags, trimmedValue]);
              setInputValue("");
            };

            const handleRemoveTag = (tagToRemove: string) => {
              field.onChange(currentTags.filter((tag: string) => tag !== tagToRemove));
            };

            const handleKeyDown = (e: React.KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            };

            const handleStandardTagClick = (tag: string) => {
              if (currentTags.length >= 5) {
                toast({
                  title: "Maximum tags reached",
                  description: "You can only add up to 5 tags per job",
                  variant: "destructive"
                });
                return;
              }
              if (currentTags.includes(tag)) {
                return;
              }
              field.onChange([...currentTags, tag]);
            };

            return (
              <FormItem>
                <FormDescription>
                  Select from standard tags or create custom ones
                </FormDescription>

                <div className="space-y-4 mt-3">
                  {/* Standard Tags */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Quick Add: Standard Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {STANDARD_TAGS.map(tag => {
                        const isAdded = currentTags.includes(tag);
                        const isDisabled = isAdded || currentTags.length >= 5;
                        return (
                          <Badge
                            key={tag}
                            variant={isAdded ? 'secondary' : getTagVariant(tag)}
                            className={cn(
                              "cursor-pointer transition-all text-xs font-medium px-3 py-1.5",
                              isAdded && "opacity-40 cursor-not-allowed line-through",
                              !isAdded && !isDisabled && "hover:opacity-80 hover:scale-105"
                            )}
                            onClick={() => !isDisabled && handleStandardTagClick(tag)}
                          >
                            {isAdded && <Check className="h-3 w-3 mr-1" />}
                            {tag}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Tags */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Add Custom Tag</h4>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder='e.g., "Tech stack specific"'
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          maxLength={20}
                          disabled={currentTags.length >= 5}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddTag}
                        disabled={!inputValue.trim() || currentTags.length >= 5}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Selected Tags */}
                  {currentTags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag: string) => {
                          const standardTag = STANDARD_TAGS.find(t => t.toLowerCase() === tag.toLowerCase());
                          const variant = standardTag ? getTagVariant(tag) : 'secondary';
                          return (
                            <Badge key={tag} variant={variant} className="px-3 py-1 text-sm flex items-center gap-2">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-background/20 rounded-full p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    {currentTags.length}/5 tags added
                    {currentTags.length >= 5 && " (maximum reached)"}
                  </p>
                </div>

                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>

    </div>
  );
}
