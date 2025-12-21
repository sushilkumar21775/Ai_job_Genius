-- CareerPulse AI - Database Schema
-- Run this in Supabase SQL Editor (supabase.com/dashboard → SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- ============================================
-- 2. USER SKILLS TABLE
-- ============================================
CREATE TABLE public.user_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, skill_name)
);

-- ============================================
-- 3. RESUMES TABLE
-- ============================================
CREATE TABLE public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template TEXT DEFAULT 'modern',
  content JSONB DEFAULT '{}',
  ats_score INTEGER,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MOCK INTERVIEWS TABLE
-- ============================================
CREATE TABLE public.mock_interviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_type TEXT CHECK (interview_type IN ('behavioral', 'technical', 'hr', 'case-study')),
  questions JSONB DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  feedback JSONB DEFAULT '{}',
  score INTEGER,
  duration_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Skills: Users can only see/edit their own skills
CREATE POLICY "Users can view own skills" ON public.user_skills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own skills" ON public.user_skills
  FOR ALL USING (auth.uid() = user_id);

-- Resumes: Users can only see/edit their own resumes
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- Mock Interviews: Users can only see/edit their own interviews
CREATE POLICY "Users can view own interviews" ON public.mock_interviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interviews" ON public.mock_interviews
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
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
