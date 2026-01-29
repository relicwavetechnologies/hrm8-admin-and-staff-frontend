import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

interface ComboboxWithAddProps {
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

export function ComboboxWithAdd({
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  emptyText = "No options found.",
  disabled = false,
  className,
}: ComboboxWithAddProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue === value ? "" : selectedValue);
    setOpen(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {filteredOptions.length === 0 ? (
              <CommandEmpty>
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {emptyText}
                </p>
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
