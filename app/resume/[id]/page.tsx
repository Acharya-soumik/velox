import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Pencil } from "lucide-react";
import { DeleteDialog } from "@/components/resume/delete-dialog";
import Link from "next/link";

export default async function ResumeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch resume data
  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    return redirect("/resume");
  }

  const content = resume.content as any;
  const aiAnalysis = content.aiAnalysis ? JSON.parse(content.aiAnalysis) : null;

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{resume.title}</h1>
          {resume.company_name && (
            <p className="text-muted-foreground mt-1">
              {resume.company_name}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href={`/resume/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/resume/${params.id}/download`} download>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Link>
          </Button>
          <DeleteDialog
            resumeId={params.id}
            resumeTitle={resume.title}
          />
        </div>
      </div>

      <Tabs defaultValue="resume" className="w-full">
        <TabsList>
          <TabsTrigger value="resume">Resume</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="job-description">Job Description</TabsTrigger>
        </TabsList>

        <TabsContent value="resume" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose dark:prose-invert max-w-none">
                <h2>{content.personalInfo.name}</h2>
                <p className="text-xl">{content.personalInfo.title}</p>
                
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{content.personalInfo.contact.email}</span>
                  <span>{content.personalInfo.contact.phone}</span>
                </div>

                <h3>Summary</h3>
                <p>{content.summary}</p>

                <h3>Technical Skills</h3>
                {Object.entries(content.technicalSkills).map(([category, skills]: [string, any]) => (
                  <div key={category}>
                    <h4 className="capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p>{skills.join(", ")}</p>
                  </div>
                ))}

                <h3>Experience</h3>
                {content.experience.map((exp: any, index: number) => (
                  <div key={index} className="mb-6">
                    <h4>{exp.company}</h4>
                    <p className="font-medium">{exp.position}</p>
                    <p className="text-sm text-muted-foreground">{exp.duration}</p>
                    {exp.responsibilities && (
                      <ul>
                        {exp.responsibilities.map((resp: string, i: number) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && (
                      <p className="text-sm">
                        <strong>Technologies:</strong> {exp.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                ))}

                <h3>Education</h3>
                {content.education.map((edu: any, index: number) => (
                  <div key={index} className="mb-4">
                    <h4>{edu.institution}</h4>
                    {edu.degree && <p>{edu.degree}</p>}
                    {edu.courses && (
                      <ul>
                        {edu.courses.map((course: string, i: number) => (
                          <li key={i}>{course}</li>
                        ))}
                      </ul>
                    )}
                    <p className="text-sm text-muted-foreground">{edu.year}</p>
                  </div>
                ))}

                {content.achievements && (
                  <>
                    <h3>Achievements</h3>
                    <ul>
                      {content.achievements.map((achievement: string, index: number) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis & Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              {aiAnalysis ? (
                <div className="prose dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: aiAnalysis }} />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  AI analysis is being generated. Please check back in a few moments.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-description" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Original Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert">
                <pre className="whitespace-pre-wrap">
                  {resume.job_description}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
