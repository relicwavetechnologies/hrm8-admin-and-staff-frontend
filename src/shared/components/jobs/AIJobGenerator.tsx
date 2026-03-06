import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Wand2, Sparkles, FileText, Upload } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";

// Helper function to extract description from PD text
function extractDescription(text: string): string {
  // Look for common section headers
  const descriptionKeywords = ['overview', 'summary', 'about the role', 'about this role', 'role description', 'position summary'];
  const lines = text.split('\n');

  let startIndex = -1;
  let endIndex = lines.length;

  // Find section start
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (descriptionKeywords.some(keyword => line.includes(keyword))) {
      startIndex = i + 1;
      break;
    }
  }

  // If no header found, use first few paragraphs
  if (startIndex === -1) {
    startIndex = 0;
  }

  // Find section end (next major section)
  const endKeywords = ['requirements', 'qualifications', 'responsibilities', 'duties', 'what you'];
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (endKeywords.some(keyword => line.includes(keyword))) {
      endIndex = i;
      break;
    }
  }

  // Extract and clean text
  const description = lines.slice(startIndex, Math.min(startIndex + 10, endIndex))
    .filter(line => line.trim().length > 0)
    .join('\n\n');

  return description || text.slice(0, 500);
}

// Helper function to extract requirements from PD text
function extractRequirements(text: string): string[] {
  const requirementKeywords = ['requirements', 'qualifications', 'must have', 'required', 'essential'];
  const lines = text.split('\n');
  const requirements: string[] = [];

  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if we're entering requirements section
    if (requirementKeywords.some(keyword => lowerLine.includes(keyword))) {
      inSection = true;
      continue;
    }

    // Check if we're leaving the section
    if (inSection && (lowerLine.includes('responsibilities') || lowerLine.includes('duties') || lowerLine.includes('benefits'))) {
      break;
    }

    // Extract bullet points or numbered items
    if (inSection && line.length > 0) {
      const cleaned = line
        .replace(/^[-•*]\s*/, '')
        .replace(/^\d+[\.)]\s*/, '')
        .trim();

      if (cleaned.length > 10) {
        requirements.push(cleaned);
      }
    }
  }

  // If nothing found, return generic requirements
  if (requirements.length === 0) {
    return [
      'Relevant experience in the field',
      'Strong communication skills',
      'Problem-solving abilities',
      'Team collaboration'
    ];
  }

  return requirements.slice(0, 8); // Limit to 8 requirements
}

// Helper function to extract responsibilities from PD text
function extractResponsibilities(text: string): string[] {
  const responsibilityKeywords = ['responsibilities', 'duties', 'what you will do', 'what you\'ll do', 'key duties', 'role responsibilities'];
  const lines = text.split('\n');
  const responsibilities: string[] = [];

  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    // Check if we're entering responsibilities section
    if (responsibilityKeywords.some(keyword => lowerLine.includes(keyword))) {
      inSection = true;
      continue;
    }

    // Check if we're leaving the section
    if (inSection && (lowerLine.includes('requirements') || lowerLine.includes('qualifications') || lowerLine.includes('benefits'))) {
      break;
    }

    // Extract bullet points or numbered items
    if (inSection && line.length > 0) {
      const cleaned = line
        .replace(/^[-•*]\s*/, '')
        .replace(/^\d+[\.)]\s*/, '')
        .trim();

      if (cleaned.length > 10) {
        responsibilities.push(cleaned);
      }
    }
  }

  // If nothing found, return generic responsibilities
  if (responsibilities.length === 0) {
    return [
      'Execute key tasks aligned with role objectives',
      'Collaborate with team members',
      'Contribute to project success',
      'Maintain quality standards'
    ];
  }

  return responsibilities.slice(0, 8); // Limit to 8 responsibilities
}

interface AIJobGeneratorProps {
  form: UseFormReturn<JobFormData>;
  onScrollToUpload?: () => void;
}

export function AIJobGenerator({ form, onScrollToUpload }: AIJobGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUploadNow = () => {
    setOpen(false);
    setTimeout(() => {
      onScrollToUpload?.();
    }, 100);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const extractedData = form.getValues("extractedJobData");
      const positionDescText = form.getValues("positionDescriptionText");

      // If AI-extracted data exists, use it (from document parsing)
      if (extractedData) {
        // Use AI-extracted title if available and form title is empty
        if (extractedData.title && !form.getValues("title")) {
          form.setValue("title", extractedData.title);
        }

        // Use AI-extracted description
        if (extractedData.description) {
          form.setValue("description", extractedData.description);
        }

        // Use AI-extracted requirements
        if (extractedData.requirements && extractedData.requirements.length > 0) {
          form.setValue("requirements", extractedData.requirements.map((text, index) => ({
            id: `req-${Date.now()}-${index}`,
            text,
            order: index + 1,
          })));
        }

        // Use AI-extracted responsibilities
        if (extractedData.responsibilities && extractedData.responsibilities.length > 0) {
          form.setValue("responsibilities", extractedData.responsibilities.map((text, index) => ({
            id: `resp-${Date.now()}-${index}`,
            text,
            order: index + 1,
          })));
        }

        // Map other extracted fields
        if (extractedData.location && !form.getValues("location")) {
          form.setValue("location", extractedData.location);
        }

        if (extractedData.employmentType) {
          const employmentTypeMap: Record<string, 'full-time' | 'part-time' | 'contract' | 'casual'> = {
            'full-time': 'full-time',
            'fulltime': 'full-time',
            'part-time': 'part-time',
            'parttime': 'part-time',
            'contract': 'contract',
            'casual': 'casual',
          };
          const mappedType = employmentTypeMap[extractedData.employmentType.toLowerCase()];
          if (mappedType && !form.getValues("employmentType")) {
            form.setValue("employmentType", mappedType);
          }
        }

        if (extractedData.experienceLevel) {
          const experienceMap: Record<string, 'entry' | 'mid' | 'senior' | 'executive'> = {
            'entry': 'entry',
            'junior': 'entry',
            'mid': 'mid',
            'middle': 'mid',
            'senior': 'senior',
            'executive': 'executive',
            'lead': 'senior',
          };
          const mappedLevel = experienceMap[extractedData.experienceLevel.toLowerCase()];
          if (mappedLevel && !form.getValues("experienceLevel")) {
            form.setValue("experienceLevel", mappedLevel);
          }
        }

        if (extractedData.department && !form.getValues("department")) {
          form.setValue("department", extractedData.department);
        }

        // Map salary range if available
        if (extractedData.salaryRange) {
          if (extractedData.salaryRange.min && !form.getValues("salaryMin")) {
            form.setValue("salaryMin", extractedData.salaryRange.min);
          }
          if (extractedData.salaryRange.max && !form.getValues("salaryMax")) {
            form.setValue("salaryMax", extractedData.salaryRange.max);
          }
          if (extractedData.salaryRange.currency && !form.getValues("salaryCurrency")) {
            form.setValue("salaryCurrency", extractedData.salaryRange.currency);
          }
          if (extractedData.salaryRange.period) {
            const periodMap: Record<string, 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual'> = {
              'hourly': 'hourly',
              'hour': 'hourly',
              'daily': 'daily',
              'day': 'daily',
              'weekly': 'weekly',
              'week': 'weekly',
              'monthly': 'monthly',
              'month': 'monthly',
              'annual': 'annual',
              'yearly': 'annual',
              'year': 'annual',
            };
            const mappedPeriod = periodMap[extractedData.salaryRange.period.toLowerCase()];
            if (mappedPeriod && !form.getValues("salaryPeriod")) {
              form.setValue("salaryPeriod", mappedPeriod);
            }
          }
        }

        toast({
          title: "Content Generated from AI!",
          description: "Job details extracted from your document. Review and edit as needed.",
        });
      } else if (positionDescText) {
        // Fallback to pattern matching if no AI data but text exists
        const description = extractDescription(positionDescText);
        const requirements = extractRequirements(positionDescText);
        const responsibilities = extractResponsibilities(positionDescText);

        form.setValue("description", description);
        form.setValue("requirements", requirements.map((text, index) => ({
          id: `req-${Date.now()}-${index}`,
          text,
          order: index + 1,
        })) as any);
        form.setValue("responsibilities", responsibilities.map((text, index) => ({
          id: `resp-${Date.now()}-${index}`,
          text,
          order: index + 1,
        })) as any);

        toast({
          title: "Content Generated from Position Description!",
          description: "Job details extracted using pattern matching. Review and edit as needed.",
        });
      } else {
        // Priority 3: Call backend AI API with ALL available form fields
        const jobTitle = form.getValues("title");
        if (!jobTitle) {
          toast({
            title: "Title Required",
            description: "Please enter a job title first.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        // Get ALL available form data
        const allFormData = form.getValues();
        console.log('📤 Calling API with form data:', allFormData);

        // Call backend API with ALL available fields
        const { jobDescriptionService } = await import('@/shared/lib/api/jobDescriptionService');
        let generated;
        try {
          generated = await jobDescriptionService.generateDescription(allFormData);
          console.log('✅ Generated content received:', generated);
        } catch (error) {
          console.error('❌ Error generating description:', error);
          throw error;
        }

        if (!generated) {
          console.error('❌ Generated content is null/undefined');
          throw new Error('No content generated');
        }

        console.log('📝 Generated content:', generated);

        // Fill form with generated content
        // Always set description (user can edit if needed)
        if (generated && generated.description) {
          console.log('📝 Setting description (length:', generated.description.length, ')');
          console.log('📝 Description preview:', generated.description.substring(0, 200));

          // Convert plain text to HTML paragraphs for RichTextEditor
          // Handle both \n\n (double newlines) and \n (single newlines)
          const htmlDescription = generated.description
            .split(/\n\n+/)
            .filter(para => para.trim().length > 0)
            .map(para => {
              // Split by single newlines within paragraphs and wrap in <p> tags
              const lines = para.split('\n').filter(line => line.trim().length > 0);
              return lines.map(line => `<p>${line.trim()}</p>`).join('');
            })
            .join('');

          console.log('📝 HTML description (length:', htmlDescription.length, '):', htmlDescription.substring(0, 300));

          try {
            // Set the form value
            form.setValue("description", htmlDescription, { shouldValidate: true, shouldDirty: true });
            console.log('✅ Description set in form');

            // Force form to update and trigger re-render
            await form.trigger("description");
            console.log('✅ Form validation triggered');

            // Small delay to ensure React has processed the update
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log('✅ Update complete');
          } catch (error) {
            console.error('❌ Error setting description:', error);
          }
        } else {
          console.error('❌ Generated description is missing:', generated);
        }

        // Set requirements (replace if empty, merge if existing)
        const existingReqs = form.getValues("requirements") || [];
        if (existingReqs.length === 0) {
          const newReqs = generated.requirements.map((text, index) => ({
            id: `req-${Date.now()}-${index}`,
            text,
            order: index + 1,
          }));
          console.log('Setting requirements:', newReqs);
          form.setValue("requirements", newReqs, { shouldValidate: true, shouldDirty: true });
        } else {
          // Merge: add new requirements that don't already exist
          const existingTexts = existingReqs.map(r => typeof r === 'string' ? r : r.text);
          const newReqs = generated.requirements
            .filter(text => !existingTexts.some(existing => existing.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(existing.toLowerCase())))
            .map((text, index) => ({
              id: `req-${Date.now()}-${existingReqs.length + index}`,
              text,
              order: existingReqs.length + index + 1,
            }));
          if (newReqs.length > 0) {
            console.log('Merging requirements:', newReqs);
            form.setValue("requirements", [...existingReqs, ...newReqs] as any, { shouldValidate: true, shouldDirty: true });
          }
        }

        // Set responsibilities (replace if empty, merge if existing)
        const existingResps = form.getValues("responsibilities") || [];
        if (existingResps.length === 0) {
          const newResps = generated.responsibilities.map((text, index) => ({
            id: `resp-${Date.now()}-${index}`,
            text,
            order: index + 1,
          }));
          console.log('Setting responsibilities:', newResps);
          form.setValue("responsibilities", newResps, { shouldValidate: true, shouldDirty: true });
        } else {
          // Merge: add new responsibilities that don't already exist
          const existingTexts = existingResps.map(r => typeof r === 'string' ? r : r.text);
          const newResps = generated.responsibilities
            .filter(text => !existingTexts.some(existing => existing.toLowerCase().includes(text.toLowerCase()) || text.toLowerCase().includes(existing.toLowerCase())))
            .map((text, index) => ({
              id: `resp-${Date.now()}-${existingResps.length + index}`,
              text,
              order: existingResps.length + index + 1,
            }));
          if (newResps.length > 0) {
            console.log('Merging responsibilities:', newResps);
            form.setValue("responsibilities", [...existingResps, ...newResps] as any, { shouldValidate: true, shouldDirty: true });
          }
        }

        toast({
          title: "AI Content Generated!",
          description: "Job description generated using AI with all available form fields. Review and edit as needed.",
        });
      }

      setIsGenerating(false);
      setOpen(false);
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const positionDescText = form.watch("positionDescriptionText");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Wand2 className="h-4 w-4 mr-2 text-primary" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Job Description Generator
          </DialogTitle>
          <DialogDescription>
            {positionDescText
              ? "AI will extract job details from your uploaded position description."
              : "Our AI will generate a comprehensive job description based on the basic details you've provided."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {positionDescText && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Position Description Detected</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI will extract job details from your uploaded document.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!positionDescText && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    💡 Pro Tip: Better Results with a Position Description
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1.5 leading-relaxed">
                    Upload a Position Description document above and the AI will extract
                    specific details from it, creating a more accurate and detailed job posting.
                  </p>
                  {onScrollToUpload && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-100 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-800"
                      onClick={handleUploadNow}
                    >
                      <Upload className="h-3.5 w-3.5 mr-2" />
                      Upload Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-secondary/10 rounded-lg">
            <h4 className="font-medium mb-2">What we'll generate:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Compelling job description</li>
              <li>• Key requirements and qualifications</li>
              <li>• Core responsibilities and duties</li>
            </ul>
          </div>

          {!form.getValues("title") && (
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md text-sm">
              <p className="text-warning">Please fill in at least the job title in Step 1 for better AI generation.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !form.getValues("title")}>
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
