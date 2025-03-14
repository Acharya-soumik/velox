import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { CreateProblemInput, Pattern, Problem, Topic } from '@/types';

const createClient = async () => {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin privileges
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.error('Error setting cookie:', error);
          }
        },
      },
    }
  );
};

export const db = {
  problems: {
    async create(input: CreateProblemInput): Promise<Problem> {
      const supabase = await createClient();
      
      try {
        // Start a transaction
        const { data: problem, error: problemError } = await supabase
          .from('problems')
          .insert({
            title: input.title,
            description: input.description,
            difficulty: input.difficulty,
            category: input.category,
            examples: input.examples,
            constraints: input.constraints,
            test_cases: input.test_cases,
            time_complexity: input.time_complexity,
            space_complexity: input.space_complexity,
            context: input.context
          })
          .select()
          .single();

        if (problemError) {
          console.error('Error creating problem:', problemError);
          throw problemError;
        }

        // Link patterns
        if (input.pattern_ids.length > 0) {
          const { error: patternsError } = await supabase
            .from('problem_patterns')
            .insert(
              input.pattern_ids.map(pattern_id => ({
                problem_id: problem.id,
                pattern_id
              }))
            );
          if (patternsError) {
            console.error('Error linking patterns:', patternsError);
            throw patternsError;
          }
        }

        // Link topics
        if (input.topic_ids.length > 0) {
          const { error: topicsError } = await supabase
            .from('problem_topics')
            .insert(
              input.topic_ids.map(topic_id => ({
                problem_id: problem.id,
                topic_id
              }))
            );
          if (topicsError) {
            console.error('Error linking topics:', topicsError);
            throw topicsError;
          }
        }

        return problem;
      } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
      }
    },

    async list(pattern_id?: string, topic_id?: string): Promise<Problem[]> {
      const supabase = await createClient();
      
      // Build the base query with related patterns and topics
      let query = supabase
        .from('problems')
        .select(`
          *,
          patterns:problem_patterns(pattern:patterns(*)),
          topics:problem_topics(topic:topics(*))
        `);

      // Apply filters if provided
      if (pattern_id) {
        query = query.eq('problem_patterns.pattern_id', pattern_id);
      }
      if (topic_id) {
        query = query.eq('problem_topics.topic_id', topic_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching problems:', error);
        throw error;
      }

      // Transform the data to match the Problem type
      const transformedData = data.map(problem => ({
        ...problem,
        patterns: problem.patterns?.map((p: any) => p.pattern) || [],
        topics: problem.topics?.map((t: any) => t.topic) || []
      }));

      return transformedData;
    },

    async getById(id: string): Promise<Problem> {
      const supabase = await createClient();
      
      // Fetch problem with related patterns and topics
      const { data, error } = await supabase
        .from('problems')
        .select(`
          *,
          patterns:problem_patterns(pattern:patterns(*)),
          topics:problem_topics(topic:topics(*))
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching problem:', error);
        throw error;
      }

      // Transform the data to match the Problem type
      const transformedData = {
        ...data,
        patterns: data.patterns?.map((p: any) => p.pattern) || [],
        topics: data.topics?.map((t: any) => t.topic) || []
      };

      return transformedData;
    },

    async delete(id: string): Promise<void> {
      const supabase = await createClient();
      
      try {
        // Start a transaction by using RPC
        const { error: deleteError } = await supabase.rpc('delete_problem', {
          problem_id: id
        });

        if (deleteError) {
          console.error('Error deleting problem:', deleteError);
          throw deleteError;
        }
      } catch (error) {
        console.error('Database operation failed:', error);
        throw error;
      }
    }
  },

  patterns: {
    async list(): Promise<Pattern[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('patterns')
        .select('*');

      if (error) {
        console.error('Error fetching patterns:', error);
        throw error;
      }

      return data;
    }
  },

  topics: {
    async list(): Promise<Topic[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('topics')
        .select('*');

      if (error) {
        console.error('Error fetching topics:', error);
        throw error;
      }

      return data;
    }
  }
}; 