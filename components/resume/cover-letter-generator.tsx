'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeData } from "@/app/resume/constants";

interface CoverLetterGeneratorProps {
  resumeId: string;
  companyName: string;
  jobDescription: string;
  resumeData: ResumeData;
  onGenerate?: (coverLetter: string) => void;
}

export function CoverLetterGenerator({
  resumeId,
  companyName,
  jobDescription,
  resumeData,
  onGenerate
}: CoverLetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [customizations, setCustomizations] = useState({
    introduction: "",
    body: "",
    closing: ""
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/resume/cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
          companyName,
          jobDescription,
          customizations: Object.keys(customizations).some(key => customizations[key as keyof typeof customizations])
            ? customizations
            : undefined
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCoverLetter(data.coverLetter.content);
        onGenerate?.(data.coverLetter.content);
      }
    } catch (error) {
      console.error("Error generating cover letter:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate">
        <TabsList>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Click the button below to generate a personalized cover letter based on your resume and the job description.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate Cover Letter"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customize Cover Letter</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="introduction">Custom Introduction</Label>
                <Textarea
                  id="introduction"
                  placeholder="Add a custom introduction paragraph..."
                  value={customizations.introduction}
                  onChange={(e) =>
                    setCustomizations(prev => ({
                      ...prev,
                      introduction: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Custom Body</Label>
                <Textarea
                  id="body"
                  placeholder="Add custom body paragraphs..."
                  value={customizations.body}
                  onChange={(e) =>
                    setCustomizations(prev => ({
                      ...prev,
                      body: e.target.value
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="closing">Custom Closing</Label>
                <Textarea
                  id="closing"
                  placeholder="Add a custom closing paragraph..."
                  value={customizations.closing}
                  onChange={(e) =>
                    setCustomizations(prev => ({
                      ...prev,
                      closing: e.target.value
                    }))
                  }
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate with Customizations"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              {coverLetter ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{coverLetter}</pre>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Generate a cover letter first to see the preview.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 