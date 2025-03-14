'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  type: 'text' | 'textarea' | 'list';
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
}

interface QuestionnaireModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: Question[];
  onSubmit: (responses: Record<string, string | string[]>) => void;
  onSkip?: () => void;
}

export function QuestionnaireModal({
  open,
  onOpenChange,
  questions,
  onSubmit,
  onSkip
}: QuestionnaireModalProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(responses);
    onOpenChange(false);
  };

  const handleSkip = () => {
    onSkip?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Additional Information Needed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <Label htmlFor={question.id}>
                {question.label}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {question.description && (
                <p className="text-sm text-muted-foreground">
                  {question.description}
                </p>
              )}
              {question.type === 'textarea' ? (
                <Textarea
                  id={question.id}
                  value={responses[question.id] || ''}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))
                  }
                  placeholder={question.placeholder}
                  required={question.required}
                />
              ) : (
                <Input
                  id={question.id}
                  value={responses[question.id] || ''}
                  onChange={(e) =>
                    setResponses((prev) => ({
                      ...prev,
                      [question.id]: e.target.value
                    }))
                  }
                  placeholder={question.placeholder}
                  required={question.required}
                />
              )}
            </div>
          ))}
          <DialogFooter className="flex gap-2">
            {onSkip && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
            )}
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 