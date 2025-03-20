"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
}

interface BasicMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function BasicMultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: BasicMultiSelectProps) {
  const handleToggle = (value: string) => {
    console.log("Toggling value:", value);
    console.log("Current selected:", selected);

    if (selected.includes(value)) {
      const newSelected = selected.filter((item) => item !== value);
      console.log("New selected (after removal):", newSelected);
      onChange(newSelected);
    } else {
      const newSelected = [...selected, value];
      console.log("New selected (after addition):", newSelected);
      onChange(newSelected);
    }
  };

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected items */}
      <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
        {selected.length > 0 ? (
          selected.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option?.label || value}
                <button
                  type="button"
                  className="ml-1 rounded-full focus:outline-none"
                  onClick={() => handleRemove(value)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })
        ) : (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        )}
      </div>

      {/* Options list */}
      <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`option-${option.value}`}
                checked={selected.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`option-${option.value}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
