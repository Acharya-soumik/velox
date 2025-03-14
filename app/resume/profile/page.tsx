'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveProfileAction, createDefaultProfileAction } from "./actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateDefault = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createDefaultProfileAction();
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      router.push('/resume/new');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating default profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await saveProfileAction(formData);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      router.push('/resume/new');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Profile Setup</h1>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Import Profile Data</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="mb-6">
              <Button
                onClick={handleCreateDefault}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Creating..." : "Use Default Profile Data"}
              </Button>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Or import your own profile data below
              </p>
            </div>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="jsonInput"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Paste your profile JSON data
                </label>
                <Textarea
                  id="jsonInput"
                  name="jsonInput"
                  placeholder="Paste the JSON output from ChatGPT here..."
                  className="min-h-[300px] font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Make sure your JSON includes:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Personal Information</li>
                  <li>Work Experience</li>
                  <li>Education</li>
                  <li>Skills</li>
                  <li>Projects (if any)</li>
                  <li>Certifications (if any)</li>
                </ul>
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 