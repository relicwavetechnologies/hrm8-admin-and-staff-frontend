import { UseFormReturn } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

export interface SelectOption {
  value: string;
  label: string;
}

interface FormInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export function FormInput({ form, name, label, placeholder, type = "text", required }: FormInputProps) {
  const error = form.formState.errors?.[name]?.message as string | undefined;
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required ? " *" : ""}
      </Label>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        {...form.register(name, { required })}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface FormSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
}

export function FormSelect({ form, name, label, options, required }: FormSelectProps) {
  const value = form.watch(name);
  const error = form.formState.errors?.[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      <Select
        value={value}
        onValueChange={(next) => form.setValue(name, next, { shouldValidate: true })}
      >
        <SelectTrigger>
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
