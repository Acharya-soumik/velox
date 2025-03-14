import { deepseek } from "@ai-sdk/deepseek";
import { generateObject, streamText } from "ai";
import { z } from "zod";
import { ReviewRequest, ReviewResponse, QuickReviewResponse } from "./types";

export const runtime = "edge";
export const maxDuration = 60; // Longer timeout for code review

// Add a simple memory cache with TTL for frequently analyzed patterns
const reviewCache = new Map<
  string,
  { review: ReviewResponse; timestamp: number }
>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minute TTL

// Generate a quick hash for cache keys
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

// Quick review schema for initial fast response
const quickReviewSchema = z.object({
  score: z.number().min(0).max(100),
  initialFeedback: z.string(),
  timeComplexity: z.string(),
  spaceComplexity: z.string(),
}) satisfies z.ZodType<QuickReviewResponse>;

// Validation schema for the request
const reviewRequestSchema = z.object({
  problem: z.object({
    title: z.string(),
    description: z.string(),
    constraints: z.array(z.string()).optional(),
    examples: z
      .array(
        z.object({
          input: z.string(),
          output: z.string(),
        })
      )
      .optional(),
    expectedComplexity: z
      .object({
        time: z.string().optional(),
        space: z.string().optional(),
      })
      .optional(),
  }),
  submission: z.object({
    code: z.string(),
    language: z.string(),
  }),
}) satisfies z.ZodType<ReviewRequest>;

// Review response schema
const reviewResponseSchema = z.object({
  score: z.number().min(0).max(100),
  approach: z.object({
    rating: z.enum(["good", "fair", "poor"]),
    feedback: z.string(),
    details: z.string(),
  }),
  performance: z.object({
    time: z.string(),
    space: z.string(),
    feedback: z.string(),
    analysis: z.string(),
  }),
  bestPractices: z.object({
    pros: z.array(z.string()).min(1),
    cons: z.array(z.string()).min(1),
    details: z.string(),
  }),
  improvements: z.array(z.string()).min(1),
  overallFeedback: z.string(),
}) satisfies z.ZodType<Omit<ReviewResponse, "metadata" | "submission">>;

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { problem, submission } = reviewRequestSchema.parse(json);

    // Generate a cache key based on problem and a hash of the code
    const codeHash = hashCode(submission.code);
    const cacheKey = `${problem.title}-${codeHash}`;

    // Check if we have a recent review in cache
    const now = Date.now();
    const cachedEntry = reviewCache.get(cacheKey);
    if (cachedEntry && now - cachedEntry.timestamp < CACHE_TTL) {
      return new Response(JSON.stringify(cachedEntry.review), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use a simpler approach with a single response instead of streaming
    try {
      // Start with a quick review
      console.time("quick-review");
      const { object: quickReview } = await generateObject({
        model: deepseek("deepseek-chat"),
        schema: quickReviewSchema,
        prompt: `
Analyze this code solution quickly:

Problem: ${problem.title}
Code (${submission.language}):
${submission.code}

Provide a quick assessment with:
1. An approximate score (0-100)
2. Brief initial feedback (1-2 sentences)
3. Estimated time complexity
4. Estimated space complexity`,
        temperature: 0.3,
        maxTokens: 300,
      });
      console.timeEnd("quick-review");

      // Then do the full review
      console.time("full-review");
      const { object: fullReview } = await generateObject({
        model: deepseek("deepseek-chat"),
        schema: reviewResponseSchema,
        prompt: `
You are an expert code reviewer analyzing a solution for a coding problem. 
Analyze the following code submission efficiently and accurately.

PROBLEM:
Title: ${problem.title}
${problem.description.substring(0, 300)}${problem.description.length > 300 ? "..." : ""}
${problem.constraints ? `Key constraints: ${problem.constraints.slice(0, 2).join(", ")}${problem.constraints.length > 2 ? "..." : ""}` : ""}
${problem.expectedComplexity ? `Expected complexity: Time: ${problem.expectedComplexity.time}, Space: ${problem.expectedComplexity.space}` : ""}

CODE (${submission.language}):
${submission.code}

Provide a structured review focusing on:
1. Correctness and algorithm approach
2. Time/space complexity analysis
3. Code quality assessment
4. Key improvements needed

Your analysis should be thorough but focused on the most important aspects only.`,
        temperature: 0.7,
        maxTokens: 1000,
      });
      console.timeEnd("full-review");

      // Create complete review
      const reviewWithMetadata: ReviewResponse = {
        ...fullReview,
        metadata: {
          problemId: problem.title.toLowerCase().replace(/\s+/g, "-"),
          timestamp: new Date().toISOString(),
          executionTime: "1s",
        },
        submission: {
          code: submission.code,
          language: submission.language,
        },
        // Add quick review data for reference
        quickReview: {
          score: quickReview.score,
          initialFeedback: quickReview.initialFeedback,
          timeComplexity: quickReview.timeComplexity,
          spaceComplexity: quickReview.spaceComplexity,
        },
      };

      // Store in cache
      reviewCache.set(cacheKey, {
        review: reviewWithMetadata,
        timestamp: now,
      });

      // Clean up old cache entries if cache is large
      if (reviewCache.size > 100) {
        const entries = Array.from(reviewCache.entries());
        for (const [key, value] of entries) {
          if (now - value.timestamp > CACHE_TTL) {
            reviewCache.delete(key);
          }
        }
      }

      return new Response(JSON.stringify(reviewWithMetadata), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      if (error?.text) {
        console.error("Model output:", error.text);
      }
      throw new Error("Failed to generate review");
    }
  } catch (error: any) {
    console.error("Review error:", error);
    const message = error.message || "Internal server error";
    const status = error.name === "ZodError" ? 400 : 500;

    return new Response(
      JSON.stringify({
        error: message,
        details: error.name === "ZodError" ? error.errors : undefined,
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
