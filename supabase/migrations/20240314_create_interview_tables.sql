-- Create interview tables
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- in minutes
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics TEXT[] NOT NULL,
  company_type TEXT NOT NULL,
  target_companies TEXT[] DEFAULT '{}', -- Array of target company ids
  problems UUID[] NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE interview_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'correct', 'partially_correct', 'incorrect')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  suggestions TEXT[],
  time_complexity TEXT,
  space_complexity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_interview_submissions_interview_id ON interview_submissions(interview_id);
CREATE INDEX idx_interview_submissions_problem_id ON interview_submissions(problem_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_submissions_updated_at
  BEFORE UPDATE ON interview_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 