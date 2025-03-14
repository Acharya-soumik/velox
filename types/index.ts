export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examples: Example[];
  constraints: string[];
  test_cases: TestCase[];
  time_complexity: string;
  space_complexity: string;
  context: string;
  created_at: string;
  updated_at: string;
  patterns?: Pattern[];
  topics?: Topic[];
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  input: Record<string, any>;
  output: any;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProblemInput {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  examples: Example[];
  constraints: string[];
  test_cases: TestCase[];
  time_complexity: string;
  space_complexity: string;
  context: string;
  pattern_ids: string[];
  topic_ids: string[];
} 