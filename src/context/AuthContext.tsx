import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { DEMO_USER_PROFILE } from '../data/initialData';
import { streakService } from '../services/streakService';
import {
  supabase,
  isSupabaseConfigured,
  checkGoogleProviderEnabled,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signOut,
  fetchUserProfile,
  upsertUserProfile,
} from '../lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  authProvider?: 'email' | 'google';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isSupabaseConnected: boolean;
  isGoogleConfigured: boolean;
  showAuthModal: boolean;
  authModalInitialMode?: 'login' | 'register';
  showOnboardingModal: boolean;
  openAuthModal: (mode?: 'login' | 'register' | unknown) => void;
  closeAuthModal: () => void;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  completeOnboarding: (updatedProfile: Partial<UserProfile>) => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<{ success: boolean; needsEmailVerification?: boolean }>;
  sendPasswordReset: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  quickDemoLogin: (roleType?: 'student' | 'experienced' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSupabaseConnected = isSupabaseConfigured();
  const [isGoogleConfigured, setIsGoogleConfigured] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>(() => storageService.getProfile());
  const [user, setUser] = useState<AuthUser | null>(() => {
    const prof = storageService.getProfile();
    return prof && prof.id
      ? {
          id: prof.id,
          email: prof.email,
          fullName: prof.fullName,
          avatarUrl: prof.avatarUrl,
          authProvider: prof.authProvider || 'email',
        }
      : null;
  });
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('register');
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // Check Google Provider live status in Supabase Auth
  useEffect(() => {
    if (isSupabaseConnected) {
      checkGoogleProviderEnabled().then((enabled) => {
        setIsGoogleConfigured(enabled);
      });
    }
  }, [isSupabaseConnected]);

  // Synchronize with Supabase Auth session & OAuth redirects
  useEffect(() => {
    const sbClient = supabase;
    if (!isSupabaseConnected || !sbClient) return;

    // Handle PKCE code exchange if redirected with ?code=...
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const errorParam = url.searchParams.get('error');
      const errorDesc = url.searchParams.get('error_description');

      if (code) {
        sbClient.auth
          .exchangeCodeForSession(code)
          .then(async ({ data, error }) => {
            if (!error && data?.session?.user) {
              await handleSupabaseUserSession(data.session.user);
              setShowAuthModal(false);
            } else if (error) {
              console.warn('exchangeCodeForSession warning:', error.message);
              // Fallback: check if session was synchronized
              const { data: sessData } = await sbClient.auth.getSession();
              if (sessData?.session?.user) {
                await handleSupabaseUserSession(sessData.session.user);
                setShowAuthModal(false);
              }
            }
            // Clean OAuth parameters from the browser URL after authentication
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          })
          .catch(async (err) => {
            console.warn('OAuth exchange error:', err);
            const { data: sessData } = await sbClient.auth.getSession();
            if (sessData?.session?.user) {
              await handleSupabaseUserSession(sessData.session.user);
              setShowAuthModal(false);
            }
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          });
      } else if (errorParam || errorDesc) {
        console.warn('OAuth redirect returned error:', errorDesc || errorParam);
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    // Check existing active session
    sbClient.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.warn('Supabase getSession error:', error.message);
        return;
      }
      if (session?.user) {
        await handleSupabaseUserSession(session.user);
        setShowAuthModal(false);
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }
    });

    // Subscribe to Auth state changes (Google OAuth redirect, Sign In, Sign Out, Token Refresh)
    const { data: authListener } = sbClient.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        await handleSupabaseUserSession(session.user);
        setShowAuthModal(false);
        if (
          typeof window !== 'undefined' &&
          (window.location.search.includes('code=') || window.location.hash.includes('access_token='))
        ) {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isSupabaseConnected]);

  // Helper to extract user & profile from Supabase Auth User
  const handleSupabaseUserSession = async (sbUser: any) => {
    setShowAuthModal(false);
    const meta = sbUser.user_metadata || {};
    const appMeta = sbUser.app_metadata || {};

    const email = sbUser.email || '';
    const fullName = meta.full_name || meta.name || email.split('@')[0] || 'SkillBridge User';
    const avatarUrl = meta.avatar_url || meta.picture || '';
    const authProvider: 'google' | 'email' = appMeta.provider === 'google' ? 'google' : 'email';

    const authUser: AuthUser = {
      id: sbUser.id,
      email,
      fullName,
      avatarUrl,
      authProvider,
    };
    setUser(authUser);

    // Fetch existing profile from Supabase PostgreSQL
    let dbProfile = await fetchUserProfile(sbUser.id);

    if (!dbProfile) {
      // First time user: construct initial clean profile (not onboarded yet, no fake data)
      dbProfile = {
        id: sbUser.id,
        email,
        fullName: fullName || '',
        avatarUrl,
        authProvider,
        role: 'student',
        location: '',
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
          onboarded: false,
        },
        skills: [],
        streakDays: 0,
        lastActiveDate: '',
        createdAt: new Date().toISOString(),
        isOnboarded: false,
      };
      await upsertUserProfile(dbProfile);
    } else {
      // If user signed in with Google, ensure avatar and name stay up to date
      if (avatarUrl && (!dbProfile.avatarUrl || dbProfile.avatarUrl !== avatarUrl)) {
        dbProfile.avatarUrl = avatarUrl;
        await upsertUserProfile({ id: sbUser.id, email, avatarUrl });
      }
    }

    setProfile(dbProfile);
    storageService.saveProfile(dbProfile);

    // Sync user data collections (interviews, bookmarks, plans) from Supabase
    storageService.syncUserDataFromSupabase(sbUser.id).catch(() => {});
  };

  const isAuthenticated = Boolean(user);
  const isOnboarded = Boolean(
    profile.isOnboarded ||
    profile.career?.onboarded ||
    (profile.skills && profile.skills.length > 0 && profile.education?.college?.trim() !== '') ||
    profile.career?.analysis
  );

  const completeOnboarding = async (updated: Partial<UserProfile>) => {
    const streakRecord = streakService.recordActivity(profile.streakDays, profile.lastActiveDate);

    const merged: UserProfile = {
      ...profile,
      ...updated,
      isOnboarded: true,
      streakDays: streakRecord.streakDays,
      lastActiveDate: streakRecord.lastActiveDate,
      career: {
        ...profile.career,
        ...(updated.career || {}),
        onboarded: true,
      },
    };

    setProfile(merged);
    storageService.saveProfile(merged);

    // Explicitly persist complete profile to Supabase
    if (user?.id) {
      await upsertUserProfile({
        ...merged,
        id: user.id,
        email: user.email || profile.email,
      });
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);

    if (updated.fullName || updated.email || updated.avatarUrl !== undefined) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              fullName: updated.fullName || prev.fullName,
              email: updated.email || prev.email,
              avatarUrl: updated.avatarUrl !== undefined ? updated.avatarUrl : prev.avatarUrl,
            }
          : null
      );
    }

    // Save to local storage cache
    storageService.saveProfile(newProfile);

    // Persist to Supabase if connected
    if (isSupabaseConnected && supabase && user?.id) {
      await upsertUserProfile({
        ...newProfile,
        id: user.id,
        email: user.email || profile.email,
      });
    }
  };

  /**
   * Real Google OAuth Login
   * Opens Google's authentic account chooser dialog
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConnected) {
      return {
        success: false,
        error: 'Supabase credentials are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
      };
    }

    try {
      await signInWithGoogle();
      return { success: true };
    } catch (err: any) {
      console.warn('Google OAuth notice:', err?.message);
      return { success: false, error: err?.message || 'Failed to start Google sign in.' };
    }
  };

  /**
   * Email/Password Login via Supabase Auth
   */
  const login = async (email: string, pass: string): Promise<boolean> => {
    if (isSupabaseConnected && supabase) {
      try {
        const authRes = await signInWithEmail(email, pass);
        if (authRes?.user) {
          await handleSupabaseUserSession(authRes.user);
          setShowAuthModal(false);
          return true;
        }
      } catch (err: any) {
        console.warn('Supabase Email Login notice:', err?.message);
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('email not confirmed')) {
          throw new Error('Email address not yet confirmed. Please check your email inbox for the verification link sent via SMTP.');
        }
        throw new Error(err?.message || 'Invalid email or password.');
      }
    }

    // Server-side / fallback login
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName || email.split('@')[0],
          avatarUrl: '',
          authProvider: 'email',
        };
        setUser(authUser);
        const updated = {
          ...profile,
          id: data.user.id,
          email: data.user.email,
          fullName: authUser.fullName,
        };
        setProfile(updated);
        storageService.saveProfile(updated);
        setShowAuthModal(false);
        return true;
      }
    } catch (e: any) {
      console.warn('Fallback login error:', e);
      throw new Error(e?.message || 'Login failed.');
    }

    return false;
  };

  /**
   * Email/Password Registration via Supabase Auth + SMTP Verification
   */
  const register = async (
    email: string,
    pass: string,
    name: string
  ): Promise<{ success: boolean; needsEmailVerification?: boolean }> => {
    if (isSupabaseConnected && supabase) {
      try {
        const authRes = await signUpWithEmail(email, pass, name);
        if (authRes?.user) {
          if (authRes.session) {
            // Auto-confirm enabled on project
            await handleSupabaseUserSession(authRes.user);
            setShowAuthModal(false);
            return { success: true, needsEmailVerification: false };
          }
          // Supabase Auth SMTP confirmation email sent
          return { success: true, needsEmailVerification: true };
        }
      } catch (err: any) {
        console.warn('Supabase Registration notice:', err?.message);
        throw new Error(err?.message || 'Registration failed.');
      }
    }

    // Server-side / fallback registration
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, fullName: name }),
      });
      const data = await res.json();
      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
          avatarUrl: '',
          authProvider: 'email',
        };
        setUser(authUser);
        const newProf: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          fullName: data.user.fullName,
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
            onboarded: false,
          },
          skills: [],
          streakDays: 0,
          lastActiveDate: '',
          createdAt: new Date().toISOString(),
          authProvider: 'email',
          isOnboarded: false,
        };
        setProfile(newProf);
        storageService.saveProfile(newProf);
        setShowAuthModal(false);
        return { success: true, needsEmailVerification: false };
      }
    } catch (e: any) {
      console.warn('Fallback register error:', e);
      throw new Error(e?.message || 'Registration failed.');
    }

    return { success: false };
  };

  /**
   * Real Password Reset via Supabase Auth SMTP
   */
  const sendPasswordReset = async (email: string): Promise<boolean> => {
    if (isSupabaseConnected && supabase) {
      try {
        await resetPassword(email);
        return true;
      } catch (err: any) {
        console.warn('Supabase Password Reset notice:', err?.message);
        throw new Error(err?.message || 'Failed to send password reset email.');
      }
    }
    return true;
  };

  /**
   * Real Logout
   */
  const logout = async () => {
    if (isSupabaseConnected && supabase) {
      try {
        await signOut();
      } catch (err) {
        console.warn('Error signing out of Supabase:', err);
      }
    }
    setUser(null);
  };

  /**
   * Demo profile loader (for instant offline testing if needed)
   */
  const quickDemoLogin = (roleType: 'student' | 'experienced' | 'admin' = 'student') => {
    const demoProf = {
      ...DEMO_USER_PROFILE,
      role: roleType === 'admin' ? ('admin' as const) : roleType === 'experienced' ? ('experienced' as const) : ('student' as const),
      fullName: roleType === 'admin' ? 'Devinder (Platform Admin)' : roleType === 'experienced' ? 'Priya Sharma (2 YoE)' : 'Chandu Nani',
      email: roleType === 'admin' ? 'admin@skillbridge.ai' : roleType === 'experienced' ? 'priya.eng@skillbridge.ai' : 'chandu@gmail.com',
      authProvider: 'email' as const,
    };
    setUser({ id: demoProf.id, email: demoProf.email, fullName: demoProf.fullName, authProvider: 'email' });
    setProfile(demoProf);
    storageService.saveProfile(demoProf);
    setShowAuthModal(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        isOnboarded,
        isSupabaseConnected,
        isGoogleConfigured,
        showAuthModal,
        authModalInitialMode,
        showOnboardingModal,
        openAuthModal: (mode?: 'login' | 'register' | unknown) => {
          if (mode === 'login' || mode === 'register') {
            setAuthModalInitialMode(mode);
          }
          setShowAuthModal(true);
        },
        closeAuthModal: () => setShowAuthModal(false),
        openOnboardingModal: () => setShowOnboardingModal(true),
        closeOnboardingModal: () => setShowOnboardingModal(false),
        completeOnboarding,
        login,
        register,
        sendPasswordReset,
        loginWithGoogle,
        logout,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
