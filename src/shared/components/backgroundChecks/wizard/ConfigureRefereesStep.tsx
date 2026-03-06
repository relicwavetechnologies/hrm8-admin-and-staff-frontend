import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FormInput, FormSelect, type SelectOption } from '@/shared/components/common/form-fields';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { BackgroundCheckWizardFormData } from './SelectChecksStep';

interface ConfigureRefereesStepProps {
  form: UseFormReturn<BackgroundCheckWizardFormData>;
}

const relationshipOptions: SelectOption[] = [
  { value: 'manager', label: 'Manager / Supervisor' },
  { value: 'colleague', label: 'Colleague / Peer' },
  { value: 'direct-report', label: 'Direct Report' },
  { value: 'client', label: 'Client / Customer' },
  { value: 'other', label: 'Other' }
];

export function ConfigureRefereesStep({ form }: ConfigureRefereesStepProps) {
  const referees = form.watch('referees') || [];

  const addReferee = () => {
    form.setValue('referees', [
      ...referees,
      {
        name: '',
        email: '',
        phone: '',
        relationship: 'manager' as const,
        relationshipDetails: '',
        companyName: '',
        position: ''
      }
    ]);
  };

  const removeReferee = (index: number) => {
    form.setValue('referees', referees.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configure Reference Checks</h3>
        <p className="text-sm text-muted-foreground">
          Add at least 2 professional references. We recommend 3-5 references for comprehensive feedback.
        </p>
      </div>

      <div className="space-y-4">
        {referees.map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-base">Referee {index + 1}</CardTitle>
                </div>
                {referees.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeReferee(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={`referees.${index}.name` as any}
                  label="Full Name"
                  placeholder="John Smith"
                  required
                />
                <FormInput
                  form={form}
                  name={`referees.${index}.email` as any}
                  label="Email"
                  type="email"
                  placeholder="john.smith@company.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={`referees.${index}.phone` as any}
                  label="Phone (Optional)"
                  placeholder="+1 (555) 123-4567"
                />
                <FormSelect
                  form={form}
                  name={`referees.${index}.relationship` as any}
                  label="Relationship"
                  options={relationshipOptions}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  form={form}
                  name={`referees.${index}.companyName` as any}
                  label="Company Name (Optional)"
                  placeholder="Acme Corp"
                />
                <FormInput
                  form={form}
                  name={`referees.${index}.position` as any}
                  label="Position (Optional)"
                  placeholder="Senior Manager"
                />
              </div>

              <FormInput
                form={form}
                name={`referees.${index}.relationshipDetails` as any}
                label="Relationship Details (Optional)"
                placeholder="e.g., Direct manager for 2 years at Acme Corp"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={addReferee}
          disabled={referees.length >= 5}
          className="w-full max-w-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Referee
        </Button>

        {referees.length < 2 && (
          <p className="text-sm text-muted-foreground text-center">
            Please add at least 2 referees to continue
          </p>
        )}

        {referees.length >= 5 && (
          <p className="text-sm text-muted-foreground text-center">
            Maximum of 5 referees reached
          </p>
        )}
      </div>
    </div>
  );
}
