-- ==============================================================================
-- SkillBridge AI - Production Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================
-- This schema provisions real persistent storage for:
-- 1. User Profiles (synchronized with Supabase Auth & Google OAuth)
-- 2. Mock Interviews & Historical Evaluations
-- 3. Personalized 4-Week Learning Roadmaps
-- 4. User Bookmarks (Questions, Coding Problems, Companies)
-- 5. Daily Placement Practice & Streaks
-- 6. In-App Notifications
-- 7. Row Level Security (RLS) policies enforcing user isolation
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked directly to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'experienced', 'admin')),
  college TEXT,
  graduation_year INTEGER,
  degree TEXT,
  branch TEXT,
  cgpa_or_percentage TEXT,
  experience_level TEXT DEFAULT 'fresher',
  location TEXT DEFAULT 'Bengaluru, India',
  skills TEXT[] DEFAULT ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git']::TEXT[],
  career JSONB DEFAULT jsonb_build_object(
    'targetRole', 'Full Stack Developer',
    'preferredLocations', jsonb_build_array('Bengaluru', 'Hyderabad', 'Remote'),
    'targetCompanies', jsonb_build_array('Product Firms', 'High-Growth Tech'),
    'readinessScore', 78
  ),
  education JSONB DEFAULT '{}'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  streak_days INTEGER DEFAULT 1,
  last_active_date DATE DEFAULT CURRENT_DATE,
  auth_provider TEXT DEFAULT 'email',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast user profile lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ------------------------------------------------------------------------------
-- 2. INTERVIEWS TABLE (Evaluations & Session Transcripts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.interviews (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'hr', 'resume', 'mixed', 'coding')),
  target_role TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  category_scores JSONB NOT NULL,
  strong_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_to_improve TEXT[] DEFAULT ARRAY[]::TEXT[],
  actionable_feedback TEXT NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interviews(date DESC);

-- ------------------------------------------------------------------------------
-- 3. LEARNING PLANS TABLE (Curriculum & 28-day tasks)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  total_weeks INTEGER DEFAULT 4,
  tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_learning_plan UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_plans_user_id ON public.learning_plans(user_id);

-- ------------------------------------------------------------------------------
-- 4. BOOKMARKS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('question', 'coding', 'company')),
  title TEXT NOT NULL,
  subtitle TEXT,
  saved_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  category TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- ------------------------------------------------------------------------------
-- 5. DAILY PROGRESS & HABIT TRACKING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_progress (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  completed_tasks TEXT[] DEFAULT ARRAY[]::TEXT[],
  daily_set JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_user_daily_date UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON public.daily_progress(user_id, date);

-- ------------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false NOT NULL,
  type TEXT DEFAULT 'system',
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can insert own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can update own interviews" ON public.interviews;
DROP POLICY IF EXISTS "Users can delete own interviews" ON public.interviews;

DROP POLICY IF EXISTS "Users can view own learning plans" ON public.learning_plans;
DROP POLICY IF EXISTS "Users can insert own learning plans" ON public.learning_plans;
DROP POLICY IF EXISTS "Users can update own learning plans" ON public.learning_plans;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;

DROP POLICY IF EXISTS "Users can view own daily progress" ON public.daily_progress;
DROP POLICY IF EXISTS "Users can insert own daily progress" ON public.daily_progress;
DROP POLICY IF EXISTS "Users can update own daily progress" ON public.daily_progress;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Interviews policies
CREATE POLICY "Users can view own interviews"
  ON public.interviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews"
  ON public.interviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews"
  ON public.interviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews"
  ON public.interviews FOR DELETE
  USING (auth.uid() = user_id);

-- Learning Plans policies
CREATE POLICY "Users can view own learning plans"
  ON public.learning_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning plans"
  ON public.learning_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning plans"
  ON public.learning_plans FOR UPDATE
  USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks"
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Daily Progress policies
CREATE POLICY "Users can view own daily progress"
  ON public.daily_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily progress"
  ON public.daily_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily progress"
  ON public.daily_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 8. AUTOMATIC PROFILE CREATION TRIGGER (AUTH & GOOGLE OAUTH)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  extracted_name TEXT;
  extracted_avatar TEXT;
  auth_prov TEXT;
BEGIN
  -- Extract user display name from raw metadata
  extracted_name := COALESCE(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- Extract avatar URL from Google OAuth or user metadata
  extracted_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    ''
  );

  -- Identify provider ('google' or 'email')
  auth_prov := COALESCE(
    new.raw_app_meta_data->>'provider',
    'email'
  );

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    auth_provider,
    role,
    skills,
    career,
    streak_days,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    extracted_name,
    extracted_avatar,
    auth_prov,
    'student',
    ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git']::TEXT[],
    jsonb_build_object(
      'targetRole', 'Full Stack Developer',
      'preferredLocations', jsonb_build_array('Bengaluru', 'Hyderabad', 'Remote'),
      'targetCompanies', jsonb_build_array('Product Firms', 'High-Growth Tech'),
      'readinessScore', 78
    ),
    1,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated At Auto-Refresh Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
