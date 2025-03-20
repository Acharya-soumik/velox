import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get interview details with feedback
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    if (interview.status !== "completed") {
      return NextResponse.json(
        { error: "Interview feedback not available yet" },
        { status: 400 }
      );
    }

    // Return the feedback
    return NextResponse.json({
      id: interview.id,
      overallScore: interview.feedback.overallScore,
      duration: interview.duration,
      timeSpent: interview.feedback.timeSpent,
      questionFeedback: interview.feedback.questionFeedback,
      strengths: interview.feedback.strengths,
      improvements: interview.feedback.improvements,
      recommendations: interview.feedback.recommendations,
    });
  } catch (error) {
    console.error("Error fetching interview feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview feedback" },
      { status: 500 }
    );
  }
}
