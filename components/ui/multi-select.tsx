"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
  label: string;
  value: string;
}

export interface MultiSelectProps {
  options: Option[];
  selected: Option[];
  onChange: (options: Option[]) => void;
  className?: string;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  className,
  placeholder = "Select options...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (option: Option) => {
    onChange(selected.filter((s) => s.value !== option.value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-[40px] w-full flex-wrap items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.label}
                <button
                  className="rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(option);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            {selected.length === 0 && (
              <span className="text-sm text-muted-foreground">
                {placeholder}
              </span>
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className="max-h-[300px] overflow-auto">
          <CommandGroup>
            {options.map((option) => {
              const isSelected = selected.some((s) => s.value === option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    if (isSelected) {
                      onChange(
                        selected.filter((s) => s.value !== option.value)
                      );
                    } else {
                      onChange([...selected, option]);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isSelected ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
