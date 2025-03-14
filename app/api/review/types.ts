export type Rating = "good" | "fair" | "poor";

export interface QuickReviewResponse {
  score: number;
  initialFeedback: string;
  timeComplexity: string;
  spaceComplexity: string;
  isPartial?: boolean;
}

export interface ReviewResponse {
  score: number;
  approach: {
    rating: Rating;
    feedback: string;
    details: string;
  };
  performance: {
    time: string;
    space: string;
    feedback: string;
    analysis: string;
  };
  bestPractices: {
    pros: string[];
    cons: string[];
    details: string;
  };
  improvements: string[];
  overallFeedback: string;
  metadata?: {
    problemId: string;
    timestamp: string;
    executionTime: string;
  };
  submission?: {
    code: string;
    language: string;
  };
  isPartial?: boolean;
  quickReview?: QuickReviewResponse;
}

export interface ReviewRequest {
  problem: {
    title: string;
    description: string;
    constraints?: string[];
    examples?: Array<{
      input: string;
      output: string;
    }>;
    expectedComplexity?: {
      time?: string;
      space?: string;
    };
  };
  submission: {
    code: string;
    language: string;
  };
}
