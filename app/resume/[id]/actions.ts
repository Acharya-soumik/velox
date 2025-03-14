'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteResumeAction(resumeId: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  try {
    // Delete associated cover letters first
    await supabase
      .from("cover_letters")
      .delete()
      .eq("resume_id", resumeId);

    // Delete resume versions
    await supabase
      .from("resume_versions")
      .delete()
      .eq("resume_id", resumeId);

    // Delete the resume
    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resumeId)
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/resume");
    redirect("/resume");
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
} 