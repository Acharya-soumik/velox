import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { DEFAULT_RESUME_DATA } from "@/app/resume/constants";

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const { resumeId, companyName, jobDescription, customizations } = await req.json();

    // Validate input
    if (!resumeId || !companyName || !jobDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the resume data
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // For now, we'll generate a template-based cover letter
    const coverLetter = `
Dear Hiring Manager,

I am writing to express my strong interest in the ${resume.content.personalInfo.title} position at ${companyName}. As a senior frontend developer with over 4 years of experience in building scalable web applications, I am excited about the opportunity to contribute to your team.

${customizations?.introduction || `Throughout my career, I have focused on delivering high-quality, user-centric solutions. At my current role at ${DEFAULT_RESUME_DATA.experience[0].company}, I successfully ${DEFAULT_RESUME_DATA.experience[0].responsibilities?.[0]?.toLowerCase()}`}

${customizations?.body || `I am particularly drawn to this opportunity because it aligns perfectly with my expertise in ${resume.content.technicalSkills.frontend.slice(0, 3).join(", ")}. Your job description emphasizes the need for a developer who can ${jobDescription.slice(0, 100)}... This resonates with my experience and passion for building robust frontend solutions.`}

Some key achievements that demonstrate my qualifications:
- ${resume.content.achievements[0]}
- ${DEFAULT_RESUME_DATA.experience[0].responsibilities?.[2]}

${customizations?.closing || "I am excited about the possibility of joining your team and contributing to your company's success. I would welcome the opportunity to discuss how my skills and experience align with your needs in more detail."}

Best regards,
${resume.content.personalInfo.name}
${resume.content.personalInfo.contact.email}
${resume.content.personalInfo.contact.phone}
    `.trim();

    // Save the cover letter
    const { data: savedCoverLetter, error: saveError } = await supabase
      .from("cover_letters")
      .insert({
        resume_id: resumeId,
        content: coverLetter
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return NextResponse.json({
      success: true,
      coverLetter: savedCoverLetter
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
} 