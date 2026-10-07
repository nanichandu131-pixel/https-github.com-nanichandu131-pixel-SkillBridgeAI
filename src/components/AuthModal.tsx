import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, ArrowRight, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    closeAuthModal,
    login,
    register,
    sendPasswordReset,
    loginWithGoogle,
    isSupabaseConnected,
    isGoogleConfigured,
    authModalInitialMode,
  } = useAuth();

  const [emailMode, setEmailMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isForgot, setIsForgot] = useState(false);

  // Reset form fields completely whenever modal opens
  useEffect(() => {
    if (showAuthModal) {
      setEmailMode(authModalInitialMode || 'register');
      setIsForgot(false);
      setErrorMsg('');
      setSuccessMsg('');
      setEmail('');
      setPassword('');
      setName('');
      setShowPassword(false);
    }
  }, [showAuthModal, authModalInitialMode]);

  if (!showAuthModal) return null;

  const switchMode = (mode: 'login' | 'register') => {
    setEmailMode(mode);
    setIsForgot(false);
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
      // If success, Supabase will redirect the browser to Google's official account chooser dialog
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to initialize Google OAuth.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isForgot) {
        if (!email) {
          setErrorMsg('Please enter your email address.');
          setLoading(false);
          return;
        }
        await sendPasswordReset(email);
        setSuccessMsg(`Password reset instructions have been sent to ${email}. Please check your inbox.`);
        setLoading(false);
        return;
      }

      if (emailMode === 'login') {
        if (!email || !password) {
          setErrorMsg('Please enter both email and password.');
          setLoading(false);
          return;
        }
        await login(email, password);
      } else {
        if (!name || !email || !password) {
          setErrorMsg('Please fill in all registration fields.');
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setErrorMsg('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        const regRes = await register(email, password, name);
        if (regRes?.needsEmailVerification) {
          setSuccessMsg(`Account created! A confirmation link has been sent to ${email}. Please verify your email before logging in.`);
          setEmailMode('login');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[420px] bg-[#0B0F17] rounded-2xl shadow-2xl border border-slate-800/80 p-6 sm:p-7 overflow-hidden text-slate-100">
        
        {/* Subtle top ambient glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative space-y-4">
          {/* Header */}
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20 mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="4" cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
                <path d="M4 16 C 8 8, 16 8, 20 16" />
                <path d="M12 11 L 12 5" />
                <polygon points="12,2 15,6 9,6" fill="currentColor" />
              </svg>
            </div>
            <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-400 tracking-wider uppercase mb-1">
              <span>SkillBridge AI</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isForgot
                ? 'Reset Your Password'
                : emailMode === 'register'
                ? 'Create Your Account'
                : 'Welcome to SkillBridge AI'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {isForgot
                ? 'Enter your account email to receive a secure recovery link.'
                : emailMode === 'register'
                ? 'Practice real-time technical interviews and benchmark against industry standards.'
                : 'Sign in to access your interview telemetry, roadmaps, and verified roles.'}
            </p>
          </div>

          {/* Clean Segmented Tabs (Create Account / Sign In) */}
          {!isForgot && (
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mt-3">
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                  emailMode === 'register'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer ${
                  emailMode === 'login'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
            </div>
          )}

          {/* REAL "Continue with Google" Button */}
          {!isForgot && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-800 hover:border-slate-600 text-slate-100 font-medium text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center space-x-2.5 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>
                  {googleLoading
                    ? 'Connecting to Google Account Chooser...'
                    : 'Continue with Google'}
                </span>
              </button>

              {/* Status helper pill */}
              <div className="flex items-center justify-center space-x-1.5 mt-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isGoogleConfigured ? 'bg-emerald-400' : 'bg-emerald-400'}`} />
                <span className="text-[10px] text-slate-400">
                  Google OAuth ready (Select your Google account)
                </span>
              </div>

              {/* Divider */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#0B0F17] text-slate-500 font-medium">
                    or continue with email
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs">
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {!isForgot && emailMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {!isForgot && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {emailMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setIsForgot(true)}
                      className="text-[11px] text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={emailMode === 'register' ? 'At least 8 characters' : '••••••••'}
                    minLength={emailMode === 'register' ? 8 : 6}
                    autoComplete={emailMode === 'register' ? 'new-password' : 'current-password'}
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/70 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {isForgot
                      ? 'Send Recovery Link'
                      : emailMode === 'login'
                      ? 'Sign In'
                      : 'Create Account'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle modes */}
          <div className="text-center pt-2 border-t border-slate-800/80">
            {isForgot ? (
              <button
                type="button"
                onClick={() => setIsForgot(false)}
                className="text-xs text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
              >
                ← Back to Sign In
              </button>
            ) : (
              <p className="text-xs text-slate-400">
                {emailMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => switchMode(emailMode === 'login' ? 'register' : 'login')}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {emailMode === 'login' ? 'Create an account' : 'Sign in'}
                </button>
              </p>
            )}
          </div>

          {/* Security note */}
          <div className="pt-1 flex items-center justify-center space-x-1.5 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Encrypted credentials & Supabase Row Level Security</span>
          </div>
        </div>

      </div>
    </div>
  );
};
