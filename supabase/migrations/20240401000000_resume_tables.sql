-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS cover_letters;
DROP TABLE IF EXISTS resume_versions;
DROP TABLE IF EXISTS resumes;
DROP TABLE IF EXISTS resume_profiles;

-- Create resume_profiles table
CREATE TABLE resume_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create resumes table
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES resume_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_description TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create resume_versions table
CREATE TABLE resume_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(resume_id, version_number)
);

-- Create cover_letters table
CREATE TABLE cover_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop resume_profiles policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resume profile') THEN
    DROP POLICY "Users can view their own resume profile" ON resume_profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own resume profile') THEN
    DROP POLICY "Users can update their own resume profile" ON resume_profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own resume profile') THEN
    DROP POLICY "Users can insert their own resume profile" ON resume_profiles;
  END IF;

  -- Drop resumes policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resumes') THEN
    DROP POLICY "Users can view their own resumes" ON resumes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own resumes') THEN
    DROP POLICY "Users can update their own resumes" ON resumes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own resumes') THEN
    DROP POLICY "Users can insert their own resumes" ON resumes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own resumes') THEN
    DROP POLICY "Users can delete their own resumes" ON resumes;
  END IF;

  -- Drop resume_versions policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resume versions') THEN
    DROP POLICY "Users can view their own resume versions" ON resume_versions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own resume versions') THEN
    DROP POLICY "Users can insert their own resume versions" ON resume_versions;
  END IF;

  -- Drop cover_letters policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own cover letters') THEN
    DROP POLICY "Users can view their own cover letters" ON cover_letters;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own cover letters') THEN
    DROP POLICY "Users can update their own cover letters" ON cover_letters;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own cover letters') THEN
    DROP POLICY "Users can insert their own cover letters" ON cover_letters;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own cover letters') THEN
    DROP POLICY "Users can delete their own cover letters" ON cover_letters;
  END IF;
END $$;

-- Enable Row Level Security (RLS)
ALTER TABLE resume_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Create policies for resume_profiles
CREATE POLICY "Users can view their own resume profile"
  ON resume_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume profile"
  ON resume_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume profile"
  ON resume_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for resume_versions
CREATE POLICY "Users can view their own resume versions"
  ON resume_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_versions.resume_id
    AND resumes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own resume versions"
  ON resume_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = resume_versions.resume_id
    AND resumes.user_id = auth.uid()
  ));

-- Create policies for cover_letters
CREATE POLICY "Users can view their own cover letters"
  ON cover_letters FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = cover_letters.resume_id
    AND resumes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own cover letters"
  ON cover_letters FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = cover_letters.resume_id
    AND resumes.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own cover letters"
  ON cover_letters FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = cover_letters.resume_id
    AND resumes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own cover letters"
  ON cover_letters FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM resumes
    WHERE resumes.id = cover_letters.resume_id
    AND resumes.user_id = auth.uid()
  ));

-- Drop and recreate triggers
DO $$ 
BEGIN
  -- Drop triggers if they exist
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resume_profiles_updated_at') THEN
    DROP TRIGGER update_resume_profiles_updated_at ON resume_profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_resumes_updated_at') THEN
    DROP TRIGGER update_resumes_updated_at ON resumes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cover_letters_updated_at') THEN
    DROP TRIGGER update_cover_letters_updated_at ON cover_letters;
  END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_resume_profiles_updated_at
  BEFORE UPDATE ON resume_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cover_letters_updated_at
  BEFORE UPDATE ON cover_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 