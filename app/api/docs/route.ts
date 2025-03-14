import { nanoid } from 'nanoid';
import { Message } from 'ai';

// Define runtime and max duration
export const runtime = 'edge';
export const maxDuration = 60;

// System prompt for documentation assistant
const SYSTEM_PROMPT = `You are a documentation assistant specializing in programming concepts, algorithms, and data structures.
Your role is to provide clear, accurate, and helpful information about:
1. Programming language features and syntax
2. Algorithm concepts and implementations
3. Data structure designs and operations
4. Best practices and design patterns
5. Time and space complexity analysis

Provide comprehensive explanations with examples when appropriate.
Format your responses with clear headings, code blocks, and bullet points for readability.
When explaining concepts, start with a high-level overview before diving into details.
`;

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { messages: incomingMessages, topic, language } = json;

    // Create a context message with topic details
    let contextMessage = '';
    if (topic) {
      contextMessage = `\n\nYou're asking about: ${topic}`;
      if (language) {
        contextMessage += `\nPreferred programming language: ${language}`;
      }
    }

    // Prepare the response
    const responseText = `I'm here to help with documentation and explanations. ${contextMessage ? 'I see you want to learn about: ' + topic : 'What would you like to know about?'}`;

    // Return a simple response for now
    return new Response(responseText, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error in docs API:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 