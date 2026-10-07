/**
 * SkillBridge AI - Real Production Streak System
 * Rules:
 * 1. First completed activity on the user's first active day = 1 day.
 * 2. Consecutive active days increase the streak.
 * 3. Missing a day resets the active streak according to streak logic.
 * 4. Stored in Supabase profiles (streak_days, last_active_date).
 * 5. Never hardcodes a streak value.
 */

export interface StreakRecord {
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}

export const streakService = {
  getToday(): string {
    return new Date().toISOString().split('T')[0];
  },

  getYesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  },

  /**
   * Evaluates the current active streak.
   * If the last active date was today or yesterday, streak is active.
   * If last active date was before yesterday, the streak is broken (0).
   */
  calculateEffectiveStreak(streakDays: number = 0, lastActiveDate?: string | null): number {
    if (!lastActiveDate || streakDays <= 0) return 0;
    const today = this.getToday();
    const yesterday = this.getYesterday();

    // Active if completed today or yesterday
    if (lastActiveDate === today || lastActiveDate === yesterday) {
      return streakDays;
    }

    // Broken streak
    return 0;
  },

  /**
   * Records a completed activity (e.g. resume analysis, mock interview, coding problem, daily task).
   * Returns the new streak count and updated last active date.
   */
  recordActivity(currentStreak: number = 0, lastActiveDate?: string | null): StreakRecord {
    const today = this.getToday();
    const yesterday = this.getYesterday();

    if (lastActiveDate === today) {
      // Activity already recorded today: maintain active streak (at least 1)
      return {
        streakDays: Math.max(1, currentStreak),
        lastActiveDate: today,
      };
    }

    if (lastActiveDate === yesterday) {
      // Consecutive active day! Increment streak
      return {
        streakDays: (currentStreak > 0 ? currentStreak : 0) + 1,
        lastActiveDate: today,
      };
    }

    // First activity ever, or streak broken: starts at 1
    return {
      streakDays: 1,
      lastActiveDate: today,
    };
  },
};
