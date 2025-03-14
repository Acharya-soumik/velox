"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReviewResponse } from "@/app/api/review/types";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ReviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onReanalyze: (code?: string) => void;
  isLoading: boolean;
  reviewData: ReviewResponse | null;
}

// Store reviews in localStorage
const storeReview = (problemId: string, review: ReviewResponse) => {
  if (typeof window === "undefined") return;

  try {
    // Get existing reviews
    const storedReviews = localStorage.getItem("codeReviews");
    const reviews = storedReviews ? JSON.parse(storedReviews) : {};

    // Store up to 2 previous reviews per problem
    if (!reviews[problemId]) {
      reviews[problemId] = [];
    }

    // Add new review at the beginning
    reviews[problemId].unshift(review);

    // Keep only the 2 most recent reviews
    if (reviews[problemId].length > 2) {
      reviews[problemId] = reviews[problemId].slice(0, 2);
    }

    localStorage.setItem("codeReviews", JSON.stringify(reviews));
  } catch (error) {
    console.error("Error storing review:", error);
  }
};

export function ReviewDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  onReanalyze,
  isLoading,
  reviewData,
}: ReviewDialogProps) {
  const [previousReviews, setPreviousReviews] = useState<ReviewResponse[]>([]);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Get the current code from the editor
  useEffect(() => {
    if (typeof window !== "undefined" && window.currentEditorCode) {
      setCurrentCode(window.currentEditorCode);
    }
  }, [isOpen]); // Update when dialog opens

  // Check if code has changed since last review
  const hasCodeChanged =
    reviewData && reviewData.submission?.code !== currentCode;

  // Store review in localStorage when it changes
  useEffect(() => {
    if (reviewData && reviewData.metadata?.problemId) {
      // Only store if we have a complete review with submission data
      if (reviewData.submission && !reviewData.isPartial) {
        storeReview(reviewData.metadata.problemId, reviewData);
      }

      // Load previous reviews
      if (typeof window !== "undefined") {
        try {
          const storedReviews = localStorage.getItem("codeReviews");
          if (storedReviews) {
            const reviews = JSON.parse(storedReviews);
            const problemReviews = reviews[reviewData.metadata.problemId] || [];
            // Skip the current review (which is already at index 0)
            setPreviousReviews(problemReviews.slice(1));
          }
        } catch (error) {
          console.error("Error loading previous reviews:", error);
        }
      }
    }
  }, [reviewData]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "good":
        return "bg-green-500";
      case "fair":
        return "bg-yellow-500";
      case "poor":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Use the onReanalyze prop instead of implementing the function here
  const handleReanalyzeClick = () => {
    const codeToUse =
      typeof window !== "undefined" && window.currentEditorCode
        ? window.currentEditorCode
        : currentCode;

    onReanalyze(codeToUse);
  };

  // Display quick review if available
  const showQuickReview =
    isLoading &&
    reviewData?.quickReview &&
    typeof reviewData.quickReview.score === "number";

  console.log("ReviewDialog render:", {
    isLoading,
    hasReviewData: !!reviewData,
    hasQuickReview: !!reviewData?.quickReview,
    quickReviewScore: reviewData?.quickReview?.score,
    quickReviewFeedback: reviewData?.quickReview?.initialFeedback?.substring(
      0,
      20
    ),
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Code Review Results</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyzeClick}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {hasCodeChanged ? "Analyze New Code" : "Reanalyze"}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {hasCodeChanged
              ? "Your code has changed since the last review. Click 'Analyze New Code' to get updated feedback."
              : "Here's our analysis of your solution"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-6">
            {showQuickReview ? (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <h3 className="font-medium text-amber-800">
                      Quick Analysis (Full review in progress...)
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {/* Quick Score */}
                    {typeof reviewData?.quickReview?.score === "number" && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-amber-800">
                          Initial Score
                        </h4>
                        <div className="flex items-center gap-4">
                          <Progress
                            value={reviewData.quickReview.score}
                            className="h-2 flex-1 bg-amber-200"
                          />
                          <span className="font-bold text-sm text-amber-800">
                            {reviewData.quickReview.score}/100
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Quick Feedback */}
                    {reviewData?.quickReview?.initialFeedback && (
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-amber-800">
                          Initial Feedback
                        </h4>
                        <p className="text-sm text-amber-700">
                          {reviewData.quickReview.initialFeedback}
                        </p>
                      </div>
                    )}

                    {/* Complexity */}
                    <div className="grid grid-cols-2 gap-4">
                      {reviewData?.quickReview?.timeComplexity && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-amber-800">
                            Time Complexity
                          </h4>
                          <p className="text-sm text-amber-700">
                            {reviewData.quickReview.timeComplexity}
                          </p>
                        </div>
                      )}
                      {reviewData?.quickReview?.spaceComplexity && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-amber-800">
                            Space Complexity
                          </h4>
                          <p className="text-sm text-amber-700">
                            {reviewData.quickReview.spaceComplexity}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">
                    Generating detailed analysis...
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Analyzing your code...</p>
              </div>
            )}
          </div>
        ) : reviewData ? (
          <div className="space-y-6">
            {/* Score */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Score</h3>
              <div className="flex items-center gap-4">
                <Progress value={reviewData.score} className="h-3 flex-1" />
                <span className="font-bold text-lg">
                  {reviewData.score}/100
                </span>
              </div>
            </div>

            {/* Approach */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Approach</h3>
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  className={cn(
                    "capitalize",
                    getRatingColor(reviewData.approach.rating)
                  )}
                >
                  {reviewData.approach.rating}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {reviewData.approach.feedback}
                </span>
              </div>
              {reviewData.approach.details && (
                <p className="text-sm mt-2">{reviewData.approach.details}</p>
              )}
            </div>

            {/* Performance */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Performance</h3>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-medium mb-1">Time Complexity</h4>
                  <p className="text-sm font-mono bg-muted p-1 rounded">
                    {reviewData.performance.time}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Space Complexity</h4>
                  <p className="text-sm font-mono bg-muted p-1 rounded">
                    {reviewData.performance.space}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {reviewData.performance.feedback}
              </p>
              {reviewData.performance.analysis && (
                <p className="text-sm mt-2">
                  {reviewData.performance.analysis}
                </p>
              )}
            </div>

            {/* Best Practices */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                <div>
                  <h4 className="text-sm font-medium mb-1 text-green-600">
                    Pros
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {reviewData.bestPractices.pros.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1 text-red-600">
                    Cons
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {reviewData.bestPractices.cons.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
              {reviewData.bestPractices.details && (
                <p className="text-sm mt-2">
                  {reviewData.bestPractices.details}
                </p>
              )}
            </div>

            {/* Improvements */}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Suggested Improvements
              </h3>
              <ul className="list-disc list-inside text-sm space-y-2">
                {reviewData.improvements.map((improvement, i) => (
                  <li key={i}>{improvement}</li>
                ))}
              </ul>
            </div>

            {/* Overall Feedback */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Overall Feedback</h3>
              <p className="text-sm">{reviewData.overallFeedback}</p>
            </div>

            {/* Previous Reviews */}
            {previousReviews.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Previous Reviews</h3>
                <div className="space-y-2">
                  {previousReviews.map((review, index) => (
                    <div key={index} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Score: {review.score}/100
                        </span>
                        <Badge
                          className={cn(
                            "capitalize",
                            getRatingColor(review.approach.rating)
                          )}
                        >
                          {review.approach.rating}
                        </Badge>
                      </div>
                      <p className="text-sm mt-2 text-muted-foreground">
                        {review.overallFeedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No review data available
          </div>
        )}

        <DialogFooter>
          <Button onClick={onConfirm}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
