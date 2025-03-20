"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeEditor } from "@/components/dsa/editor/code-editor";
import {
  Timer,
  MessageCircle,
  Code,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HintModal } from "@/components/ui/hint-modal";
import { ReusableChat } from "@/components/ui/reusable-chat";
import { ExpandableTabs, TabItem } from "@/components/ui/expandable-tabs";
import { ReviewDialog } from "@/components/ui/review-dialog";
import { ReviewResponse } from "@/app/api/review/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InterviewQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  template: string;
}

interface InterviewSession {
  id: string;
  duration: number;
  questions: InterviewQuestion[];
  startTime: string;
  isMockInterview?: boolean;
}

const InterviewSession = () => {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [code, setCode] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [submissions, setSubmissions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // For mock interviews, check if the ID starts with "mock-interview"
        const isMockId =
          params?.id?.toString().startsWith("mock-interview") || false;

        // If this is a mock interview and we have it in localStorage, use that
        if (isMockId && typeof window !== "undefined") {
          const storedSession = localStorage.getItem(
            `interview_session_${params.id}`
          );
          if (storedSession) {
            try {
              const parsedSession = JSON.parse(storedSession);
              setSession(parsedSession);
              setTimeRemaining(parsedSession.duration * 60);
              setCode(parsedSession.questions[0].template || "");
              setCurrentCode(parsedSession.questions[0].template || "");
              setLoading(false);
              return;
            } catch (e) {
              console.error("Error parsing stored session:", e);
              toast.error("Failed to load mock interview data");
              setLoading(false);
              return;
            }
          } else {
            console.error("Mock interview data not found in localStorage");
            toast.error(
              "Mock interview data not found. Redirecting to setup page..."
            );

            // Wait a moment before redirecting to allow the toast to be seen
            setTimeout(() => {
              router.push("/interview");
            }, 2000);

            setLoading(false);
            return;
          }
        }

        // For regular interviews, fetch from the API
        const response = await fetch(`/api/interview/${params.id}`);
        const data = await response.json();

        // If this is a mock interview response, get data from localStorage
        if (data.isMockInterview && typeof window !== "undefined") {
          // Check if this is regenerated data
          if (data.isRegenerated) {
            console.log("Using regenerated mock interview data");
            setSession(data);
            setTimeRemaining(data.duration * 60);
            setCode(data.questions[0].template || "");
            setCurrentCode(data.questions[0].template || "");

            // Store the regenerated data
            localStorage.setItem(
              `interview_session_${params.id}`,
              JSON.stringify(data)
            );
            setLoading(false);
            return;
          }

          // We already checked localStorage above, so this is a new mock interview
          // Store it for future use
          localStorage.setItem(
            `interview_session_${params.id}`,
            JSON.stringify(data)
          );
        }

        if (!data || !data.questions || data.questions.length === 0) {
          toast.error("No questions found for this interview");
          setLoading(false);
          return;
        }

        setSession(data);
        setTimeRemaining(data.duration * 60); // Convert minutes to seconds
        setCode(data.questions[0].template || "");
        setCurrentCode(data.questions[0].template || "");
      } catch (error) {
        console.error("Failed to fetch interview session:", error);
        toast.error("Failed to load interview session");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.id]);

  useEffect(() => {
    if (timeRemaining <= 0 || !session) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleInterviewEnd();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCodeChange = (value: string | undefined) => {
    setCurrentCode(value || "");
  };

  const handleCodeReset = () => {
    const currentQuestion = session?.questions[currentQuestionIndex];
    if (currentQuestion) {
      setCode(currentQuestion.template || "");
      setCurrentCode(currentQuestion.template || "");
    }
  };

  const handleGetHint = () => {
    setIsHintModalOpen(true);
  };

  const toggleInfoPanel = () => {
    setIsInfoPanelCollapsed(!isInfoPanelCollapsed);
  };

  const handleSubmitQuestion = async () => {
    if (!session || !session.questions || session.questions.length === 0) {
      toast.error("No questions available");
      return;
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    // Always use the most current code from the editor
    const codeToSubmit =
      typeof window !== "undefined" && window.currentEditorCode
        ? window.currentEditorCode
        : currentCode;

    setSubmissions({ ...submissions, [currentQuestion.id]: codeToSubmit });

    try {
      setIsSubmitting(true);

      // Check if this is a mock problem
      const isMockProblem =
        typeof currentQuestion.id === "string" &&
        currentQuestion.id.startsWith("mock-");

      if (!isMockProblem) {
        // Submit for background review without waiting for response
        fetch(`/api/interview/${session.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: codeToSubmit,
            problemId: currentQuestion.id,
          }),
        }).catch((error) => {
          console.error("Error submitting solution in background:", error);
          // Don't show error to user since this is a background process
        });
      } else {
        // For mock problems, store a placeholder for the review
        // This will be processed at the end of the interview
        console.log("Mock solution stored for later review");
      }

      toast.success("Solution submitted successfully!");

      // Automatically move to the next question if available
      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        const nextTemplate =
          session.questions[currentQuestionIndex + 1].template || "";
        setCode(nextTemplate);
        setCurrentCode(nextTemplate);
      } else {
        // If this was the last question, prompt to finish the interview
        toast.info(
          "You've completed all questions! Click 'Finish Interview' to see your results."
        );
      }
    } catch (error) {
      console.error("Failed to submit question:", error);
      toast.error("Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewConfirm = () => {
    setIsReviewDialogOpen(false);

    // Move to the next question if available
    if (currentQuestionIndex < session!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      const nextTemplate =
        session!.questions[currentQuestionIndex + 1].template || "";
      setCode(nextTemplate);
      setCurrentCode(nextTemplate);
    }
  };

  const handleInterviewEnd = async () => {
    if (!session || !session.questions || session.questions.length === 0) {
      toast.error("No questions available");
      return;
    }

    try {
      toast.loading("Generating interview feedback...");

      // Check if we're using mock problems
      const hasMockProblems = session.questions.some(
        (q) => typeof q.id === "string" && q.id.startsWith("mock-")
      );

      if (!hasMockProblems) {
        // For real problems, send all submissions to the API
        await fetch(`/api/interview/${session.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissions }),
        });
      } else {
        // For mock problems, generate comprehensive mock feedback
        const mockFeedback = {
          id: session.id,
          overallScore: Math.floor(Math.random() * 20) + 70, // 70-90
          duration: session.duration,
          timeSpent: Math.floor(session.duration * 0.8),
          questionFeedback: session.questions.map((q, i) => {
            // Check if this question was submitted
            const wasSubmitted = submissions[q.id] !== undefined;
            const submissionQuality = Math.random(); // Random quality factor

            return {
              id: q.id,
              title: q.title,
              status: wasSubmitted
                ? submissionQuality > 0.7
                  ? "correct"
                  : submissionQuality > 0.3
                    ? "partially_correct"
                    : "incorrect"
                : "incorrect",
              timeSpent: wasSubmitted
                ? Math.floor(
                    (session.duration * 0.8) / session.questions.length
                  )
                : 0,
              feedback: wasSubmitted
                ? "Your solution addresses the core requirements of the problem."
                : "No solution submitted for this problem.",
              suggestions: wasSubmitted
                ? [
                    "Consider edge cases more carefully",
                    "Optimize time complexity where possible",
                    "Add comments to explain your approach",
                  ]
                : ["Make sure to attempt all problems in the interview"],
              complexity: {
                time: wasSubmitted ? "O(n)" : "N/A",
                space: wasSubmitted ? "O(n)" : "N/A",
              },
              score: wasSubmitted ? Math.floor(submissionQuality * 100) : 0,
            };
          }),
          strengths: [
            "Good problem-solving approach",
            "Clean and readable code",
            "Logical solution structure",
          ],
          improvements: [
            "Consider edge cases more carefully",
            "Work on optimizing solutions",
            "Practice time management during interviews",
          ],
          recommendations: [
            "Practice more problems in similar difficulty level",
            "Study time and space complexity analysis",
            "Review common algorithm patterns",
          ],
        };

        // Store mock feedback in localStorage for the feedback page
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `interview_feedback_${session.id}`,
            JSON.stringify(mockFeedback)
          );
        }
      }

      toast.dismiss();
      toast.success("Interview completed! Redirecting to feedback...");
      router.push(`/interview/${session.id}/feedback`);
    } catch (error) {
      toast.dismiss();
      console.error("Failed to complete interview:", error);
      toast.error("Failed to complete interview");
    }
  };

  // Define tabs for the expandable tabs component
  const tabs: TabItem[] = [
    {
      label: "Chat",
      icon: MessageCircle,
      type: "tab",
    },
    {
      label: "Code Analysis",
      icon: Code,
      type: "tab",
    },
    {
      type: "separator",
    },
    {
      label: "Documentation",
      icon: BookOpen,
      type: "tab",
    },
  ];

  // Modified back button handler with confirmation
  const handleBackClick = () => {
    setIsExitDialogOpen(true);
  };

  // Handle navigation away from interview
  const handleExitConfirm = () => {
    setIsExitDialogOpen(false);
    router.push("/interview");
  };

  // Submit question with confirmation
  const handleSubmitClick = () => {
    if (!session || !session.questions || session.questions.length === 0) {
      toast.error("No questions available");
      return;
    }

    const currentQuestion = session.questions[currentQuestionIndex];
    setIsSubmitDialogOpen(true);
  };

  // Actual submission after confirmation
  const handleSubmitConfirm = () => {
    setIsSubmitDialogOpen(false);

    if (!session || !session.questions || session.questions.length === 0)
      return;

    const currentQuestion = session.questions[currentQuestionIndex];
    // Mark this question as answered - fix by using Array.from
    setAnsweredQuestions(
      (prev) => new Set([...Array.from(prev), currentQuestion.id])
    );

    // Proceed with submission
    handleSubmitQuestion();
  };

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const currentQuestion = session?.questions[currentQuestionIndex];

  return (
    <>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackClick}
              className="mr-2"
            >
              Back
            </Button>
            <h1 className="text-2xl font-bold">Interview Session</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary/20 px-3 py-1 rounded-md">
              <Timer className="w-5 h-5 text-primary" />
              <span className="font-mono text-xl font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">
                Question {currentQuestionIndex + 1} of{" "}
                {session.questions.length}
              </span>
            </div>
          </div>
        </div>

        {currentQuestion ? (
          <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
            {/* Left Panel - Problem Description - 40% */}
            <div className="w-[25%] h-full overflow-auto pr-4">
              <Card className="p-6 h-full overflow-auto">
                <h2 className="text-xl font-bold mb-2">
                  {currentQuestion.title}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      currentQuestion.difficulty === "easy"
                        ? "bg-green-100 text-green-800"
                        : currentQuestion.difficulty === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className="prose max-w-none dark:prose-invert">
                  {currentQuestion.description}
                </div>
              </Card>
            </div>

            {/* Divider */}
            <div className="w-px bg-border mx-2"></div>

            {/* Right Panel - Code Editor + Chat - 60% */}
            <div className="flex-1 h-full overflow-hidden flex">
              {/* Code Editor - Flexible width */}
              <div className="flex-1 h-full overflow-hidden">
                <div className="bg-card h-full p-4 flex flex-col overflow-hidden">
                  <CodeEditor
                    defaultValue={code}
                    onChange={(value) => {
                      setCurrentCode(value || "");
                      handleCodeChange(value);
                    }}
                    onReset={handleCodeReset}
                    onGetHint={handleGetHint}
                    onSubmit={handleSubmitQuestion}
                    className="flex-1 min-h-0 overflow-hidden"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="w-px bg-border"></div>

              {/* Info Panel with Expandable Tabs - 20% */}
              <div
                className={cn(
                  "h-full transition-all duration-300 overflow-hidden",
                  isInfoPanelCollapsed ? "w-[60px]" : "w-[35%]"
                )}
              >
                <div className="h-full flex flex-col">
                  <div
                    className={cn(
                      "flex items-center p-2 border-b",
                      isInfoPanelCollapsed
                        ? "flex-col"
                        : "flex-row justify-between"
                    )}
                  >
                    {!isInfoPanelCollapsed && (
                      <ExpandableTabs
                        tabs={tabs}
                        activeIndex={activeTabIndex}
                        onChange={(index) => setActiveTabIndex(index)}
                      />
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 flex-shrink-0",
                        isInfoPanelCollapsed ? "mt-4" : "ml-2"
                      )}
                      onClick={toggleInfoPanel}
                      aria-label={
                        isInfoPanelCollapsed ? "Expand panel" : "Collapse panel"
                      }
                    >
                      {isInfoPanelCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div
                    className={cn(
                      "flex-1 overflow-hidden",
                      isInfoPanelCollapsed ? "hidden" : "block"
                    )}
                  >
                    {/* Chat Tab Content */}
                    {activeTabIndex === 0 && (
                      <div className="h-full">
                        <ReusableChat
                          apiEndpoint="/api/explain"
                          chatId={`interview-${params.id}-${currentQuestionIndex}`}
                          initialMessages={[]}
                          bodyData={{
                            title: currentQuestion?.title || "",
                            description: currentQuestion?.description || "",
                            code: currentCode,
                          }}
                          title="Problem Help"
                          promptHints={[
                            "Explain this problem",
                            "How do I solve this?",
                            "What's the optimal approach?",
                            "Help me understand the constraints",
                          ]}
                          className="h-full"
                        />
                      </div>
                    )}

                    {/* Code Analysis Tab Content */}
                    {activeTabIndex === 1 && (
                      <div className="h-full">
                        <ReusableChat
                          apiEndpoint="/api/code-analyze"
                          chatId={`interview-${params.id}-${currentQuestionIndex}-code`}
                          initialMessages={[]}
                          bodyData={{
                            title: currentQuestion?.title || "",
                            description: currentQuestion?.description || "",
                          }}
                          codeContext={currentCode}
                          title="Code Analysis"
                          promptHints={[
                            "Analyze my code",
                            "Check for edge cases",
                            "How can I optimize this?",
                            "What's the time complexity?",
                          ]}
                          className="h-full"
                        />
                      </div>
                    )}

                    {/* Docs Tab Content */}
                    {activeTabIndex === 3 && (
                      <div className="h-full">
                        <ReusableChat
                          apiEndpoint="/api/info-help"
                          chatId={`interview-${params.id}-${currentQuestionIndex}-docs`}
                          initialMessages={[]}
                          bodyData={{
                            title: currentQuestion?.title || "",
                            description: currentQuestion?.description || "",
                            topic: "documentation",
                          }}
                          title="Documentation"
                          promptHints={[
                            "Python documentation",
                            "Algorithm techniques",
                            "Data structure guides",
                            "Common patterns",
                          ]}
                          className="h-full"
                        />
                      </div>
                    )}

                    {/* Add help message */}
                    {!isInfoPanelCollapsed && (
                      <div className=" bg-blue-50 p-3 rounded-md border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <span className="font-medium">Stuck?</span> Ask the AI
                          for help using the chat panel above. You can get
                          hints, explanations, or code analysis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">No questions available</h2>
              <p>
                There are no questions available for this interview session.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/interview")}
              >
                Return to Interview Setup
              </Button>
            </div>
          </Card>
        )}

        {/* Navigation buttons */}
        {currentQuestion && (
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              disabled={
                currentQuestionIndex === 0 ||
                answeredQuestions.has(
                  session.questions[currentQuestionIndex - 1].id
                )
              }
              onClick={() => {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setCode(
                  submissions[session.questions[currentQuestionIndex - 1].id] ||
                    session.questions[currentQuestionIndex - 1].template ||
                    ""
                );
                setCurrentCode(
                  submissions[session.questions[currentQuestionIndex - 1].id] ||
                    session.questions[currentQuestionIndex - 1].template ||
                    ""
                );
              }}
            >
              Previous Question
            </Button>

            <div className="flex gap-2">
              {currentQuestionIndex < session.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitClick}
                  disabled={isSubmitting}
                  className="bg-primary"
                >
                  {isSubmitting ? "Submitting..." : "Submit & Next Question"}
                </Button>
              ) : (
                <Button
                  onClick={handleInterviewEnd}
                  disabled={isSubmitting}
                  className="bg-primary"
                >
                  Finish Interview & See Results
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Exit confirmation dialog */}
      <Dialog open={isExitDialogOpen} onOpenChange={setIsExitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>End Interview?</DialogTitle>
            <DialogDescription>
              Are you sure you want to exit? Your interview will end and any
              unsaved progress will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleExitConfirm}>
              End Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submission confirmation dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Submit Solution</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this solution? Once submitted, you
              won't be able to return to this question.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSubmitDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitConfirm}>Submit Solution</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue feedback form */}
      <div className="fixed bottom-4 left-6 ml-10">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => window.open("/feedback", "_blank")}
        >
          <span>Report Issue</span>
        </Button>
      </div>

      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
      />

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onConfirm={handleReviewConfirm}
        onReanalyze={() => {}}
        isLoading={isReviewing}
        reviewData={reviewData}
      />
    </>
  );
};

export default InterviewSession;
