import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CoverLetterGenerator } from "@/components/resume/cover-letter-generator";

export default async function CoverLetterPage({
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

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Generate Cover Letter</h1>
          <p className="text-muted-foreground mt-1">
            For: {resume.title}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <CoverLetterGenerator
          resumeId={params.id}
          companyName={resume.company_name}
          jobDescription={resume.job_description}
          resumeData={resume.content}
        />
      </div>
    </div>
  );
} 