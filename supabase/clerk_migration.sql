-- ================================================================
-- MIGRATION: Update schema to support Clerk user IDs (TEXT instead of UUID)
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- ================================================================

-- Step 1: Drop existing foreign key constraints and triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can manage own skills" ON public.user_skills;
DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can manage own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can view own interviews" ON public.mock_interviews;
DROP POLICY IF EXISTS "Users can manage own interviews" ON public.mock_interviews;

-- Step 3: Drop dependent tables first
DROP TABLE IF EXISTS public.mock_interviews CASCADE;
DROP TABLE IF EXISTS public.resumes CASCADE;
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Step 4: Recreate tables with TEXT id for Clerk compatibility
CREATE TABLE public.profiles (
  id TEXT PRIMARY KEY,  -- Changed from UUID to TEXT for Clerk user IDs
  email TEXT,
  full_name TEXT,
  phone TEXT,
  location TEXT,
  avatar_url TEXT,
  
  -- Career Status
  career_status TEXT CHECK (career_status IN ('student', 'fresher', 'experienced', 'career-switch')),
  years_of_experience TEXT,
  current_company TEXT,
  job_title TEXT,
  
  -- Education
  qualification TEXT,
  university TEXT,
  field_of_study TEXT,
  graduation_year TEXT,
  
  -- Career Goals
  target_roles TEXT,
  preferred_industries TEXT,
  expected_salary TEXT,
  work_type TEXT CHECK (work_type IN ('remote', 'hybrid', 'onsite', 'any')),
  
  -- Profile Status
  onboarding_completed BOOLEAN DEFAULT FALSE,
  profile_completion INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template TEXT DEFAULT 'modern',
  content JSONB DEFAULT '{}',
  ats_score INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.mock_interviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_type TEXT CHECK (interview_type IN ('behavioral', 'technical', 'hr', 'case-study')),
  questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  feedback JSONB DEFAULT '{}',
  score INTEGER,
  duration_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new policies that allow all authenticated operations
-- (Since Clerk manages auth externally, we use permissive policies)
CREATE POLICY "Allow all operations on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_skills" ON public.user_skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on resumes" ON public.resumes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on mock_interviews" ON public.mock_interviews FOR ALL USING (true) WITH CHECK (true);

-- Step 7: Recreate update trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
