import { nanoid } from 'nanoid';
import { Message } from 'ai';

// Define runtime and max duration
export const runtime = 'edge';
export const maxDuration = 60;

// System prompt for documentation and help assistant
const SYSTEM_PROMPT = `You are an expert documentation and help assistant specializing in algorithms, data structures, and programming concepts.
Your role is to help users understand concepts and implementations by:
1. Explaining programming concepts clearly and concisely
2. Providing relevant code examples and use cases
3. Sharing best practices and design patterns
4. Offering resources for further learning
5. Breaking down complex topics into digestible parts

Focus on making explanations clear and accessible.
Use examples to illustrate concepts when helpful.
Provide context to help users understand the bigger picture.
`;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { messages: incomingMessages, title, description, topic } = json;

    // Create a context message with problem details
    let contextMessage = '';
    if (title && description) {
      contextMessage = `\n\nProviding help for the following problem:\nTitle: ${title}\nDescription: ${description}\n`;
      if (topic) {
        contextMessage += `\nFocusing on: ${topic}`;
      }
    }

    // Prepare the response
    const responseText = `I'll help explain the concepts. ${contextMessage ? 'I see you are working on: ' + title : 'What would you like to learn about?'}`;

    // Return a simple response for now
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in info-help API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 