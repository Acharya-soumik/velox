import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  
  try {
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

    // Delete associated cover letters first
    const { error: coverLetterError } = await supabase
      .from("cover_letters")
      .delete()
      .eq("resume_id", params.id);

    if (coverLetterError) {
      throw coverLetterError;
    }

    // Delete resume versions
    const { error: versionError } = await supabase
      .from("resume_versions")
      .delete()
      .eq("resume_id", params.id);

    if (versionError) {
      throw versionError;
    }

    // Finally, delete the resume
    const { error: resumeError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (resumeError) {
      throw resumeError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: "Failed to delete resume" },
      { status: 500 }
    );
  }
} 