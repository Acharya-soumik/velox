import { nanoid } from 'nanoid';
import { Message } from 'ai';

// Define runtime and max duration
export const runtime = 'edge';
export const maxDuration = 60;

// System prompt for code help assistant
const SYSTEM_PROMPT = `You are an expert coding assistant specializing in algorithms and data structures.
Your role is to help users with their coding problems by:
1. Explaining the problem and solution approaches
2. Identifying bugs and suggesting fixes
3. Optimizing code for better performance
4. Analyzing time and space complexity
5. Suggesting alternative approaches

Provide clear, concise explanations with code examples when appropriate.
Focus on helping the user understand the concepts rather than just giving them the answer.
`;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { messages: incomingMessages, title, description, code } = json;

    // Create a context message with problem details
    let contextMessage = '';
    if (title && description) {
      contextMessage = `\n\nThe user is working on the following problem:\nTitle: ${title}\nDescription: ${description}\n`;
      if (code) {
        contextMessage += `\nTheir current code is:\n\`\`\`python\n${code}\n\`\`\``;
      }
    }

    // Prepare the response
    const responseText = `I'm here to help with your coding problem. ${contextMessage ? 'I see you are working on: ' + title : 'What specific question do you have?'}`;

    // Return a simple response for now
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in code-help API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 