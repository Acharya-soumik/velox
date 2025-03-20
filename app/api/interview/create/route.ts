import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { Problem } from "@/types";

// Map of topic values to readable labels
const TOPICS_MAP: Record<string, string> = {
  arrays: "Arrays",
  strings: "Strings",
  linked_lists: "Linked Lists",
  trees: "Trees",
  graphs: "Graphs",
  dynamic_programming: "Dynamic Programming",
  sorting: "Sorting",
  searching: "Searching",
  recursion: "Recursion",
  backtracking: "Backtracking",
};

const MOCK_PROBLEMS_BY_TOPIC: Record<
  string,
  Array<{ title: string; description: string; template: string }>
> = {
  arrays: [
    {
      title: "Two Sum",
      description:
        "Given an array of integers `nums` and an integer `target`, return indices of the two numbers in the array such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample 1:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: Because nums[0] + nums[1] == 9, we return [0, 1].",
      template:
        "def solve(nums, target):\n    # Your solution here\n    # Return indices of two numbers that sum to target\n    pass",
    },
    {
      title: "Maximum Subarray",
      description:
        "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nExample 1:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6\nExplanation: The subarray [4,-1,2,1] has the largest sum 6.",
      template:
        "def solve(nums):\n    # Your solution here\n    # Return maximum subarray sum\n    pass",
    },
  ],
  strings: [
    {
      title: "Valid Palindrome",
      description:
        "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nExample 1:\nInput: s = 'A man, a plan, a canal: Panama'\nOutput: true\nExplanation: 'amanaplanacanalpanama' is a palindrome.",
      template:
        "def solve(s):\n    # Your solution here\n    # Return true if s is a palindrome, false otherwise\n    pass",
    },
  ],
  linked_lists: [
    {
      title: "Reverse Linked List",
      description:
        "Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nExample 1:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]",
      template:
        "class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef solve(head):\n    # Your solution here\n    # Return head of reversed linked list\n    pass",
    },
  ],
  trees: [
    {
      title: "Maximum Depth of Binary Tree",
      description:
        "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.\n\nExample 1:\nInput: root = [3,9,20,null,null,15,7]\nOutput: 3",
      template:
        "class TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef solve(root):\n    # Your solution here\n    # Return maximum depth of the tree\n    pass",
    },
  ],
  graphs: [
    {
      title: "Number of Islands",
      description:
        "Given an m x n 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.\n\nExample 1:\nInput: grid = [\n  ['1','1','1','1','0'],\n  ['1','1','0','1','0'],\n  ['1','1','0','0','0'],\n  ['0','0','0','0','0']\n]\nOutput: 1",
      template:
        "def solve(grid):\n    # Your solution here\n    # Return number of islands\n    pass",
    },
  ],
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { duration, difficulty, topics, companyType, targetCompanies } =
      await request.json();

    console.log("Received topics:", topics);
    console.log("Topics type:", typeof topics, Array.isArray(topics));
    console.log("Target companies:", targetCompanies);

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one topic" },
        { status: 400 }
      );
    }

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // First get all topics from the database to get their full information
    const { data: allTopics, error: topicsError } = await supabase
      .from("topics")
      .select("*");

    if (topicsError) {
      console.error("Error fetching topics:", topicsError);
      return NextResponse.json(
        { error: "Failed to fetch topics. Please try again." },
        { status: 500 }
      );
    }

    // Create a map for topic names for reference
    const topicNames = allTopics.reduce(
      (acc, topic) => {
        acc[topic.id] = topic.name;
        return acc;
      },
      {} as Record<string, string>
    );

    // Try to fetch real problems from the database based on topics and difficulty
    const { data: realProblems, error: problemsError } = await supabase
      .from("problems")
      .select(
        `
        id, 
        title, 
        description, 
        difficulty,
        problem_topics(topic_id),
        problem_patterns(pattern_id)
      `
      )
      .order("created_at", { ascending: false });

    console.log("Fetched real problems:", realProblems?.length || 0);

    if (problemsError) {
      console.error("Error fetching problems:", problemsError);
      return NextResponse.json(
        { error: "Failed to fetch problems from database. Please try again." },
        { status: 500 }
      );
    }

    // Also get all patterns to better understand pattern relationships
    const { data: allPatterns, error: patternsError } = await supabase
      .from("patterns")
      .select("*");

    if (patternsError) {
      console.error("Error fetching patterns:", patternsError);
    } else {
      console.log("Fetched patterns:", allPatterns?.length || 0);
    }

    // Instead of assuming related_topics, we'll just focus on the many-to-many relationship
    // between problems and patterns through the problem_patterns table
    if (!realProblems || realProblems.length === 0) {
      return NextResponse.json(
        { error: "No problems found in the database. Please contact support." },
        { status: 404 }
      );
    }

    // Filter problems that match the selected difficulty and at least one of the selected topics
    let matchingProblems = realProblems.filter((problem) => {
      // First check if difficulty matches
      const difficultyMatches = problem.difficulty === difficulty;
      if (!difficultyMatches) return false;

      // Then check if any topic matches directly
      const problemTopicIds = problem.problem_topics.map((pt) => pt.topic_id);
      return topics.some((topic) => problemTopicIds.includes(topic));
    });

    console.log(
      "Matching problems after topic filtering:",
      matchingProblems.length
    );

    // If we don't have enough matching problems, try to find any problem with the selected topics
    // regardless of difficulty
    if (matchingProblems.length < 3) {
      console.log(
        "Not enough matching problems, ignoring difficulty filter..."
      );

      // Try fetching problems without the difficulty filter
      matchingProblems = realProblems.filter((problem) => {
        // Check if any topic matches directly
        const problemTopicIds = problem.problem_topics.map((pt) => pt.topic_id);
        return topics.some((topic) => problemTopicIds.includes(topic));
      });

      console.log(
        "Matching problems after ignoring difficulty:",
        matchingProblems.length
      );
    }

    // If we still don't have enough problems, expand the search to include any problem
    // that shares a pattern with a problem that has the selected topics
    if (matchingProblems.length < 3) {
      console.log(
        "Still not enough problems, exploring pattern relationships..."
      );

      // First, collect all pattern IDs from problems that match our topics
      const relevantPatternIds = new Set<string>();

      // For all problems in the database
      realProblems.forEach((problem) => {
        // Check if this problem has any of our selected topics
        const problemTopicIds = problem.problem_topics.map((pt) => pt.topic_id);
        const hasSelectedTopic = topics.some((topic) =>
          problemTopicIds.includes(topic)
        );

        // If it has our topics, collect its patterns
        if (hasSelectedTopic) {
          problem.problem_patterns.forEach((pp) => {
            relevantPatternIds.add(pp.pattern_id);
          });
        }
      });

      console.log(
        `Found ${relevantPatternIds.size} patterns related to the selected topics`
      );

      // Now find all problems that have any of these patterns
      const patternRelatedProblems = realProblems.filter((problem) => {
        // If we already matched this problem by topic, skip it
        const problemTopicIds = problem.problem_topics.map((pt) => pt.topic_id);
        const hasSelectedTopic = topics.some((topic) =>
          problemTopicIds.includes(topic)
        );
        if (hasSelectedTopic) return false; // Already included

        // Check if this problem has any pattern that's related to our topics
        return problem.problem_patterns.some((pp) =>
          relevantPatternIds.has(pp.pattern_id)
        );
      });

      console.log(
        `Found ${patternRelatedProblems.length} additional problems through pattern relationships`
      );

      // Add these pattern-related problems to our results
      matchingProblems = [...matchingProblems, ...patternRelatedProblems];
    }

    console.log("Matching problems after filtering:", matchingProblems.length);

    // If we don't have enough matching problems, try to fetch more with a broader query
    if (matchingProblems.length < 3) {
      console.log("Not enough matching problems, trying broader query...");

      // Try fetching problems without the difficulty filter but still with topic matching
      matchingProblems = realProblems.filter((problem) => {
        // Check if any topic matches directly
        const problemTopicIds = problem.problem_topics.map((pt) => pt.topic_id);

        return topics.some((topic) => problemTopicIds.includes(topic));
      });

      console.log(
        "Matching problems after broader search:",
        matchingProblems.length
      );

      // If still no matches, use the fallback option
      if (matchingProblems.length === 0) {
        console.log(
          "No matches found, using any available problems as a last resort..."
        );

        // Just grab some random problems of the selected difficulty
        matchingProblems = realProblems.filter(
          (problem) => problem.difficulty === difficulty
        );

        // If still no matches, just take any problems
        if (matchingProblems.length === 0) {
          matchingProblems = realProblems.slice(
            0,
            Math.min(5, realProblems.length)
          );
          console.log(
            "Using any available problems as absolute fallback:",
            matchingProblems.length
          );
        }
      }
    }

    // If still no matches after pattern-based matching, use any available problems as a last resort
    if (matchingProblems.length === 0) {
      console.log(
        "No matches found, using any available problems as a last resort..."
      );

      // Just grab some random problems of the selected difficulty
      matchingProblems = realProblems.filter(
        (problem) => problem.difficulty === difficulty
      );

      // If still no matches, just take any problems
      if (matchingProblems.length === 0) {
        matchingProblems = realProblems.slice(
          0,
          Math.min(5, realProblems.length)
        );
        console.log(
          "Using any available problems as absolute fallback:",
          matchingProblems.length
        );
      }
    }

    // Check if we have any problems after filtering
    if (matchingProblems.length === 0) {
      const topicLabels = topics
        .map((topicId) => topicNames[topicId] || topicId)
        .join(", ");

      return NextResponse.json(
        {
          error: `No problems found for the selected topics: ${topicLabels}. Please select different topics or contact support.`,
        },
        { status: 404 }
      );
    }

    // Shuffle the array for randomization
    matchingProblems = [...matchingProblems].sort(() => 0.5 - Math.random());

    // Take 1-3 problems, depending on how many are available
    const maxProblems = Math.min(3, matchingProblems.length);
    // Random number of problems between 1 and maxProblems, with emphasis on 1-3
    const numProblems = Math.max(
      1,
      Math.min(3, Math.ceil(Math.random() * maxProblems))
    );

    const selectedProblems = matchingProblems.slice(0, numProblems);

    // Format the problems for the response
    const problemsToUse = selectedProblems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      // Generate a default template since the database doesn't have one
      template: `def solve(input):\n    # Your solution here for: ${problem.title}\n    pass`,
    }));

    // Determine if this is a mock interview (we now prefer real problems)
    let isMockInterview = problemsToUse.length < 3;
    let interviewId;
    let startTime = new Date().toISOString();

    if (!isMockInterview) {
      // Create a real interview in the database
      const { data: interview, error: interviewError } = await supabase
        .from("interviews")
        .insert({
          user_id: user.id,
          duration: duration,
          difficulty: difficulty,
          topics: topics,
          company_type: companyType,
          target_companies: targetCompanies || [], // Add target companies
          problems: problemsToUse.map((p) => p.id),
          start_time: startTime,
          status: "in_progress",
        })
        .select()
        .single();

      if (interviewError) {
        console.error("Error creating interview in database:", interviewError);
        isMockInterview = true; // Fall back to mock interview
      } else {
        interviewId = interview.id;
      }
    }

    if (isMockInterview) {
      // Create a mock interview ID
      interviewId = `mock-interview-${Date.now()}${topics.length > 0 ? "-" + topics.join("-") : ""}`;

      // If we need more problems, create mock ones
      if (problemsToUse.length < 3) {
        const additionalProblemsNeeded = 3 - problemsToUse.length;

        // Create mock problems based on the selected topics
        const mockProblems = topics
          .slice(0, additionalProblemsNeeded)
          .map((topic, index) => {
            const topicLabel = topicNames[topic] || TOPICS_MAP[topic] || topic;
            const mockProblemsForTopic = MOCK_PROBLEMS_BY_TOPIC[topic] || [];
            const mockProblem = mockProblemsForTopic[
              index % mockProblemsForTopic.length
            ] || {
              title: `${topicLabel} Problem ${index + 1}`,
              description: `This is a mock ${difficulty} difficulty problem for ${topicLabel}. Implement a solution that solves the problem efficiently.`,
              template: `def solve(input):\n    # Your solution here\n    pass`,
            };

            return {
              id: `mock-${index}-${Date.now()}`,
              title: mockProblem.title,
              description: mockProblem.description,
              difficulty,
              template: mockProblem.template,
            };
          });

        // Add the mock problems to our list
        problemsToUse.push(...mockProblems);
      }
    }

    // Return the interview data
    return NextResponse.json({
      id: interviewId,
      duration,
      questions: problemsToUse,
      startTime: startTime,
      isMockInterview: isMockInterview,
      companyType,
      targetCompanies: targetCompanies || [],
      questionCount: {
        real: selectedProblems.length,
        mock: problemsToUse.length - selectedProblems.length,
        total: problemsToUse.length,
      },
    });
  } catch (error) {
    console.error("Error creating interview:", error);
    return NextResponse.json(
      {
        error:
          "Failed to create interview: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}
