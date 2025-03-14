import { nanoid } from "nanoid";
import { streamText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { Message } from "ai";

// Define runtime and max duration
export const runtime = "edge";
export const maxDuration = 60;

// System prompt for code analysis assistant
const SYSTEM_PROMPT = `You are an expert code analysis assistant specializing in algorithms and data structures.
Your role is to help users analyze and improve their code by:
1. Identifying potential bugs and edge cases
2. Suggesting optimizations for better performance
3. Analyzing time and space complexity
4. Recommending better approaches or algorithms
5. Explaining code patterns and best practices

Keep responses concise and actionable (3-4 sentences max).
Focus on providing specific guidance that will help the user solve the problem.
When suggesting improvements, explain the reasoning behind them.
If the code is incomplete or has obvious issues, provide gentle guidance on how to proceed.
`;

export async function POST(req: Request) {
  try {
    const { messages, title, description, code } = await req.json();

    // Ensure we have code to analyze when needed
    const codeToAnalyze = code || window?.currentEditorCode || "";

    // If messages array exists, use it directly (for continuing conversations)
    if (messages && messages.length > 0) {
      // Check if the last message is asking for code analysis
      const lastMessage = messages[messages.length - 1];
      const needsCodeContext =
        lastMessage.role === "user" &&
        (lastMessage.content.toLowerCase().includes("analyze") ||
          lastMessage.content.toLowerCase().includes("check") ||
          lastMessage.content.toLowerCase().includes("review"));

      // Add code context to the last message if needed and not already present
      if (
        needsCodeContext &&
        codeToAnalyze &&
        !lastMessage.content.includes("```python")
      ) {
        const updatedMessages = [...messages];
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: `${lastMessage.content}\n\nHere is my current code:\n\`\`\`python\n${codeToAnalyze}\n\`\`\``,
        };

        const systemMessage = {
          id: "system",
          role: "system" as const,
          content: `${SYSTEM_PROMPT}\nContext: Analyzing code for problem "${title}"`,
        };

        const hasSystemMessage = updatedMessages.some(
          (m: Message) => m.role === "system"
        );
        const finalMessages = hasSystemMessage
          ? updatedMessages
          : [systemMessage, ...updatedMessages];

        const result = streamText({
          model: deepseek("deepseek-chat"),
          messages: finalMessages,
          temperature: 0.3,
          maxTokens: 250,
        });
        return result.toDataStreamResponse();
      }

      const systemMessage = {
        id: "system",
        role: "system" as const,
        content: `${SYSTEM_PROMPT}\nContext: Analyzing code for problem "${title}"`,
      };

      const hasSystemMessage = messages.some(
        (m: Message) => m.role === "system"
      );
      const finalMessages = hasSystemMessage
        ? messages
        : [systemMessage, ...messages];

      const result = streamText({
        model: deepseek("deepseek-chat"),
        messages: finalMessages,
        temperature: 0.3,
        maxTokens: 250,
      });
      return result.toDataStreamResponse();
    }

    // Initial message with code analysis prompt
    const codeContext = codeToAnalyze
      ? `\n\nHere is the user's current code:\n\`\`\`python\n${codeToAnalyze}\n\`\`\``
      : "";

    const initialMessages = [
      {
        id: "system",
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
      {
        id: nanoid(),
        role: "user" as const,
        content: `Problem: ${title}\n${description}${codeContext}\n\nPlease analyze this code and provide guidance on how to improve it or complete it to solve the problem.`,
      },
    ];

    const result = streamText({
      model: deepseek("deepseek-chat"),
      messages: initialMessages,
      temperature: 0.3,
      maxTokens: 250,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("Error in code-analyze API:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
