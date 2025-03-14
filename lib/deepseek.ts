import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Initialize DeepSeek client with reasoning extraction
export const DeepSeek = {
  generateText: async (options: { 
    messages: { id: string; role: 'user' | 'assistant'; content: string }[]; 
    temperature?: number;
    maxTokens?: number;
  }) => {
    try {
      const result = streamText({
        model: deepseek('deepseek-reasoner'),
        messages: options.messages,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 2000,
      });

      return result.toDataStreamResponse();
    } catch (error: any) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }
}; 