import { useState, KeyboardEvent } from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FormMultiSelectProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  suggestions?: string[];
  maxItems?: number;
}

export function FormMultiSelect<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  label,
  placeholder = 'Type and press Enter to add',
  description,
  className,
  disabled,
  required,
  suggestions = [],
  maxItems,
}: FormMultiSelectProps<TFieldValues>) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const values = (form.watch(name) || []) as string[];

  const addValue = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    if (maxItems && values.length >= maxItems) {
      return;
    }

    if (!values.includes(trimmedValue)) {
      form.setValue(name, [...values, trimmedValue] as any, { shouldValidate: true });
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const removeValue = (valueToRemove: string) => {
    form.setValue(
      name,
      values.filter((v: string) => v !== valueToRemove) as any,
      { shouldValidate: true }
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !values.includes(s) &&
      s.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="relative">
                <Input
                  placeholder={placeholder}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowSuggestions(inputValue.length > 0)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  disabled={disabled || (maxItems ? values.length >= maxItems : false)}
                />

                {showSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-auto">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                        onClick={() => {
                          addValue(suggestion);
                          setInputValue('');
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {values.map((value: string) => (
                    <Badge key={value} variant="secondary" className="pl-2 pr-1">
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValue(value)}
                        disabled={disabled}
                        className={cn(
                          "ml-2 hover:text-destructive transition-colors",
                          disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {maxItems && (
                <p className="text-xs text-muted-foreground">
                  {values.length} / {maxItems} items
                </p>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
