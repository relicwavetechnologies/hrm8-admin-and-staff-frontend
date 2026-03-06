import { FormBuilder, FormSchema } from '../FormBuilder';
import { toast } from 'sonner';

/**
 * Example demonstrating dynamic form generation
 * Perfect for CMS-driven forms or rapid prototyping
 */
export function FormBuilderExample() {
  // Define form schema in JSON
  const employeeFormSchema: FormSchema = {
    id: 'employee-form',
    title: 'Add New Employee',
    description: 'Fill in the employee details below',
    layout: 'two-column',
    submitLabel: 'Create Employee',
    cancelLabel: 'Cancel',
    fields: [
      {
        name: 'firstName',
        type: 'text',
        label: 'First Name',
        placeholder: 'John',
        required: true,
        gridSpan: 1,
      },
      {
        name: 'lastName',
        type: 'text',
        label: 'Last Name',
        placeholder: 'Doe',
        required: true,
        gridSpan: 1,
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'john.doe@example.com',
        required: true,
        gridSpan: 1,
      },
      {
        name: 'phone',
        type: 'tel',
        label: 'Phone',
        placeholder: '+1 (555) 000-0000',
        gridSpan: 1,
      },
      {
        name: 'department',
        type: 'select',
        label: 'Department',
        required: true,
        options: [
          { value: 'engineering', label: 'Engineering' },
          { value: 'sales', label: 'Sales' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'hr', label: 'HR' },
        ],
        gridSpan: 1,
      },
      {
        name: 'startDate',
        type: 'date',
        label: 'Start Date',
        required: true,
        gridSpan: 1,
      },
      {
        name: 'skills',
        type: 'multiselect',
        label: 'Skills',
        placeholder: 'Add skills',
        suggestions: [
          'JavaScript',
          'TypeScript',
          'React',
          'Node.js',
          'Python',
          'Leadership',
          'Communication',
        ],
        gridSpan: 2,
      },
      {
        name: 'bio',
        type: 'textarea',
        label: 'Bio',
        placeholder: 'Tell us about yourself...',
        rows: 4,
        gridSpan: 2,
      },
      {
        name: 'resume',
        type: 'file',
        label: 'Resume',
        accept: '.pdf,.doc,.docx',
        maxSize: 5,
        description: 'Upload resume (PDF or Word, max 5MB)',
        gridSpan: 2,
      },
      {
        name: 'sendWelcomeEmail',
        type: 'checkbox',
        label: 'Send welcome email',
        defaultValue: true,
        gridSpan: 2,
      },
    ],
  };

  const handleSubmit = async (data: any) => {
    console.log('Form submitted:', data);
    toast.success('Employee created successfully!');
    // Handle form submission
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    toast.info('Form cancelled');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormBuilder
        schema={employeeFormSchema}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
