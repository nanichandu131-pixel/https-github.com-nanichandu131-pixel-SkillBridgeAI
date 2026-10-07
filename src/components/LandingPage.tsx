import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Code2,
  Mic,
  Award,
  Calendar,
  Briefcase,
  FileText,
  CheckCircle2,
  TrendingUp,
  Flame,
  Play,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onStart: () => void;
  onNavigate: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate }) => {
  const { openAuthModal } = useAuth();

  const journeySteps = [
    { title: 'Profile & Goal', desc: 'Target role, degree, & experience level', num: '01' },
    { title: 'Skill Verification', desc: 'Core languages, libraries, & stacks', num: '02' },
    { title: 'AI Mock Rounds', desc: 'Technical depth, STAR behavioral, & speech', num: '03' },
    { title: 'Coding Practice', desc: 'In-browser test cases & DSA execution', num: '04' },
    { title: 'Resume Defense', desc: 'Defend real projects & architecture', num: '05' },
    { title: 'Criteria Scoring', desc: 'Granular evaluation & actionable fixes', num: '06' },
    { title: 'Skill Gap Plan', desc: 'Targeted 4-week daily roadmap', num: '07' },
    { title: 'Company Matches', desc: 'Verified tech hiring criteria & links', num: '08' },
  ];

  const features = [
    {
      title: 'AI Mock Interviews',
      tagline: 'Technical & HR Screening',
      desc: 'Simulate high-pressure campus placements and technical screening rounds with adaptive follow-ups.',
      icon: Sparkles,
      action: () => onNavigate('interview'),
    },
    {
      title: 'Resume Defense AI',
      tagline: 'Defend Your Real Projects',
      desc: 'Upload your resume in PDF/DOCX. Gemini AI interrogates you on your actual codebase architectures and trade-offs.',
      icon: FileText,
      action: () => onNavigate('resume'),
    },
    {
      title: 'Live Coding Practice',
      tagline: 'In-Browser Test Execution',
      desc: 'Solve algorithm and data structure problems with real test cases, time benchmarks, and code reviews.',
      icon: Code2,
      action: () => onNavigate('coding'),
    },
    {
      title: 'Speech Recognition',
      tagline: 'Natural Spoken Delivery',
      desc: 'Speak naturally into your microphone using Web Speech recognition and receive spoken feedback from the interviewer.',
      icon: Mic,
      action: () => onNavigate('interview'),
    },
    {
      title: 'Performance Analytics',
      tagline: 'Criteria-Based Scoring',
      desc: 'Receive granular scores on Relevance, Clarity, Structure (STAR method), Completeness, and Technical Precision.',
      icon: TrendingUp,
      action: () => onNavigate('progress'),
    },
    {
      title: 'Skill Gap Analysis',
      tagline: 'Know What You Are Missing',
      desc: 'Compare your technical stack against target role benchmarks (Full Stack, Backend, Java) with clear gaps.',
      icon: Award,
      action: () => onNavigate('skillgap'),
    },
    {
      title: '4-Week Learning Roadmap',
      tagline: 'Structured Study Units',
      desc: 'Automatically generated 4-week preparation calendars addressing your specific interview blind spots.',
      icon: Calendar,
      action: () => onNavigate('learning'),
    },
    {
      title: 'Company Discovery',
      tagline: 'Hiring Criteria Alignment',
      desc: 'Explore role requirements across verified tech leaders (Zoho, Freshworks, Razorpay, Atlassian) with official career links.',
      icon: Briefcase,
      action: () => onNavigate('companies'),
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      
      {/* ========================================================
          1. HERO SECTION (Clean, Typographic, Premium SaaS)
          ======================================================== */}
      <section className="relative pt-16 sm:pt-24 pb-12 overflow-hidden">
        {/* Subtle ambient lighting */}
        <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          
          {/* Unboxed Metadata Header */}
          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Career Acceleration for Engineering Students & Freshers</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Spring 2026 Cohort</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] max-w-4xl mx-auto" style={{ textWrap: 'balance' }}>
            Build Skills.{' '}
            <span className="text-indigo-600 dark:text-indigo-400">
              Bridge Careers.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Practice real technical and HR interviews with AI, benchmark your code against industry standards, and discover verified roles that match your profile.
          </p>

          {/* Primary Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStart}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 btn-tactile"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch AI Mock Interview</span>
            </button>

            <button
              onClick={openAuthModal}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-xs shadow-xs transition flex items-center justify-center space-x-2 btn-tactile"
            >
              {/* Google G Logo */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quantitative Proof Adjacency */}
          <div className="pt-8 border-t border-slate-200/90 dark:border-slate-800/90 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">78%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Average Benchmark Score</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">8+ Roles</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Full Stack, Java, Python & Data</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">In-Browser Code Execution</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">Speech AI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Live Audio & Speech Synthesis</p>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. INTERACTIVE DEMO PREVIEW (Subtle Depth & Layered Panel)
          ======================================================== */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface shadow-md space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Live AI Mock Interview Simulation
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono tabular-nums">
              <span>Question 2 of 5</span>
              <span>·</span>
              <span>Full Stack Developer</span>
            </div>
          </div>

          {/* Question Box */}
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interviewer Prompt · System Design & Core Concepts
            </span>
            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
              "How do you design a thread-safe caching layer with an LRU eviction policy in Node.js, and how do you handle cache stampedes under high concurrency?"
            </p>
          </div>

          {/* Candidate Response Transcript */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Candidate Audio Transcript:
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              "I implement a Doubly Linked List paired with a Hash Map for O(1) reads and eviction. To mitigate cache stampedes, I use mutex-locking or single-flight request coalescing where concurrent misses wait on a shared promise..."
            </p>
          </div>

          {/* Criteria Evaluation Output */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums text-sm">
                  Score: 86 / 100
                </span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Strong Architectural Precision
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Accurate identification of Doubly Linked List + Map structure. Next, elaborate on Redis distributed locks for multi-node deployments.
              </p>
            </div>
            <button
              onClick={onStart}
              className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shrink-0 btn-tactile"
            >
              Try This Question
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. PREPARATION JOURNEY (Clean 8-Step Timeline)
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            The SkillBridge AI Preparation Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            A structured workflow designed to turn general candidates into verified placement-ready engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {journeySteps.map((step) => (
            <div
              key={step.title}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 block tabular-nums">
                  {step.num}.
                </span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          4. CORE PLATFORM CAPABILITIES
          ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Engineered for Placement Excellence
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Every module directly mirrors corporate campus placement interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                onClick={feat.action}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    {feat.tagline}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  <span>Open module</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          5. CTA BANNER
          ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white depth-surface space-y-4 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Ready to benchmark your career readiness?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Take your first 5-minute AI technical mock interview and receive immediate criteria feedback on your performance.
          </p>
          <div className="pt-2">
            <button
              onClick={onStart}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition shadow-xs btn-tactile"
            >
              Start Free AI Mock Interview
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
