import { useState, useCallback, forwardRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { JobFormData } from "@/shared/types/job";
import { Button } from "@/shared/components/ui/button";
import { FormItem, FormDescription } from "@/shared/components/ui/form";
import { FileText, Upload, X, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";
import { documentService } from "@/shared/lib/api/documentService";

interface PositionDescriptionUploadProps {
  form: UseFormReturn<JobFormData>;
  onFileProcessed?: (extractedText: string) => void;
}

export const PositionDescriptionUpload = forwardRef<HTMLDivElement, PositionDescriptionUploadProps>(
  ({ form, onFileProcessed }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [previewText, setPreviewText] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);

    const processFile = async (file: File) => {
      setIsProcessing(true);
      try {
        // Upload and parse via backend API
        const response = await documentService.parseDocument(file);

        if (response.success && response.data) {
          const extractedText = response.data.extractedText || "";

          // Store the file and extracted text
          form.setValue("positionDescriptionFile", file);
          form.setValue("positionDescriptionText", extractedText);

          // Store extracted job data for AI generator
          if (response.data.extractedData) {
            form.setValue("extractedJobData", response.data.extractedData);
          }

          setUploadedFile(file);
          setPreviewText(extractedText.slice(0, 200));

          if (onFileProcessed) {
            onFileProcessed(response.data.fullText || extractedText);
          }

          toast({
            title: "Document Parsed Successfully",
            description: response.data.extractedData?.title
              ? `Extracted: "${response.data.extractedData.title}". Click 'Generate with AI' to auto-fill form.`
              : "AI extraction ready. Click 'Generate with AI' to auto-fill form.",
          });
        } else {
          throw new Error(response.error || "Failed to parse document");
        }
      } catch (error) {
        console.error("Error processing file:", error);
        toast({
          title: "Error Processing File",
          description: error instanceof Error ? error.message : "Failed to parse document. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    const validateFile = (file: File): boolean => {
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];

      const validExtensions = ['.pdf', '.docx', '.doc', '.txt'];
      const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, Word document, or text file.",
          variant: "destructive",
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Maximum file size is 10MB.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    };

    const handleFileSelect = useCallback((file: File) => {
      if (validateFile(file)) {
        processFile(file);
      }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    };

    const removeFile = () => {
      setUploadedFile(null);
      setPreviewText("");
      form.setValue("positionDescriptionFile", null);
      form.setValue("positionDescriptionText", undefined);
      form.setValue("extractedJobData", undefined);

      toast({
        title: "File Removed",
        description: "Position description cleared.",
      });
    };

    const handleFillFormWithAI = async () => {
      setIsGenerating(true);
      try {
        const extractedData = form.getValues("extractedJobData");

        if (!extractedData) {
          toast({
            title: "No Data Available",
            description: "Please upload a document first to extract job details.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }

        // Fill form with extracted data
        if (extractedData.title && !form.getValues("title")) {
          form.setValue("title", extractedData.title);
        }

        if (extractedData.description) {
          form.setValue("description", extractedData.description);
        }

        if (extractedData.requirements && extractedData.requirements.length > 0) {
          form.setValue("requirements", extractedData.requirements.map((text, index) => ({
            id: `req-${Date.now()}-${index}`,
            text,
            order: index + 1,
          })));
        }

        if (extractedData.responsibilities && extractedData.responsibilities.length > 0) {
          form.setValue("responsibilities", extractedData.responsibilities.map((text, index) => ({
            id: `resp-${Date.now()}-${index}`,
            text,
            order: index + 1,
          })));
        }

        // Map other fields
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
          title: "Form Filled with AI Data!",
          description: "Job details have been extracted and filled. Review and edit as needed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fill form with AI data.",
          variant: "destructive",
        });
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Position Description (Optional)</h3>
        <FormItem ref={ref}>

          {!uploadedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
                isDragging ? "border-primary ring-2 ring-primary/20" : "border-primary/40",
                isProcessing && "opacity-50 pointer-events-none"
              )}
            >
              <input
                type="file"
                id="pd-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileInput}
                disabled={isProcessing}
              />

              <div className="flex flex-col items-center gap-3">
                {isProcessing ? (
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                ) : (
                  <Upload className="h-10 w-10 text-primary" />
                )}

                <div>
                  <p className="font-medium">
                    {isProcessing ? "Processing document..." : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    PDF, Word, or text document
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum file size: 10MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-secondary/5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                  <FileText className="h-5 w-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {previewText && (
                    <div className="mt-3 p-3 bg-background border rounded-md">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Preview:</p>
                      <p className="text-sm line-clamp-3">{previewText}...</p>
                    </div>
                  )}

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Ready for AI processing</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleFillFormWithAI}
                      disabled={isGenerating || !form.getValues("extractedJobData")}
                      className="w-full"
                      variant="default"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Filling Form...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Fill Form with AI Data
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <FormDescription>
            Upload a position description for AI to extract job details automatically
          </FormDescription>
        </FormItem>
      </div>
    );
  });

PositionDescriptionUpload.displayName = "PositionDescriptionUpload";
