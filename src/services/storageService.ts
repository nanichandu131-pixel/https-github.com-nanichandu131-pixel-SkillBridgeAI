import { UserProfile, InterviewResult, BookmarkItem, AppNotification, LearningPlan, DailyPracticeSet } from '../types';
import { INITIAL_QUESTION_BANK, INITIAL_CODING_PROBLEMS } from '../data/initialData';
import { streakService } from './streakService';
import {
  supabase,
  isSupabaseConfigured,
  isValidUUID,
  upsertUserProfile,
  insertUserInterview,
  fetchUserInterviews,
  saveUserBookmark,
  deleteUserBookmark,
  fetchUserBookmarks,
  saveUserLearningPlan,
  fetchUserLearningPlan,
  saveUserDailyProgress,
  fetchUserDailyProgress,
} from '../lib/supabase';

export const EMPTY_USER_PROFILE: UserProfile = {
  id: '',
  email: '',
  fullName: '',
  avatarUrl: '',
  location: '',
  role: 'student',
  education: {
    college: '',
    degree: '',
    branch: '',
    graduationYear: new Date().getFullYear(),
    cgpaOrPercentage: '',
  },
  career: {
    targetRole: 'Software Developer',
    experienceLevel: 'fresher',
    preferredLocation: '',
    workPreference: 'hybrid',
  },
  skills: [],
  streakDays: 0,
  lastActiveDate: '',
  createdAt: new Date().toISOString(),
  isOnboarded: false,
};

const STORAGE_KEYS = {
  USER_PROFILE: 'sb_user_profile',
  AUTH_TOKEN: 'sb_auth_token',
  INTERVIEWS: 'sb_interviews_history',
  BOOKMARKS: 'sb_bookmarks',
  NOTIFICATIONS: 'sb_notifications',
  LEARNING_PLAN: 'sb_learning_plan',
  DAILY_PRACTICE: 'sb_daily_practice',
  THEME: 'sb_theme_preference',
};

export const storageService = {
  /**
   * Sync all user collections from Supabase PostgreSQL to local cache on login
   */
  async syncUserDataFromSupabase(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !supabase || !userId) return;

    try {
      // 1. Sync interviews
      const remoteInterviews = await fetchUserInterviews(userId);
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(remoteInterviews || []));

      // 2. Sync bookmarks
      const remoteBookmarks = await fetchUserBookmarks(userId);
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(remoteBookmarks || []));

      // 3. Sync learning plan
      const remotePlan = await fetchUserLearningPlan(userId);
      if (remotePlan) {
        localStorage.setItem(STORAGE_KEYS.LEARNING_PLAN, JSON.stringify(remotePlan));
      }

      // 4. Sync today's daily progress
      const today = new Date().toISOString().split('T')[0];
      const remoteDaily = await fetchUserDailyProgress(userId, today);
      if (remoteDaily) {
        const localDaily = this.getDailyPractice();
        localDaily.completedTasks = remoteDaily.completedTasks || [];
        localStorage.setItem(STORAGE_KEYS.DAILY_PRACTICE, JSON.stringify(localDaily));
      }
    } catch (err) {
      console.warn('Error during Supabase background sync:', err);
    }
  },

  getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading profile from localStorage:', e);
    }
    return EMPTY_USER_PROFILE;
  },

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));

      // Persist to Supabase if connected
      if (isSupabaseConfigured() && supabase && profile.id && isValidUUID(profile.id)) {
        upsertUserProfile({
          ...profile,
          id: profile.id,
          email: profile.email || 'user@skillbridge.ai',
        }).catch((err) => console.warn('Supabase profile save error:', err));
      }

      // Server proxy sync
      fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      }).catch(() => {});
    } catch (e) {
      console.warn('Error saving profile:', e);
    }
  },

  getInterviews(): InterviewResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEWS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading interviews:', e);
    }
    return [];
  },

  saveInterview(interview: InterviewResult): void {
    const list = this.getInterviews();
    list.unshift(interview);
    try {
      localStorage.setItem(STORAGE_KEYS.INTERVIEWS, JSON.stringify(list));

      // Persist to Supabase PostgreSQL table
      if (isSupabaseConfigured() && supabase && interview.userId && isValidUUID(interview.userId)) {
        insertUserInterview(interview).catch((err) => console.warn('Supabase interview insert error:', err));
      }

      // Record activity in streak system
      const currentProfile = this.getProfile();
      if (currentProfile && currentProfile.id) {
        const streakResult = streakService.recordActivity(currentProfile.streakDays, currentProfile.lastActiveDate);
        currentProfile.streakDays = streakResult.streakDays;
        currentProfile.lastActiveDate = streakResult.lastActiveDate;
        this.saveProfile(currentProfile);
      }

      // Also notify backend server
      fetch('/api/interviews/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview),
      }).catch(() => {});
    } catch (e) {
      console.warn('Error saving interview:', e);
    }
  },

  getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [];
  },

  toggleBookmark(item: BookmarkItem): boolean {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex((b) => b.id === item.id);
    let isNowSaved = false;
    if (index >= 0) {
      bookmarks.splice(index, 1);
      isNowSaved = false;
      const profile = this.getProfile();
      if (isSupabaseConfigured() && supabase && profile.id) {
        deleteUserBookmark(profile.id, item.id).catch(() => {});
      }
    } else {
      bookmarks.unshift(item);
      isNowSaved = true;
      const profile = this.getProfile();
      if (isSupabaseConfigured() && supabase && profile.id) {
        saveUserBookmark(profile.id, item).catch(() => {});
      }
    }
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {}
    return isNowSaved;
  },

  isBookmarked(id: string): boolean {
    return this.getBookmarks().some((b) => b.id === id);
  },

  getNotifications(): AppNotification[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return [
      {
        id: 'notif-1',
        title: 'Daily Practice Ready 🔥',
        message: 'Your 4-question daily set is waiting! Maintain your active streak.',
        timestamp: '2 hours ago',
        read: false,
        type: 'daily_practice',
        actionUrl: 'daily'
      },
      {
        id: 'notif-2',
        title: 'Learning Plan Update',
        message: 'Day 4: Array & Two-Pointer DSA Problems is scheduled for today.',
        timestamp: '1 day ago',
        read: true,
        type: 'learning_plan',
        actionUrl: 'learning'
      },
      {
        id: 'notif-3',
        title: 'Interview Improvement Detected',
        message: 'Your recent interview score jumped from 68% to 82%! Keep up the momentum.',
        timestamp: '2 days ago',
        read: true,
        type: 'streak',
        actionUrl: 'progress'
      }
    ];
  },

  markNotificationsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {}
  },

  getLearningPlan(): LearningPlan | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEARNING_PLAN);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return null;
  },

  saveLearningPlan(plan: LearningPlan): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNING_PLAN, JSON.stringify(plan));
      const profile = this.getProfile();
      if (isSupabaseConfigured() && supabase && profile.id) {
        saveUserLearningPlan(profile.id, plan).catch(() => {});
      }
    } catch (e) {}
  },

  updateTaskStatus(taskId: string, completed: boolean): LearningPlan | null {
    const plan = this.getLearningPlan();
    if (!plan) return null;
    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) {
      task.completed = completed;
      this.saveLearningPlan(plan);
    }
    return plan;
  },

  getDailyPractice(): DailyPracticeSet {
    const today = new Date().toISOString().split('T')[0];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_PRACTICE);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === today) return parsed;
      }
    } catch (e) {}

    // Generate fresh daily set
    const hr = INITIAL_QUESTION_BANK.find((q) => q.category === 'hr') || INITIAL_QUESTION_BANK[0];
    const tech = INITIAL_QUESTION_BANK.filter((q) => q.category !== 'hr' && q.category !== 'aptitude').slice(0, 2);
    const coding = INITIAL_CODING_PROBLEMS[0];
    const apt = INITIAL_QUESTION_BANK.find((q) => q.category === 'aptitude') || INITIAL_QUESTION_BANK[INITIAL_QUESTION_BANK.length - 1];

    const set: DailyPracticeSet = {
      date: today,
      hrQuestion: hr,
      technicalQuestions: tech,
      codingProblem: coding,
      aptitudeQuestion: apt,
      completedTasks: [],
    };
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_PRACTICE, JSON.stringify(set));
    } catch (e) {}
    return set;
  },

  markDailyTaskCompleted(taskId: string): DailyPracticeSet {
    const daily = this.getDailyPractice();
    if (!daily.completedTasks.includes(taskId)) {
      daily.completedTasks.push(taskId);
      const today = new Date().toISOString().split('T')[0];
      try {
        localStorage.setItem(STORAGE_KEYS.DAILY_PRACTICE, JSON.stringify(daily));
      } catch (e) {}

      // Persist to Supabase
      const profile = this.getProfile();
      if (isSupabaseConfigured() && supabase && profile.id) {
        saveUserDailyProgress(profile.id, today, daily.completedTasks, daily).catch(() => {});
      }

      // Increment user streak using real streak rules
      if (daily.completedTasks.length >= 1) {
        const streakResult = streakService.recordActivity(profile.streakDays, profile.lastActiveDate);
        profile.streakDays = streakResult.streakDays;
        profile.lastActiveDate = streakResult.lastActiveDate;
        this.saveProfile(profile);
      }
    }
    return daily;
  }
};
