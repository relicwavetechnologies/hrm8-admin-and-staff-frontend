import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
}

export function FilterDropdown({ label, value, onChange, options }: FilterDropdownProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="min-w-[140px]">
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
  );
}
