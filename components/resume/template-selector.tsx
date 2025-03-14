'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ModernTemplate } from "./templates/modern";
import { ResumeData } from "@/app/resume/constants";

interface TemplateSelectorProps {
  data: ResumeData;
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const TEMPLATES = [
  {
    id: "modern",
    name: "Modern",
    description: "A clean and professional layout with a modern touch",
    component: ModernTemplate
  },
  // Add more templates here
] as const;

export function TemplateSelector({
  data,
  selectedTemplate,
  onTemplateChange
}: TemplateSelectorProps) {
  return (
    <div className="space-y-8">
      <RadioGroup
        value={selectedTemplate}
        onValueChange={onTemplateChange}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {TEMPLATES.map((template) => {
          const Template = template.component;
          return (
            <div key={template.id} className="relative">
              <RadioGroupItem
                value={template.id}
                id={template.id}
                className="sr-only"
              />
              <Label
                htmlFor={template.id}
                className="cursor-pointer block"
              >
                <Card className={`
                  transition-all
                  hover:shadow-lg
                  ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}
                `}>
                  <CardContent className="p-4">
                    <div className="aspect-[8.5/11] w-full overflow-hidden rounded border mb-4">
                      <div className="scale-[0.2] origin-top-left w-[500%] h-[500%]">
                        <Template data={data} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {template.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      <div className="flex justify-end">
        <Button
          onClick={() => onTemplateChange(selectedTemplate)}
          disabled={!selectedTemplate}
        >
          Apply Template
        </Button>
      </div>
    </div>
  );
} 