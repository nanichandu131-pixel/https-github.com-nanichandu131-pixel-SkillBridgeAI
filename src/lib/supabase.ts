import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, InterviewResult, BookmarkItem, LearningPlan } from '../types';

// Runtime configuration resolution: checks Vite env vars or window injection
const getSupabaseConfig = () => {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {} as any;
  const windowConfig = typeof window !== 'undefined' ? (window as any).__SUPABASE_CONFIG__ : null;

  const url = (
    metaEnv.VITE_SUPABASE_URL ||
    windowConfig?.url ||
    'https://jiubxubmddhsoadplxzi.supabase.co'
  ).trim();

  const anonKey = (
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    windowConfig?.anonKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppdWJ4dWJtZGRoc29hZHBseHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NDIxODcsImV4cCI6MjEwNjMxODE4N30.4v1HHhFK_kJyWWv8zoeUFTeTC0IDb1jFiAbGAyQVII8'
  ).trim();

  return { url, anonKey };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

export const isSupabaseConfigured = (): boolean => {
  const cfg = getSupabaseConfig();
  return Boolean(
    cfg.url &&
    cfg.anonKey &&
    cfg.url.startsWith('http') &&
    !cfg.url.includes('YOUR_SUPABASE')
  );
};

// Singleton Supabase Client
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sb_skillbridge_auth',
      },
    })
  : null;

// ==============================================================================
// AUTHENTICATION HELPERS
// ==============================================================================

/**
 * Dynamically resolves the OAuth redirect URL based on the current SkillBridge AI application URL / environment:
 * - Local development: dynamically uses the current local origin (e.g. http://localhost:3000)
 * - Production: dynamically uses the current deployed SkillBridge AI domain / origin
 * - Strips any trailing slashes, hash fragments, or query strings to ensure exact whitelist matching in Supabase
 */
export function getAuthRedirectUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    const hostname = window.location.hostname;

    // Detect local development environment
    const isLocalhost =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '[::1]' ||
      hostname.endsWith('.localhost');

    if (isLocalhost) {
      return origin.replace(/\/+$/, '');
    }

    // In deployed/production environment: check environment variable override if present
    const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any) : {};
    const configuredAppUrl = metaEnv.VITE_APP_URL || metaEnv.APP_URL;

    if (configuredAppUrl && typeof configuredAppUrl === 'string' && configuredAppUrl.startsWith('http')) {
      try {
        const parsed = new URL(configuredAppUrl);
        return parsed.origin.replace(/\/+$/, '');
      } catch {
        // Fall back to window.location.origin
      }
    }

    return origin.replace(/\/+$/, '');
  }

  // Fallback for non-browser / build context
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? (import.meta.env as any) : {};
  const fallback = metaEnv.VITE_APP_URL || metaEnv.APP_URL || '';
  return fallback.replace(/\/+$/, '');
}

/**
 * Checks whether the Google provider is actively enabled in the Supabase Auth project
 */
export async function checkGoogleProviderEnabled(): Promise<boolean> {
  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return false;
  try {
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: anonKey },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.external?.google);
  } catch (err) {
    console.warn('Failed to query Supabase Auth settings:', err);
    return false;
  }
}

/**
 * Initiates real Google OAuth with Supabase.
 * Forces the authentic Google Account Chooser via prompt: 'select_account'.
 * Redirects back dynamically to the current SkillBridge AI application URL.
 */
export async function signInWithGoogle() {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
  }

  // Pre-flight check: verify Google provider is enabled in Supabase project
  const isEnabled = await checkGoogleProviderEnabled();
  if (!isEnabled) {
    throw new Error(
      'Google provider is not enabled in your Supabase project yet. In Supabase Dashboard -> Authentication -> Providers, enable Google and paste your Google Client ID and Client Secret.'
    );
  }

  const redirectUrl = getAuthRedirectUrl();
  const isFramed = typeof window !== 'undefined' && window.self !== window.top;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: isFramed,
      queryParams: {
        prompt: 'select_account',
        access_type: 'offline',
      },
    },
  });

  if (error) throw error;

  if (isFramed && data?.url) {
    try {
      window.top!.location.href = data.url;
    } catch {
      window.open(data.url, '_blank');
    }
  }

  return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, pass: string) {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase credentials not configured.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign up with email, password, and full name
 */
export async function signUpWithEmail(email: string, pass: string, fullName: string) {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase credentials not configured.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Send password reset email via Supabase Auth + SMTP
 */
export async function resetPassword(email: string) {
  if (!supabase || !isSupabaseConfigured()) {
    throw new Error('Supabase credentials not configured.');
  }
  const redirectUrl = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });
  if (error) throw error;
  return data;
}

/**
 * Sign out from Supabase Auth
 */
export async function signOut() {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

// ==============================================================================
// DATABASE CRUD HELPERS (PROFILES, INTERVIEWS, PLANS, BOOKMARKS, DAILY)
// ==============================================================================

import { streakService } from '../services/streakService';

/**
 * Fetch profile from PostgreSQL public.profiles
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Error fetching Supabase profile:', error.message);
    return null;
  }
  if (!data) return null;

  const rawSkills = Array.isArray(data.skills) ? data.skills : [];
  const college = data.college || data.education?.college || '';
  const isOnboarded = Boolean(
    data.career?.onboarded ||
    (rawSkills.length > 0 && college.trim() !== '') ||
    data.career?.analysis
  );

  const effectiveStreak = streakService.calculateEffectiveStreak(
    data.streak_days || 0,
    data.last_active_date
  );

  return {
    id: data.id,
    email: data.email || '',
    fullName: data.full_name || '',
    avatarUrl: data.avatar_url || '',
    role: data.role || 'student',
    location: data.location || '',
    skills: rawSkills,
    career: {
      targetRole: data.career?.targetRole || 'Software Developer',
      experienceLevel: data.experience_level || data.career?.experienceLevel || 'fresher',
      preferredLocation: data.career?.preferredLocation || '',
      workPreference: data.career?.workPreference || 'hybrid',
      onboarded: isOnboarded,
      analysis: data.career?.analysis || undefined,
    },
    education: {
      college,
      degree: data.degree || data.education?.degree || '',
      branch: data.branch || data.education?.branch || '',
      graduationYear: data.graduation_year || data.education?.graduationYear || new Date().getFullYear(),
      cgpaOrPercentage: data.cgpa_or_percentage || data.education?.cgpaOrPercentage || '',
    },
    streakDays: effectiveStreak,
    lastActiveDate: data.last_active_date || '',
    resume: data.career?.resume || undefined,
    authProvider: data.auth_provider || 'email',
    createdAt: data.created_at || new Date().toISOString(),
    isOnboarded,
  };
}

/**
 * Check if a string is a valid UUID format (standard 8-4-4-4-12 hex)
 */
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Upsert user profile to public.profiles
 */
export async function upsertUserProfile(profile: Partial<UserProfile> & { id: string; email: string }): Promise<boolean> {
  if (!supabase) return false;
  // Supabase profiles table requires an authentic UUID matching auth.users.id
  if (!isValidUUID(profile.id)) return false;

  const payload: any = {
    id: profile.id,
    email: profile.email,
    updated_at: new Date().toISOString(),
  };

  if (profile.fullName !== undefined) payload.full_name = profile.fullName;
  if (profile.avatarUrl !== undefined) payload.avatar_url = profile.avatarUrl;
  if (profile.role !== undefined) payload.role = profile.role;
  if (profile.location !== undefined) payload.location = profile.location;
  if (profile.skills !== undefined) payload.skills = profile.skills;
  if (profile.career !== undefined) payload.career = profile.career;
  if (profile.education !== undefined) {
    payload.education = profile.education;
    payload.college = profile.education.college;
    payload.degree = profile.education.degree;
    payload.branch = profile.education.branch;
    payload.graduation_year = profile.education.graduationYear;
    payload.cgpa_or_percentage = profile.education.cgpaOrPercentage;
  }
  if (profile.streakDays !== undefined) payload.streak_days = profile.streakDays;
  if (profile.lastActiveDate !== undefined) payload.last_active_date = profile.lastActiveDate;
  if (profile.authProvider !== undefined) payload.auth_provider = profile.authProvider;

  const { error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.warn('Error saving profile to Supabase:', error.message);
    return false;
  }
  return true;
}

/**
 * Fetch interviews for current user
 */
export async function fetchUserInterviews(userId: string): Promise<InterviewResult[]> {
  if (!supabase || !isValidUUID(userId)) return [];
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.warn('Error fetching Supabase interviews:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    interviewType: row.interview_type,
    targetRole: row.target_role,
    difficulty: row.difficulty,
    date: row.date,
    overallScore: row.overall_score,
    categoryScores: row.category_scores,
    strongAreas: row.strong_areas || [],
    areasToImprove: row.areas_to_improve || [],
    actionableFeedback: row.actionable_feedback,
    answers: row.answers || [],
  }));
}

/**
 * Insert interview evaluation to public.interviews
 */
export async function insertUserInterview(interview: InterviewResult): Promise<boolean> {
  if (!supabase || !isValidUUID(interview.userId)) return false;

  const validInterviewId = isValidUUID(interview.id)
    ? interview.id
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : null);

  if (!validInterviewId) return false;

  const { error } = await supabase.from('interviews').insert({
    id: validInterviewId,
    user_id: interview.userId,
    interview_type: interview.interviewType,
    target_role: interview.targetRole,
    difficulty: interview.difficulty,
    date: interview.date || new Date().toISOString(),
    overall_score: interview.overallScore,
    category_scores: interview.categoryScores,
    strong_areas: interview.strongAreas || [],
    areasToImprove: interview.areasToImprove || [],
    actionable_feedback: interview.actionableFeedback,
    answers: interview.answers || [],
  });

  if (error) {
    console.warn('Error inserting interview to Supabase:', error.message);
    return false;
  }
  return true;
}

/**
 * Fetch bookmarks for user
 */
export async function fetchUserBookmarks(userId: string): Promise<BookmarkItem[]> {
  if (!supabase || !isValidUUID(userId)) return [];
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) {
    console.warn('Error fetching Supabase bookmarks:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    savedAt: row.saved_at,
    category: row.category,
  }));
}

/**
 * Save / delete bookmark
 */
export async function saveUserBookmark(userId: string, item: BookmarkItem): Promise<boolean> {
  if (!supabase || !isValidUUID(userId)) return false;
  const { error } = await supabase.from('bookmarks').upsert({
    id: item.id,
    user_id: userId,
    type: item.type,
    title: item.title,
    subtitle: item.subtitle || '',
    saved_at: item.savedAt || new Date().toISOString(),
    category: item.category || '',
  }, { onConflict: 'user_id, id' });

  return !error;
}

export async function deleteUserBookmark(userId: string, bookmarkId: string): Promise<boolean> {
  if (!supabase || !isValidUUID(userId)) return false;
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('id', bookmarkId);

  return !error;
}

/**
 * Fetch / save Learning Plan
 */
export async function fetchUserLearningPlan(userId: string): Promise<LearningPlan | null> {
  if (!supabase || !isValidUUID(userId)) return null;
  const { data, error } = await supabase
    .from('learning_plans')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id || `plan_${userId}`,
    userId: data.user_id,
    targetRole: data.target_role,
    totalWeeks: data.total_weeks || 4,
    createdAt: data.created_at || new Date().toISOString(),
    tasks: data.tasks || [],
  };
}

export async function saveUserLearningPlan(userId: string, plan: LearningPlan): Promise<boolean> {
  if (!supabase || !isValidUUID(userId)) return false;
  const id = `plan_${userId}`;
  const { error } = await supabase.from('learning_plans').upsert({
    id,
    user_id: userId,
    target_role: plan.targetRole,
    total_weeks: plan.totalWeeks || 4,
    tasks: plan.tasks,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  return !error;
}

/**
 * Daily Progress
 */
export async function fetchUserDailyProgress(userId: string, date: string): Promise<{ completedTasks: string[]; dailySet?: any } | null> {
  if (!supabase || !isValidUUID(userId)) return null;
  const { data, error } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();

  if (error || !data) return null;
  return {
    completedTasks: data.completed_tasks || [],
    dailySet: data.daily_set,
  };
}

export async function saveUserDailyProgress(userId: string, date: string, completedTasks: string[], dailySet?: any): Promise<boolean> {
  if (!supabase || !isValidUUID(userId)) return false;
  const id = `dp_${userId}_${date}`;
  const { error } = await supabase.from('daily_progress').upsert({
    id,
    user_id: userId,
    date,
    completed_tasks: completedTasks,
    daily_set: dailySet || {},
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id, date' });

  return !error;
}
