import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    // Check if this is a mock interview
    if (id.startsWith("mock-interview")) {
      // For mock interviews, we don't need to fetch from the database
      // The client will handle this using localStorage

      // Extract topics from the ID if possible (format: mock-interview-timestamp-topic1-topic2)
      const parts = id.split("-");
      const hasTopic = parts.length > 3; // Has at least one topic after timestamp

      if (hasTopic) {
        // Extract topics starting from the 4th part
        const topics = parts.slice(3);

        // Create mock problems based on topics
        const mockProblems = topics.slice(0, 3).map((topic, index) => {
          const topicLabel = TOPICS_MAP[topic] || topic;
          const mockProblemsForTopic = MOCK_PROBLEMS_BY_TOPIC[topic] || [];
          const mockProblem = mockProblemsForTopic[
            index % mockProblemsForTopic.length
          ] || {
            title: `${topicLabel} Problem ${index + 1}`,
            description: `This is a mock problem for ${topicLabel}. Implement a solution that solves the problem efficiently.`,
            template: `def solve(input):\n    # Your solution here\n    pass`,
          };

          return {
            id: `mock-${index}-${Date.now()}`,
            title: mockProblem.title,
            description: mockProblem.description,
            difficulty: "medium",
            template: mockProblem.template,
          };
        });

        // Return regenerated mock interview data
        return NextResponse.json({
          id: id,
          duration: 30, // Default duration
          questions: mockProblems,
          startTime: new Date().toISOString(),
          isMockInterview: true,
          isRegenerated: true,
        });
      }

      return NextResponse.json({
        message: "Mock interview - client should use localStorage data",
        isMockInterview: true,
      });
    }

    const supabase = await createClient();

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

    // Get problems for this interview
    const { data: problems, error: problemsError } = await supabase
      .from("problems")
      .select("id, title, description, difficulty")
      .in("id", interview.problems);

    if (problemsError) {
      console.error("Error fetching problems:", problemsError);
      return NextResponse.json(
        { error: "Failed to fetch problems: " + problemsError.message },
        { status: 500 }
      );
    }

    if (!problems || problems.length === 0) {
      return NextResponse.json(
        { error: "No problems found for this interview" },
        { status: 404 }
      );
    }

    // Format response
    return NextResponse.json({
      id: interview.id,
      duration: interview.duration,
      questions: problems.map((problem) => ({
        id: problem.id,
        title: problem.title,
        description: problem.description,
        difficulty: problem.difficulty,
        // Generate a default template since the database doesn't have one
        template: `def solve(input):\n    # Your solution here for: ${problem.title}\n    pass`,
      })),
      startTime: interview.start_time,
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const supabase = await createClient();
    const { id } = context.params;
    const { code, problemId } = await request.json();

    // Get user session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if this is a mock interview
    if (id.startsWith("mock-interview")) {
      // For mock interviews, we don't need to save to the database
      // Just return success and let the client handle it
      return NextResponse.json({ success: true });
    }

    // Verify interview ownership and get problem details
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

    // Save submission
    const { data: submission, error: submissionError } = await supabase
      .from("interview_submissions")
      .insert({
        interview_id: id,
        problem_id: problemId,
        code,
        submitted_at: new Date().toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (submissionError) {
      throw submissionError;
    }

    // Trigger background review asynchronously
    // We don't await this so it doesn't block the response
    fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        problemId,
        interviewId: id,
        submissionId: submission.id,
      }),
    }).catch((error) => {
      console.error("Error triggering background review:", error);
      // We don't want to fail the submission if the review fails
      // The review will be processed later
    });

    return NextResponse.json({
      success: true,
      message:
        "Solution submitted successfully. Review will be processed in the background.",
    });
  } catch (error) {
    console.error("Error submitting interview solution:", error);
    return NextResponse.json(
      { error: "Failed to submit solution" },
      { status: 500 }
    );
  }
}
