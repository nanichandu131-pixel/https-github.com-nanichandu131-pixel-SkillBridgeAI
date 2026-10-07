import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Award,
  Code2,
  FileText,
  Calendar,
  Briefcase,
  Flame,
  CheckCircle2,
  ArrowRight,
  Target,
  Play,
  Clock,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  Building2,
  AlertCircle,
  Layers,
  BookOpen,
  Compass,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { matchingService } from '../services/matchingService';
import { ROLE_TAXONOMY, INITIAL_COMPANIES } from '../data/initialData';
import { UserAvatar } from './common/UserAvatar';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onStartInterview: () => void;
  onOpenResumeUpload: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onStartInterview,
  onOpenResumeUpload,
}) => {
  const { profile } = useAuth();
  const [interviews] = useState(() => storageService.getInterviews());
  const [dailyPractice, setDailyPractice] = useState(() => storageService.getDailyPractice());
  
  const targetRole = profile.career?.targetRole || 'Software Developer';
  const userSkills = profile.skills || [];
  const skillGap = matchingService.analyzeSkillGap(targetRole, userSkills);

  // Compute key metrics from real user data only
  const totalInterviews = interviews.length;
  const hasInterviews = totalInterviews > 0;

  const avgScore = hasInterviews
    ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / totalInterviews)
    : 0;
  const bestScore = hasInterviews ? Math.max(...interviews.map((i) => i.overallScore)) : 0;

  // Career Readiness:
  // If user completed resume analysis, use their real extracted readiness benchmark
  // If interviews exist, blend real interview performance with skill readiness
  const baseResumeReadiness = profile.career?.analysis?.readinessScore ?? skillGap.skillMatchPercentage;
  const readinessScore = hasInterviews
    ? Math.round((baseResumeReadiness * 0.4) + (avgScore * 0.6))
    : baseResumeReadiness;

  // Performance category averages - only from real interview sessions
  const techScore = hasInterviews
    ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.technicalKnowledge || 0), 0) / totalInterviews)
    : 0;
  const commScore = hasInterviews
    ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.communication || 0), 0) / totalInterviews)
    : 0;
  const probScore = hasInterviews
    ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.problemSolving || 0), 0) / totalInterviews)
    : 0;
  const codeScore = hasInterviews
    ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.coding || 0), 0) / totalInterviews)
    : 0;

  const performanceDimensions = [
    { label: 'Technical Depth', score: techScore, desc: 'Concept mastery & algorithmic accuracy' },
    { label: 'STAR Communication', score: commScore, desc: 'Situation, Task, Action & Result structure' },
    { label: 'Problem Solving', score: probScore, desc: 'Logical breakdown & edge cases' },
    { label: 'System Design', score: codeScore, desc: 'Architecture & component contracts' },
  ];

  // Matched companies for target role and actual skills
  const recommendedCompanies = INITIAL_COMPANIES.filter(
    (c) =>
      c.relevantRoles.some((r) => r.toLowerCase().includes(targetRole.toLowerCase().split(' ')[0])) ||
      (userSkills.length > 0 && c.commonSkills.some((s) => userSkills.includes(s)))
  ).slice(0, 4);

  const handleToggleTask = (taskId: string) => {
    const updated = storageService.markDailyTaskCompleted(taskId);
    setDailyPractice({ ...updated });
  };

  const firstName = profile.fullName?.trim()
    ? profile.fullName.trim().split(' ')[0]
    : profile.email
    ? profile.email.split('@')[0]
    : 'Engineer';

  // SVG Radial Readiness Calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      
      {/* ========================================================
          1. WELCOME & PRIMARY CTA HERO (Focal Visual Anchor)
          ======================================================== */}
      <section className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-xs depth-surface overflow-hidden">
        {/* Subtle radial depth highlight */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Identity & Progress Header */}
          <div className="space-y-2.5 max-w-2xl">
            {/* Zero-Pill Clean Metadata with dot separators */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Target Role: <strong className="font-semibold text-slate-800 dark:text-slate-200">{targetRole}</strong></span>
              </span>
              {profile.education?.college && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span>{profile.education.college}</span>
                </>
              )}
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="inline-flex items-center space-x-1 text-amber-600 dark:text-amber-400 font-medium">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span className="tabular-nums font-semibold">
                  {profile.streakDays > 0 ? `${profile.streakDays} day${profile.streakDays === 1 ? '' : 's'} streak` : '0-day streak'}
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <UserAvatar
                email={profile.email}
                name={profile.fullName}
                photoUrl={profile.avatarUrl}
                size="lg"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {firstName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Benchmark your profile against Tier-1 engineering criteria. You are currently tracking at <strong className="font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">{readinessScore}% career readiness</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Focal Action Hub: Prominent Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 pt-2 lg:pt-0">
            <button
              onClick={onStartInterview}
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 btn-tactile group"
            >
              <Play className="w-4 h-4 fill-current text-white dark:text-slate-900 group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">
                {hasInterviews ? 'Continue Interview' : 'Start First Mock Interview'}
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('coding')}
              className="px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center space-x-1.5 btn-tactile"
            >
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>DSA Assessment</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================
          2. CAREER READINESS (Interactive Radial Gauge & Metrics)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Career Readiness
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Evaluated readiness metrics across technical depth, STAR communication, and project defense
            </p>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Detailed Analytics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Radial Visualization Card (4 Cols) */}
          <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">Overall Readiness Gauge</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono text-[11px]">
                {hasInterviews ? `${totalInterviews} session${totalInterviews === 1 ? '' : 's'} recorded` : 'Resume benchmark'}
              </span>
            </div>

            {/* Radial SVG Gauge */}
            <div className="py-4 flex flex-col items-center justify-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-100 dark:text-slate-800"
                    fill="transparent"
                  />
                  {/* Active Progress Arc */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-indigo-600 dark:text-indigo-400 transition-all duration-1000 ease-out"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                    {readinessScore}%
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Ready
                  </span>
                </div>
              </div>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400 mt-2 max-w-[200px]">
                Strong qualification match for Junior & Mid-level {targetRole} pipelines.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Verified Skills: <strong className="text-slate-900 dark:text-white tabular-nums">{skillGap.matchedSkills.length}</strong></span>
              <span>Missing Gaps: <strong className="text-amber-600 dark:text-amber-400 tabular-nums">{skillGap.missingSkills.length}</strong></span>
            </div>
          </div>

          {/* Readiness Dimension Breakdown (8 Cols) */}
          <div className="lg:col-span-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Performance Dimensions
              </span>
              <span className="text-xs text-slate-400">
                Aggregated from {totalInterviews} mock sessions
              </span>
            </div>

            {hasInterviews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {performanceDimensions.map((dim) => (
                  <div key={dim.label} className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 dark:text-white">{dim.label}</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{dim.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-800 dark:bg-slate-200 h-full rounded-full transition-all duration-500"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {dim.desc}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/80 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Complete your first interview
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Take your first AI mock interview session to unlock detailed performance dimensions across Technical Depth, STAR Communication, and Problem Solving.
                  </p>
                </div>
                <button
                  onClick={onStartInterview}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition"
                >
                  Start First Mock Interview
                </button>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Next recommended milestone: Complete a 5-question System Architecture round</span>
              </div>
              <button
                onClick={onStartInterview}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
              >
                Launch Mock Now →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          3. CONTINUE PREPARATION (Structured Practice Modules)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Continue Preparation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immediate actions designed to elevate your readiness score
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: AI Mock Interview */}
          <div
            onClick={onStartInterview}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                AI Mock Interview
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Adaptive HR and technical screening simulations with speech & text review.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-indigo-600 dark:text-indigo-400">
              <span>Start session</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Coding Practice */}
          <div
            onClick={() => onNavigate('coding')}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Coding Assessments
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Solve DSA problems with in-browser test cases and algorithmic complexity checks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <span>Solve problems</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Resume Project Defense */}
          <div
            onClick={onOpenResumeUpload}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Resume Defense AI
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Defend architectural decisions and code trade-offs from your uploaded projects.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-purple-600 dark:text-purple-400">
              <span>Upload / Defend</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Learning Plan */}
          <div
            onClick={() => onNavigate('learning')}
            className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                4-Week Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Personalized study units systematically addressing your verified skill gaps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-medium text-rose-600 dark:text-rose-400">
              <span>View roadmap</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================
          4. SKILL GAPS & DAILY PRACTICE (Targeted Gap Closing)
          ======================================================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Skill Gaps (7 cols) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Skill Gaps for {targetRole}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Benchmark against corporate job descriptions
              </p>
            </div>
            <button
              onClick={() => onNavigate('skillgap')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Analyze All
            </button>
          </div>

          <div className="space-y-3">
            {skillGap.missingSkills.length > 0 ? (
              skillGap.missingSkills.slice(0, 4).map((skill, idx) => (
                <div
                  key={skill}
                  className="p-3.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">{skill}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        {idx === 0 ? 'High Priority Gap' : 'Recommended'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Expected in {targetRole} interviews at top tech companies.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('learning')}
                    className="shrink-0 px-3 py-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
                  >
                    Study Plan
                  </button>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <p>All core skills for {targetRole} are verified on your profile!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recommended Daily Practice Routine (5 cols) */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Recommended Practice
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daily streak maintenance drills
              </p>
            </div>
            <button
              onClick={() => onNavigate('daily')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Daily View
            </button>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: 'task-hr',
                type: 'HR Verbal Drill',
                title: dailyPractice.hrQuestion.question,
                time: '5 min',
                action: () => onNavigate('daily'),
              },
              {
                id: 'task-tech',
                type: 'Technical Concept',
                title: dailyPractice.technicalQuestions[0]?.question || 'Explain OOP principles',
                time: '10 min',
                action: () => onNavigate('daily'),
              },
              {
                id: 'task-code',
                type: 'Code Challenge',
                title: dailyPractice.codingProblem.title,
                time: '20 min',
                action: () => onNavigate('coding'),
              },
            ].map((task) => {
              const isCompleted = dailyPractice.completedTasks.includes(task.id);
              return (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                      aria-label="Toggle task completion"
                    >
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {task.type} · {task.time}
                      </span>
                      <p className={`font-medium truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={task.action}
                    className="shrink-0 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Practice →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </section>

      {/* ========================================================
          5. INTERVIEW PERFORMANCE & RECENT SESSIONS
          ======================================================== */}
      <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Recent Interview Performance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Criteria evaluation scores from your completed AI interviews
            </p>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>All History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {interviews.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {interviews.slice(0, 3).map((result) => (
              <div key={result.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white capitalize">
                      {result.interviewType} Round
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 capitalize">{result.difficulty}</span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-400 font-mono text-[11px]">{new Date(result.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                    {result.actionableFeedback}
                  </p>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <div className="text-right">
                    <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                      {result.overallScore}%
                    </span>
                    <span className="text-[10px] text-slate-400 block">Overall Score</span>
                  </div>
                  <button
                    onClick={() => onNavigate('progress')}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500 space-y-3">
            <p>You haven't completed any mock rounds yet. Take your first 5-minute session today!</p>
            <button
              onClick={onStartInterview}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition"
            >
              Start First Mock Interview
            </button>
          </div>
        )}
      </section>

      {/* ========================================================
          6. COMPANY MATCHES (Tailored to Target Role & Skills)
          ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Companies For You
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tech leaders actively hiring {targetRole.split(' ')[0]} talent with matching stack requirements
            </p>
          </div>
          <button
            onClick={() => onNavigate('companies')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <span>Browse Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedCompanies.map((comp) => {
            // Match score calculation based purely on real user skills
            const matchingCount = comp.commonSkills.filter((s) => userSkills.includes(s)).length;
            const matchRate = comp.commonSkills.length > 0
              ? Math.round((matchingCount / comp.commonSkills.length) * 100)
              : 0;

            return (
              <div
                key={comp.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200">
                      {comp.logoText}
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono tabular-nums">
                      {matchRate}% Match
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-3 truncate">
                    {comp.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {comp.industry} · {comp.workType}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={onStartInterview}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Mock for {comp.name.split(' ')[0]}
                  </button>
                  <a
                    href={comp.careersUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition p-1"
                    title={`Visit ${comp.name} careers portal`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
