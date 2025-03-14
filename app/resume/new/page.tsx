'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireModal } from "@/components/resume/questionnaire-modal";
import { useState } from "react";
import { createResumeAction, type Question, type CreateResumeResult } from "./actions";
import { useRouter } from "next/navigation";

export default function NewResumePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateResume = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createResumeAction(formData);
      
      if (!result.success || result.error) {
        setError(result.error || 'Failed to create resume');
        return;
      }
      
      if (result.resumeId) {
        setResumeId(result.resumeId);
        if (result.questions && result.questions.length > 0) {
          setQuestions(result.questions);
          setShowQuestionnaire(true);
        } else {
          // No additional questions needed, redirect to the resume page
          router.push(`/resume/${result.resumeId}`);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating resume:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionnaireSubmit = async (responses: Record<string, string | string[]>) => {
    if (!resumeId) return;

    try {
      const response = await fetch("/api/resume/update-responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
          responses,
        }),
      });

      if (response.ok) {
        router.push(`/resume/${resumeId}`);
      } else {
        throw new Error('Failed to save responses');
      }
    } catch (error) {
      console.error("Error saving responses:", error);
      setError('Failed to save responses. Please try again.');
    }
  };

  const handleQuestionnaireSkip = () => {
    if (resumeId) {
      router.push(`/resume/${resumeId}`);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Resume</h1>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <form action={handleCreateResume} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Resume Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Frontend Developer - Acme Corp"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="companyName"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Company Name
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="jobDescription"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Job Description
                  </label>
                  <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Paste the complete job description to help AI tailor your resume
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Resume"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <QuestionnaireModal
        open={showQuestionnaire}
        onOpenChange={setShowQuestionnaire}
        questions={questions}
        onSubmit={handleQuestionnaireSubmit}
        onSkip={handleQuestionnaireSkip}
      />
    </div>
  );
} 
