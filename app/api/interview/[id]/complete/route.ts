import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient();
    const { id } = context.params;
    const { submissions } = await request.json();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get interview details
    const { data: interview, error: interviewError } = await supabase
      .from("interviews")
      .select("*, problems(*)")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (interviewError || !interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Get all submissions for this interview
    const { data: allSubmissions } = await supabase
      .from("interview_submissions")
      .select("*, problem:problems(*)")
      .eq("interview_id", id)
      .order("submitted_at", { ascending: true });

    if (!allSubmissions) {
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Calculate scores and generate feedback
    const questionFeedback = allSubmissions.map((submission) => ({
      id: submission.problem.id,
      title: submission.problem.title,
      status: submission.status || "pending",
      timeSpent: calculateTimeSpent(
        submission.submitted_at,
        interview.start_time
      ),
      feedback: submission.feedback || "Review pending",
      suggestions: submission.suggestions || [],
      complexity: {
        time: submission.time_complexity || "N/A",
        space: submission.space_complexity || "N/A",
      },
      score: submission.score || 0,
    }));

    const overallScore = Math.round(
      questionFeedback.reduce((acc, q) => acc + q.score, 0) /
        questionFeedback.length
    );

    // Generate strengths and improvements based on submissions
    const strengths = [];
    const improvements = [];

    // Analyze time management
    const totalTimeSpent = questionFeedback.reduce(
      (acc, q) => acc + q.timeSpent,
      0
    );
    if (totalTimeSpent <= interview.duration * 0.8) {
      strengths.push("Good time management - completed within allocated time");
    } else if (totalTimeSpent > interview.duration) {
      improvements.push("Work on time management - exceeded allocated time");
    }

    // Analyze solution quality
    const goodSolutions = questionFeedback.filter((q) => q.score >= 80).length;
    if (goodSolutions === questionFeedback.length) {
      strengths.push("Consistently high-quality solutions across all problems");
    } else if (goodSolutions === 0) {
      improvements.push("Focus on improving solution quality and correctness");
    }

    // Analyze complexity
    const optimalComplexity = questionFeedback.filter(
      (q) =>
        q.complexity.time !== "N/A" && !q.complexity.time.includes("suboptimal")
    ).length;
    if (optimalComplexity === questionFeedback.length) {
      strengths.push("Optimal time and space complexity in solutions");
    } else {
      improvements.push("Work on optimizing solution complexity");
    }

    // Generate recommendations based on performance
    const recommendations = [];
    if (overallScore < 70) {
      recommendations.push(
        "Practice more problems in similar difficulty level"
      );
      recommendations.push("Review fundamental data structures and algorithms");
    }
    if (totalTimeSpent > interview.duration) {
      recommendations.push("Practice solving problems under time constraints");
    }
    if (optimalComplexity < questionFeedback.length) {
      recommendations.push("Study common optimization techniques and patterns");
    }

    // Update interview status
    const { error: updateError } = await supabase
      .from("interviews")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        feedback: {
          overallScore,
          questionFeedback,
          strengths,
          improvements,
          recommendations,
        },
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      id,
      overallScore,
      duration: interview.duration,
      timeSpent: totalTimeSpent,
      questionFeedback,
      strengths,
      improvements,
      recommendations,
    });
  } catch (error) {
    console.error("Error completing interview:", error);
    return NextResponse.json(
      { error: "Failed to complete interview" },
      { status: 500 }
    );
  }
}

function calculateTimeSpent(submissionTime: string, startTime: string): number {
  return Math.round(
    (new Date(submissionTime).getTime() - new Date(startTime).getTime()) /
      (1000 * 60)
  );
}
