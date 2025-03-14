import { nanoid } from 'nanoid';
import { streamText } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';
import { Message } from 'ai';

export const runtime = 'edge';
export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a focused problem-solving assistant. Follow these rules strictly:
1. Only answer questions related to the given programming problem
2. Keep responses short and precise (max 3-4 sentences)
3. If asked about anything unrelated, politely decline
4. Focus on clarity over completeness
5. No small talk or pleasantries`;

export async function POST(req: Request) {
  try {
    const { messages, title, description } = await req.json();

    // If messages array exists, use it directly (for continuing conversations)
    if (messages && messages.length > 0) {
      const systemMessage = {
        id: 'system',
        role: 'system' as const,
        content: `${SYSTEM_PROMPT}\nContext: Problem "${title}"`
      };

      const hasSystemMessage = messages.some((m: Message) => m.role === 'system');
      const finalMessages = hasSystemMessage ? messages : [systemMessage, ...messages];

      const result = streamText({
        model: deepseek('deepseek-chat'),
        messages: finalMessages,
        temperature: 0.3, // Lower temperature for more focused responses
        maxTokens: 200, // Limit token count for shorter responses
      });
      return result.toDataStreamResponse();
    }

    // Initial message with minimal prompt
    const initialMessages = [
      {
        id: 'system',
        role: 'system' as const,
        content: SYSTEM_PROMPT
      },
      {
        id: nanoid(),
        role: 'user' as const,
        content: `Problem: ${title}\n${description}\n\nWhat is this problem about?`
      }
    ];

    const result = streamText({
      model: deepseek('deepseek-chat'),
      messages: initialMessages,
      temperature: 0.3,
      maxTokens: 200,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 