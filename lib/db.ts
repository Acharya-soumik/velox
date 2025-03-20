import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { CreateProblemInput, Pattern, Problem, Topic } from "@/types";

const createClient = async () => {
  const cookieStore = await cookies();

  // Create a client with the service role key but without trying to access user session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // Use anon key instead of service role
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // The `set` method was called from a Server Component.
            console.error("Error setting cookie:", error);
          }
        },
        remove(name, options) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch (error) {
            console.error("Error removing cookie:", error);
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
          .from("problems")
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
            context: input.context,
          })
          .select()
          .single();

        if (problemError) {
          console.error("Error creating problem:", problemError);
          throw problemError;
        }

        // Link patterns
        if (input.pattern_ids.length > 0) {
          const { error: patternsError } = await supabase
            .from("problem_patterns")
            .insert(
              input.pattern_ids.map((pattern_id) => ({
                problem_id: problem.id,
                pattern_id,
              }))
            );
          if (patternsError) {
            console.error("Error linking patterns:", patternsError);
            throw patternsError;
          }
        }

        // Link topics
        if (input.topic_ids.length > 0) {
          const { error: topicsError } = await supabase
            .from("problem_topics")
            .insert(
              input.topic_ids.map((topic_id) => ({
                problem_id: problem.id,
                topic_id,
              }))
            );
          if (topicsError) {
            console.error("Error linking topics:", topicsError);
            throw topicsError;
          }
        }

        return problem;
      } catch (error) {
        console.error("Database operation failed:", error);
        throw error;
      }
    },

    async list(pattern_id?: string, topic_id?: string): Promise<Problem[]> {
      const supabase = await createClient();

      // Build the base query with related patterns and topics
      let query = supabase.from("problems").select(`
          *,
          patterns:problem_patterns(pattern:patterns(*)),
          topics:problem_topics(topic:topics(*))
        `);

      // Apply filters if provided
      if (pattern_id) {
        query = query.eq("problem_patterns.pattern_id", pattern_id);
      }
      if (topic_id) {
        query = query.eq("problem_topics.topic_id", topic_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching problems:", error);
        throw error;
      }

      // Transform the data to match the Problem type
      const transformedData = data.map((problem) => ({
        ...problem,
        patterns: problem.patterns?.map((p: any) => p.pattern) || [],
        topics: problem.topics?.map((t: any) => t.topic) || [],
      }));

      return transformedData;
    },

    async getById(id: string): Promise<Problem> {
      const supabase = await createClient();

      // Fetch problem with related patterns and topics
      const { data, error } = await supabase
        .from("problems")
        .select(
          `
          *,
          patterns:problem_patterns(pattern:patterns(*)),
          topics:problem_topics(topic:topics(*))
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching problem:", error);
        throw error;
      }

      // Transform the data to match the Problem type
      const transformedData = {
        ...data,
        patterns: data.patterns?.map((p: any) => p.pattern) || [],
        topics: data.topics?.map((t: any) => t.topic) || [],
      };

      return transformedData;
    },

    async delete(id: string): Promise<void> {
      const supabase = await createClient();

      try {
        // First check if the problem exists without joining to users table
        const { data: problemExists, error: checkError } = await supabase
          .from("problems")
          .select("id")
          .eq("id", id)
          .single();

        if (checkError) {
          console.error("Error checking problem existence:", checkError);
          throw checkError;
        }

        if (!problemExists) {
          throw new Error("Problem not found");
        }

        // First delete related records in problem_patterns and problem_topics
        const { error: patternError } = await supabase
          .from("problem_patterns")
          .delete()
          .eq("problem_id", id);

        if (patternError) {
          console.error("Error deleting problem patterns:", patternError);
          throw patternError;
        }

        const { error: topicError } = await supabase
          .from("problem_topics")
          .delete()
          .eq("problem_id", id);

        if (topicError) {
          console.error("Error deleting problem topics:", topicError);
          throw topicError;
        }

        // Then delete the problem itself
        const { error: problemError } = await supabase
          .from("problems")
          .delete()
          .eq("id", id);

        if (problemError) {
          console.error("Error deleting problem:", problemError);
          throw problemError;
        }
      } catch (error) {
        console.error("Database operation failed:", error);
        throw error;
      }
    },
  },

  patterns: {
    async list(): Promise<Pattern[]> {
      const supabase = await createClient();
      const { data, error } = await supabase.from("patterns").select("*");

      if (error) {
        console.error("Error fetching patterns:", error);
        throw error;
      }

      return data;
    },
  },

  topics: {
    async list(): Promise<Topic[]> {
      const supabase = await createClient();
      const { data, error } = await supabase.from("topics").select("*");

      if (error) {
        console.error("Error fetching topics:", error);
        throw error;
      }

      return data;
    },
  },
};
