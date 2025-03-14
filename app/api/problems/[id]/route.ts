import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  req: Request,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    
    // Validate id parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Get problem details
    const problem = await db.problems.getById(id);
    
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(problem);
  } catch (error: any) {
    console.error('GET /api/problems/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    
    // Validate id parameter
    if (!id) {
      return NextResponse.json(
        { error: 'Problem ID is required' },
        { status: 400 }
      );
    }

    // Check if problem exists before deleting
    const problem = await db.problems.getById(id);
    if (!problem) {
      return NextResponse.json(
        { error: 'Problem not found' },
        { status: 404 }
      );
    }

    // Delete the problem
    await db.problems.delete(id);
    
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error('DELETE /api/problems/[id] error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: error.stack
      },
      { status: 500 }
    );
  }
} 