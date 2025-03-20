"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Brain,
  Code2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface QuestionFeedback {
  id: string;
  title: string;
  status: "correct" | "partially_correct" | "incorrect";
  timeSpent: number;
  feedback: string;
  suggestions: string[];
  complexity: {
    time: string;
    space: string;
  };
  score: number;
}

interface InterviewFeedback {
  id: string;
  overallScore: number;
  duration: number;
  timeSpent: number;
  questionFeedback: QuestionFeedback[];
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

const FeedbackPage = () => {
  const params = useParams();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        // Check if we have mock feedback in localStorage (client-side only)
        if (typeof window !== "undefined") {
          const mockFeedbackStr = localStorage.getItem(
            `interview_feedback_${params.id}`
          );
          if (mockFeedbackStr) {
            try {
              const mockFeedback = JSON.parse(mockFeedbackStr);
              setFeedback(mockFeedback);
              setLoading(false);
              return;
            } catch (e) {
              console.error("Error parsing mock feedback:", e);
            }
          }
        }

        const response = await fetch(`/api/interview/${params.id}/feedback`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch feedback");
        }

        const data = await response.json();

        if (
          !data ||
          !data.questionFeedback ||
          data.questionFeedback.length === 0
        ) {
          toast.error("No feedback available for this interview");
          setLoading(false);
          return;
        }

        setFeedback(data);
      } catch (error) {
        console.error("Failed to fetch interview feedback:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load interview feedback"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">No Feedback Available</h2>
            <p className="mb-4">
              There is no feedback available for this interview session yet.
            </p>
            <Button onClick={() => router.push("/interview")}>
              Return to Interview Setup
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "partially_correct":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "incorrect":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Interview Feedback</h1>
        <div className="flex justify-center items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Duration: {formatTime(feedback.duration)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Score: {feedback.overallScore}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Strengths
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5" />
            Areas for Improvement
          </h2>
          <ul className="list-disc list-inside space-y-2">
            {feedback.improvements.map((improvement, index) => (
              <li key={index}>{improvement}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Question Analysis</h2>
        {feedback.questionFeedback.map((question, index) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  {getStatusIcon(question.status)}
                  {question.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Time spent: {formatTime(question.timeSpent)}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold">Score: {question.score}%</span>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold">Feedback</h4>
                <p className="mt-1">{question.feedback}</p>
              </div>

              <div>
                <h4 className="font-semibold">Complexity Analysis</h4>
                <div className="mt-1">
                  <p>Time Complexity: {question.complexity.time}</p>
                  <p>Space Complexity: {question.complexity.space}</p>
                </div>
              </div>

              {question.suggestions.length > 0 && (
                <div>
                  <h4 className="font-semibold">Suggestions</h4>
                  <ul className="list-disc list-inside mt-1">
                    {question.suggestions.map((suggestion, idx) => (
                      <li key={idx}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {feedback.recommendations.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recommendations</h2>
          <ul className="list-disc list-inside space-y-2">
            {feedback.recommendations.map((recommendation, index) => (
              <li key={index}>{recommendation}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default FeedbackPage;
