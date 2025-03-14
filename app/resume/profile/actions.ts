'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { DEFAULT_RESUME_DATA } from "../constants";

export async function createDefaultProfileAction() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated"
    };
  }

  try {
    // Save the default profile data
    const { error } = await supabase
      .from("resume_profiles")
      .upsert({
        user_id: user.id,
        profile_data: DEFAULT_RESUME_DATA,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error saving default profile:", error);
    return {
      error: "Failed to save profile. Please try again."
    };
  }
}

export async function saveProfileAction(formData: FormData) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Not authenticated"
    };
  }

  const jsonInput = formData.get("jsonInput") as string;
  
  try {
    const profileData = JSON.parse(jsonInput);
    
    // Validate the profile data structure
    if (!profileData.personalInfo || !profileData.experience || !profileData.education || !profileData.technicalSkills) {
      return {
        error: "Invalid profile data structure. Please make sure all required fields are present."
      };
    }

    // Save or update the profile in the database
    const { error } = await supabase
      .from("resume_profiles")
      .upsert({
        user_id: user.id,
        profile_data: profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/resume");
    return { success: true };
  } catch (error) {
    console.error("Error saving profile:", error);
    return {
      error: "Failed to save profile. Please check your JSON format and try again."
    };
  }
} 