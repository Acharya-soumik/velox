import { db } from '@/lib/db';
import { CreateProblemInput } from '@/types';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const pattern_id = searchParams.get('pattern_id') || undefined;
    const topic_id = searchParams.get('topic_id') || undefined;

    const problems = await db.problems.list(pattern_id, topic_id);
    return NextResponse.json(problems);
  } catch (error: any) {
    console.error('GET /api/problems error:', error);
    return NextResponse.json(
      { error: error.message, details: error.stack },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const input: CreateProblemInput = await req.json();
    
    // Basic validation
    if (!input.title || !input.description || !input.difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the input for debugging
    console.log('Creating problem with input:', JSON.stringify(input, null, 2));

    const problem = await db.problems.create(input);
    return NextResponse.json(problem);
  } catch (error: any) {
    // Enhanced error logging
    console.error('POST /api/problems error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: error.stack,
        code: error.code,
        hint: error.hint
      },
      { status: 500 }
    );
  }
} 