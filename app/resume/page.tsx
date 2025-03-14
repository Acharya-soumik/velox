import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Download, PlusCircle } from "lucide-react";

export default async function ResumePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user's resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Resume Builder</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/resume/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Resume
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/resume/prompt" download>
              <Download className="mr-2 h-4 w-4" />
              Download Prompt
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Module Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert">
            <p>
              Welcome to the Resume Builder! This tool helps you create
              tailored resumes for specific job applications using AI assistance.
              Here's how to get started:
            </p>
            <ol className="list-decimal list-inside">
              <li>Download the prompt file and use it with ChatGPT</li>
              <li>Set up your profile with the generated JSON</li>
              <li>Create a new resume for each job application</li>
              <li>Get AI-powered suggestions and improvements</li>
            </ol>
          </CardContent>
        </Card>

        {/* Resumes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes?.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {resume.title || "Untitled Resume"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="text-sm text-muted-foreground">
                    {resume.company_name && (
                      <p>Company: {resume.company_name}</p>
                    )}
                    <p>
                      Created:{" "}
                      {new Date(resume.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/resume/${resume.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <Link href={`/resume/${resume.id}/cover-letter`}>
                        Generate Cover Letter
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 