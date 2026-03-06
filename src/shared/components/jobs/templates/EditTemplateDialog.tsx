import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { jobTemplateService, JobTemplate } from "@/shared/lib/api/jobTemplateService";
import { useToast } from "@/shared/hooks/use-toast";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

const templateCategories = ['ENGINEERING', 'PRODUCT', 'DESIGN', 'MARKETING', 'SALES', 'OPERATIONS', 'HR', 'FINANCE', 'EXECUTIVE', 'OTHER'];

interface EditTemplateDialogProps {
  template: JobTemplate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTemplateDialog({
  template,
  open,
  onOpenChange,
}: EditTemplateDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: template.name,
    description: template.description || "",
    category: template.category,
    isShared: template.isShared,
    title: template.jobData?.title || "",
    department: template.jobData?.department || "",
    employmentType: (template.jobData?.employmentType?.toLowerCase().replace('_', '-') || "full-time") as
      | "full-time"
      | "part-time"
      | "contract"
      | "casual",
  });

  useEffect(() => {
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category,
      isShared: template.isShared,
      title: template.jobData?.title || "",
      department: template.jobData?.department || "",
      employmentType: (template.jobData?.employmentType?.toLowerCase().replace('_', '-') || "full-time") as any,
    });
  }, [template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Validation error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Convert employmentType back to enum format
      const employmentTypeEnum = formData.employmentType.toUpperCase().replace('-', '_') as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'CASUAL';

      // Update template with new data
      const updatedJobData = {
        ...template.jobData,
        title: formData.title || template.jobData.title,
        department: formData.department || template.jobData.department,
        employmentType: employmentTypeEnum,
      };

      const response = await jobTemplateService.updateTemplate(template.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category,
        isShared: formData.isShared,
        jobData: updatedJobData,
      });

      if (response.success) {
        toast({
          title: "Template updated",
          description: `"${formData.name}" has been updated successfully.`,
        });
        onOpenChange(false);
      } else {
        throw new Error(response.error || 'Failed to update template');
      }
    } catch (error: any) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Template</DialogTitle>
          <DialogDescription>
            Update template details and default values
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-150px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Template Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Template Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Senior Software Engineer Template"
                  required
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe when to use this template..."
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isShared"
                  checked={formData.isShared}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isShared: checked as boolean })
                  }
                />
                <label htmlFor="isShared" className="text-sm cursor-pointer">
                  Share this template with team members
                </label>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Default Job Details</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Senior Software Engineer"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="e.g., Engineering"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, employmentType: value })
                  }
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
