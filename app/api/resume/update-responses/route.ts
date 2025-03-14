import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  
  try {
    const { resumeId, responses } = await req.json();

    // Validate input
    if (!resumeId || !responses) {
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

    // Get the current resume content
    const { data: resume, error: fetchError } = await supabase
      .from("resumes")
      .select("content")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !resume) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    // Update the resume content with the new responses
    const updatedContent = {
      ...resume.content,
      additionalInfo: responses,
      lastUpdated: new Date().toISOString()
    };

    // Save the updated content
    const { error: updateError } = await supabase
      .from("resumes")
      .update({ content: updatedContent })
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating responses:", error);
    return NextResponse.json(
      { error: "Failed to update responses" },
      { status: 500 }
    );
  }
} 