import { ApplicationFormConfig } from "@/shared/types/applicationForm";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/radio-group";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { FileUp } from "lucide-react";
import { questionTypeLabels } from "@/shared/lib/applicationFormUtils";

interface ApplicationFormPreviewProps {
  formConfig: ApplicationFormConfig;
}

export function ApplicationFormPreview({ formConfig }: ApplicationFormPreviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Application Preview</h3>
        <p className="text-sm text-muted-foreground">
          This is how applicants will see the application form
        </p>
      </div>

      <div className="space-y-6 p-6 border rounded-lg bg-background">
        {/* Standard Fields */}
        <div className="space-y-4">
          <h4 className="font-medium">Required Information</h4>

          {formConfig.includeStandardFields.resume.included && (
            <div className="space-y-2">
              <Label>
                Resume / CV
                {formConfig.includeStandardFields.resume.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOC, DOCX (max 5MB)
                </p>
              </div>
            </div>
          )}

          {formConfig.includeStandardFields.coverLetter.included && (
            <div className="space-y-2">
              <Label>
                Cover Letter
                {formConfig.includeStandardFields.coverLetter.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Textarea placeholder="Tell us about yourself..." rows={4} disabled />
            </div>
          )}

          {formConfig.includeStandardFields.portfolio.included && (
            <div className="space-y-2">
              <Label>
                Portfolio / Work Samples
                {formConfig.includeStandardFields.portfolio.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input placeholder="https://..." disabled />
            </div>
          )}

          {formConfig.includeStandardFields.linkedIn.included && (
            <div className="space-y-2">
              <Label>
                LinkedIn Profile
                {formConfig.includeStandardFields.linkedIn.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input placeholder="https://linkedin.com/in/..." disabled />
            </div>
          )}

          {formConfig.includeStandardFields.website.included && (
            <div className="space-y-2">
              <Label>
                Personal Website
                {formConfig.includeStandardFields.website.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
              <Input placeholder="https://..." disabled />
            </div>
          )}
        </div>

        {/* Custom Questions */}
        {formConfig.questions.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Additional Questions</h4>

            {formConfig.questions
              .sort((a, b) => a.order - b.order)
              .map((question) => (
                <div key={question.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Label className="flex-1">
                      {question.label}
                      {question.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </Label>
                    <Badge variant="outline" className="text-xs">
                      {questionTypeLabels[question.type]}
                    </Badge>
                  </div>

                  {question.description && (
                    <p className="text-sm text-muted-foreground">
                      {question.description}
                    </p>
                  )}

                  {/* Render appropriate input based on question type */}
                  {question.type === 'short_text' && (
                    <Input placeholder="Your answer..." disabled />
                  )}

                  {question.type === 'long_text' && (
                    <Textarea placeholder="Your answer..." rows={3} disabled />
                  )}

                  {question.type === 'multiple_choice' && question.options && (
                    <RadioGroup disabled>
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={option.id} />
                          <Label htmlFor={option.id} className="font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.type === 'checkbox' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox id={option.id} disabled />
                          <Label htmlFor={option.id} className="font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.type === 'dropdown' && question.options && (
                    <Select disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {question.type === 'file_upload' && (
                    <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
                      <FileUp className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      {question.validation?.fileTypes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {question.validation.fileTypes.join(', ').toUpperCase()} (max{' '}
                          {question.validation.maxFileSize || 5}MB)
                        </p>
                      )}
                    </div>
                  )}

                  {question.validation && (
                    <p className="text-xs text-muted-foreground">
                      {question.validation.minLength &&
                        `Min ${question.validation.minLength} characters. `}
                      {question.validation.maxLength &&
                        `Max ${question.validation.maxLength} characters. `}
                      {question.validation.minValue !== undefined &&
                        `Min value: ${question.validation.minValue}. `}
                      {question.validation.maxValue !== undefined &&
                        `Max value: ${question.validation.maxValue}.`}
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
