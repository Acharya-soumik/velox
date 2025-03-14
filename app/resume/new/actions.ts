'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export interface Question {
  id: string;
  type: 'text' | 'textarea';
  label: string;
  description: string;
  placeholder: string;
  required: boolean;
}

export interface CreateResumeResult {
  success: boolean;
  resumeId?: string;
  questions?: Question[];
  error?: string;
}

export async function createResumeAction(formData: FormData): Promise<CreateResumeResult> {
  const supabase = await createClient();
  
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "Not authenticated. Please sign in."
      };
    }

    // Get form data
    const title = formData.get("title") as string;
    const companyName = formData.get("companyName") as string;
    const jobDescription = formData.get("jobDescription") as string;

    if (!title || !companyName || !jobDescription) {
      return {
        success: false,
        error: "All fields are required"
      };
    }

    // Get user's resume profile
    const { data: profile, error: profileError } = await supabase
      .from("resume_profiles")
      .select("id, profile_data")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError);
      return {
        success: false,
        error: "Resume profile not found. Please set up your profile first."
      };
    }

    // Create initial resume entry
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        profile_id: profile.id,
        title,
        company_name: companyName,
        job_description: jobDescription,
        content: profile.profile_data // Initially use profile data as is
      })
      .select()
      .single();

    if (resumeError) {
      console.error("Resume creation error:", resumeError);
      return {
        success: false,
        error: "Failed to create resume. Please try again."
      };
    }

    // Start AI analysis
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/resume/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: resume.id,
          profileData: profile.profile_data,
          jobDescription
        })
      });

      // Check for redirects
      if (response.redirected) {
        console.error("API request was redirected to:", response.url);
        return {
          success: true,
          resumeId: resume.id,
          error: "Authentication error during analysis. Please try analyzing again later."
        };
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Invalid content type:", contentType);
        return {
          success: true,
          resumeId: resume.id,
          error: "Invalid response format from analysis. Please try analyzing again later."
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI analysis failed:", errorText);
        return {
          success: true,
          resumeId: resume.id,
          error: "Resume created but AI analysis failed. You can try analyzing again later."
        };
      }

      const analysisResult = await response.json();
      
      if (!analysisResult.success || !Array.isArray(analysisResult.questions)) {
        console.error("Invalid analysis result:", analysisResult);
        return {
          success: true,
          resumeId: resume.id,
          error: "Invalid analysis result. Please try analyzing again later."
        };
      }

      return {
        success: true,
        resumeId: resume.id,
        questions: analysisResult.questions
      };
    } catch (error) {
      console.error("AI analysis error:", error);
      return {
        success: true,
        resumeId: resume.id,
        error: "Resume created but AI analysis failed. You can try analyzing again later."
      };
    }
  } catch (error) {
    console.error("Create resume action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again."
    };
  }
} 