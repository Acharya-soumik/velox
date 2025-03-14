"use client";

import { useState, useEffect } from "react";
import { Problem } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Code,
  HelpCircle,
  TrainFront,
  BookOpen,
  User,
  Bot,
  Loader2,
} from "lucide-react";
import { HintModal } from "@/components/ui/hint-modal";
import { CodeEditor } from "@/components/dsa/editor/code-editor";
import { ReviewDialog } from "@/components/ui/review-dialog";
import { ReviewResponse } from "@/app/api/review/types";
import { cn } from "@/lib/utils";
import { ProblemChat } from "@/components/dsa/problems/problem-chat";
import { ExpandableTabs, TabItem } from "@/components/ui/expandable-tabs";
import { ReusableChat } from "@/components/ui/reusable-chat";

const ProblemDetails = () => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewData, setReviewData] = useState<ReviewResponse | null>(null);
  const [code, setCode] = useState("");
  const [initialTemplate, setInitialTemplate] = useState("");
  const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState<number | null>(0);
  const [currentCode, setCurrentCode] = useState("");

  // Function to parse input example and generate function template
  const generateFunctionTemplate = (example: { input: string }) => {
    try {
      // Parse input string like "nums = [2,7,11,15], target = 9"
      const inputStr = example.input;

      // First split by commas that are not inside brackets
      const paramPairs = [];
      let currentParam = "";
      let bracketCount = 0;

      for (let i = 0; i < inputStr.length; i++) {
        const char = inputStr[i];
        if (char === "[") bracketCount++;
        else if (char === "]") bracketCount--;

        if (char === "," && bracketCount === 0) {
          paramPairs.push(currentParam.trim());
          currentParam = "";
        } else {
          currentParam += char;
        }
      }

      if (currentParam.trim()) {
        paramPairs.push(currentParam.trim());
      }

      // Extract parameter names and values
      const params = paramPairs.map((pair) => {
        const [name, value] = pair.split("=").map((p) => p.trim());
        return { name, value };
      });

      const functionParams = params.map((p) => p.name).join(", ");
      const paramValues = params.map((p) => p.value);

      // Create the function template with example usage
      return `def solution(${functionParams}):
    # Write your solution here
    pass

# Example usage:
# Input: ${example.input}
solution(${paramValues.join(", ")})`;
    } catch (error) {
      console.error("Error generating function template:", error);
      return `def solution():
    # Write your solution here
    pass`;
    }
  };

  // Fetch problem details first
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await fetch(`/api/problems/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Problem not found");
            router.push("/problems");
            return;
          }
          throw new Error("Failed to fetch problem");
        }
        const data = await res.json();
        setProblem(data);

        // Generate initial code template if examples exist
        if (data.examples && data.examples.length > 0) {
          const template = generateFunctionTemplate(data.examples[0]);
          setCode(template);
          setInitialTemplate(template);
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
        toast.error("Failed to load problem details");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [params.id, router]);

  // Initialize chat with problem data
  const {
    messages,
    isLoading: isChatLoading,
    error: chatError,
    append,
    reload,
    stop,
    setMessages,
  } = useChat({
    api: "/api/explain",
    id: params.id as string,
    initialMessages: [],
    body: {
      title: problem?.title || "",
      description: problem?.description || "",
    },
    onError: (error) => {
      toast.error("Failed to generate response. Please try again.");
      console.error("Chat error:", error);
    },
  });

  const handleExplain = async () => {
    if (!problem) return;

    try {
      setActiveTabIndex(0); // Set chat tab as active
      setIsInfoPanelCollapsed(false); // Expand the panel
      await append({
        role: "user",
        content: "Please explain this problem to me.",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to generate explanation. Please try again.");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!problem) return;

    try {
      await append({
        role: "user",
        content,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleGetHint = () => {
    setIsHintModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!problem) {
      toast.error("Problem details not found");
      return;
    }

    // Always use the most current code from the editor
    const codeToReview =
      typeof window !== "undefined" && window.currentEditorCode
        ? window.currentEditorCode
        : currentCode;

    if (!codeToReview || codeToReview.trim() === "") {
      toast.error("Please write some code before submitting");
      return;
    }

    // Open the review dialog immediately
    setIsReviewDialogOpen(true);

    // If we don't have review data yet, or the code has changed, analyze it
    const shouldAnalyze =
      !reviewData ||
      (reviewData && reviewData.submission?.code !== codeToReview);

    if (shouldAnalyze) {
      handleReanalyze(codeToReview);
    }
  };

  const handleReviewConfirm = () => {
    setIsReviewDialogOpen(false);
  };

  const handleReanalyze = async (codeToReview?: string) => {
    if (isReviewing) return;

    // Use provided code or get the latest code
    const codeToUse = codeToReview || currentCode;

    if (!codeToUse || codeToUse.trim() === "") {
      toast.error("No code to analyze");
      return;
    }

    setIsReviewing(true);
    setReviewData(null); // Reset review data
    setIsReviewDialogOpen(true); // Open dialog immediately to show loading state

    try {
      console.log("Starting code review...");
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem: {
            title: problem?.title || "",
            description: problem?.description || "",
            constraints: problem?.constraints || [],
            examples: problem?.examples || [],
            expectedComplexity: problem?.complexity || {},
          },
          submission: {
            code: codeToUse,
            language: "python",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get code review");
      }

      const reviewData = await response.json();
      console.log("Review data received:", reviewData);
      console.log("Has quickReview:", !!reviewData.quickReview);

      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        setReviewData(reviewData);
        console.log("Review data set in state");
      }, 100);
    } catch (error) {
      console.error("Error getting review:", error);
      toast.error("Failed to analyze your code. Please try again.");
      setIsReviewDialogOpen(false); // Close dialog on error
    } finally {
      setIsReviewing(false);
    }
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleCodeReset = () => {
    setCode(initialTemplate);
  };

  const handleCodeRun = (output: string) => {
    if (!problem?.examples || problem.examples.length === 0) {
      toast.error("No example inputs available");
      return;
    }

    try {
      // Extract the example input values using the same parsing logic
      const inputStr = problem.examples[0].input;

      // First split by commas that are not inside brackets
      const paramPairs = [];
      let currentParam = "";
      let bracketCount = 0;

      for (let i = 0; i < inputStr.length; i++) {
        const char = inputStr[i];
        if (char === "[") bracketCount++;
        else if (char === "]") bracketCount--;

        if (char === "," && bracketCount === 0) {
          paramPairs.push(currentParam.trim());
          currentParam = "";
        } else {
          currentParam += char;
        }
      }

      if (currentParam.trim()) {
        paramPairs.push(currentParam.trim());
      }

      // Extract parameter values
      const paramValues = paramPairs.map((pair) => {
        const [_, value] = pair.split("=").map((p) => p.trim());
        return value;
      });

      // Log the function call with example values
      console.log(
        `Running solution with example input: solution(${paramValues.join(", ")})`
      );
      toast.success("Code executed with example input");
    } catch (error) {
      console.error("Error running code:", error);
      toast.error("Failed to run code with example input");
    }
  };

  const toggleInfoPanel = () => {
    setIsInfoPanelCollapsed(!isInfoPanelCollapsed);
    if (!isInfoPanelCollapsed) {
      setActiveTabIndex(null);
    } else {
      setActiveTabIndex(0); // Select first tab when expanding
    }
  };

  const handleTabChange = (index: number) => {
    setActiveTabIndex(index);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state if problem not found
  if (!problem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Problem not found</h1>
        <button
          onClick={() => router.push("/problems")}
          className="text-primary hover:text-primary/90"
        >
          Return to problems list
        </button>
      </div>
    );
  }

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

  return (
    <>
      <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
        <div className="flex-1 w-full md:p-6 overflow-hidden">
          <div className="flex h-full rounded-lg border overflow-hidden">
            {/* Problem Description Section - 40% */}
            <div className="flex-1 h-full overflow-hidden">
              <div className="bg-card h-full p-6 overflow-y-auto">
                <div className="text-sm text-muted-foreground mb-4">
                  DSA Module
                </div>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
                    <div className="flex gap-2 mb-4">
                      <span
                        className={`px-2 py-1 rounded text-xs text-white ${
                          problem.difficulty === "easy"
                            ? "bg-green-500"
                            : problem.difficulty === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-muted">
                        {problem.category}
                      </span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p>{problem.description}</p>
                  </div>

                  {problem.examples && problem.examples.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Examples:</h3>
                      {problem.examples.map((example, index) => (
                        <div key={index} className="bg-muted/50 p-4 rounded-md">
                          <div className="mb-2">
                            <span className="font-medium">Input:</span>{" "}
                            {example.input}
                          </div>
                          <div className="mb-2">
                            <span className="font-medium">Output:</span>{" "}
                            {example.output}
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-medium">Explanation:</span>{" "}
                              {example.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {problem.constraints && problem.constraints.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Constraints:</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {problem.constraints.map((constraint, index) => (
                          <li key={index}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border"></div>

            {/* Code Editor Section - 60% */}
            <div className="flex-1 h-full overflow-hidden">
              <div className="bg-card h-full p-6 flex flex-col overflow-hidden">
                <CodeEditor
                  defaultValue={code}
                  onChange={(value) => {
                    setCurrentCode(value || "");
                    handleCodeChange(value);
                  }}
                  onRun={handleCodeRun}
                  onReset={handleCodeReset}
                  onGetHint={handleGetHint}
                  onSubmit={handleSubmit}
                  className="flex-1 min-h-0 overflow-hidden"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-border"></div>

            {/* Info Panel with Expandable Tabs - 40% */}
            <div
              className={cn(
                "h-full transition-all duration-300 overflow-hidden",
                isInfoPanelCollapsed ? "w-[60px]" : "w-[20%]"
              )}
            >
              <div className="bg-card h-full border-l flex flex-col overflow-hidden">
                <div
                  className={cn(
                    "p-2 border-b flex items-center justify-between",
                    isInfoPanelCollapsed ? "flex-col" : ""
                  )}
                >
                  <div
                    className={cn(
                      "flex-1",
                      isInfoPanelCollapsed ? "hidden" : "block"
                    )}
                  >
                    <ExpandableTabs
                      tabs={tabs}
                      activeIndex={activeTabIndex}
                      onChange={handleTabChange}
                      className="mb-2"
                    />
                  </div>

                  {isInfoPanelCollapsed && (
                    <div className="flex flex-col items-center space-y-2 py-2">
                      {tabs.map((tab, index) => {
                        if (tab.type === "separator")
                          return (
                            <div
                              key={`separator-${index}`}
                              className="w-8 h-px bg-border my-1"
                            />
                          );

                        return (
                          <Button
                            key={index}
                            variant={
                              activeTabIndex === index ? "secondary" : "ghost"
                            }
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleTabChange(index)}
                          >
                            <tab.icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
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
                        chatId={params.id as string}
                        initialMessages={[]}
                        bodyData={{
                          title: problem?.title || "",
                          description: problem?.description || "",
                          code: code,
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

                  {/* Info Tab Content */}
                  {activeTabIndex === 1 && (
                    <div className="h-full">
                      <ReusableChat
                        apiEndpoint="/api/code-analyze"
                        chatId={`${params.id}-code`}
                        initialMessages={[]}
                        bodyData={{
                          title: problem?.title || "",
                          description: problem?.description || "",
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
                        chatId={`${params.id}-docs`}
                        initialMessages={[]}
                        bodyData={{
                          title: problem?.title || "",
                          description: problem?.description || "",
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HintModal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
      />

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onConfirm={handleReviewConfirm}
        onReanalyze={handleReanalyze}
        isLoading={isReviewing}
        reviewData={reviewData}
      />
    </>
  );
};

export default ProblemDetails;
