# Supabase Database Structure

## Tables Overview

The database contains 16 tables organized in a relational structure for a job preparation platform with features for coding interviews, resume building, and problem-solving practice.

| Table Name            | Record Count | Description                                          |
| --------------------- | ------------ | ---------------------------------------------------- |
| patterns              | 13           | Problem-solving patterns used to categorize problems |
| topics                | 6            | Problem topics/categories                            |
| problem_patterns      | 5            | Junction table linking problems to patterns          |
| problem_topics        | 4            | Junction table linking problems to topics            |
| interviews            | 3            | Mock interview sessions                              |
| resumes               | 3            | User resumes                                         |
| problems              | 3            | Coding problems                                      |
| problem_details       | 3            | Extended information for problems                    |
| interview_submissions | 2            | Solutions submitted during interviews                |
| progress_metrics      | 2            | User progress statistics                             |
| resume_profiles       | 1            | User profile data for resumes                        |
| user_profiles         | 1            | General user profile information                     |
| cover_letters         | 0            | Cover letter documents (empty)                       |
| users                 | 0            | User accounts (empty)                                |
| resume_versions       | 0            | Version history for resumes (empty)                  |
| progress              | 0            | User progress on problems (empty)                    |

## Key Relationships

The following foreign key relationships exist:

1. `cover_letters.resume_id` → `resumes.id`
2. `interview_submissions.interview_id` → `interviews.id`
3. `interview_submissions.problem_id` → `problems.id`
4. `problem_patterns.pattern_id` → `patterns.id`
5. `problem_patterns.problem_id` → `problems.id`
6. `problem_topics.problem_id` → `problems.id`
7. `problem_topics.topic_id` → `topics.id`
8. `progress.problem_id` → `problems.id`
9. `resume_versions.resume_id` → `resumes.id`
10. `resumes.profile_id` → `resume_profiles.id`

## Table Schema Details

### users

- `id` (uuid, NOT NULL) - Primary key
- `email` (text, NOT NULL)
- `name` (text)
- `image` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### problems

- `id` (uuid, NOT NULL) - Primary key
- `title` (text, NOT NULL)
- `description` (text, NOT NULL)
- `difficulty` (text, NOT NULL)
- `category` (text, NOT NULL)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
- `examples` (jsonb)
- `constraints` (ARRAY)
- `test_cases` (jsonb)
- `time_complexity` (text)
- `space_complexity` (text)
- `context` (text, NOT NULL)

### topics

- `id` (uuid, NOT NULL) - Primary key
- `name` (text, NOT NULL)
- `description` (text)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### patterns

- `id` (uuid, NOT NULL) - Primary key
- `name` (text, NOT NULL)
- `description` (text)
- `created_at` (timestamp with time zone, NOT NULL)
- `updated_at` (timestamp with time zone, NOT NULL)

### interviews

- `id` (uuid, NOT NULL) - Primary key
- `user_id` (uuid, NOT NULL)
- `duration` (integer, NOT NULL)
- `difficulty` (text, NOT NULL)
- `topics` (ARRAY, NOT NULL)
- `company_type` (text, NOT NULL)
- `problems` (ARRAY, NOT NULL)
- `start_time` (timestamp with time zone, NOT NULL)
- `completed_at` (timestamp with time zone)
- `status` (text, NOT NULL)
- `feedback` (jsonb)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
- `target_companies` (ARRAY)

### resumes

- `id` (uuid, NOT NULL) - Primary key
- `user_id` (uuid, NOT NULL)
- `profile_id` (uuid, NOT NULL) - References resume_profiles.id
- `title` (text, NOT NULL)
- `company_name` (text, NOT NULL)
- `job_description` (text, NOT NULL)
- `content` (jsonb, NOT NULL)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### resume_profiles

- `id` (uuid, NOT NULL) - Primary key
- `user_id` (uuid, NOT NULL)
- `profile_data` (jsonb, NOT NULL)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)

### user_profiles

- `id` (uuid, NOT NULL) - Primary key
- `user_id` (uuid, NOT NULL)
- `profile_data` (jsonb, NOT NULL)
- `created_at` (timestamp with time zone)
- `updated_at` (timestamp with time zone)
