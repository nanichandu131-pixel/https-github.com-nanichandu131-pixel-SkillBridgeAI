import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { InterviewResult, InterviewAnswerRecord, InterviewType, DifficultyLevel } from '../../types';
import { storageService } from '../../services/storageService';
import { geminiService } from '../../services/geminiService';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Calendar,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface InterviewReportModalProps {
  answers: InterviewAnswerRecord[];
  targetRole: string;
  interviewType: InterviewType;
  difficulty: DifficultyLevel;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const InterviewReportModal: React.FC<InterviewReportModalProps> = ({
  answers,
  targetRole,
  interviewType,
  difficulty,
  onClose,
  onNavigate,
}) => {
  const { profile } = useAuth();
  const [expandedAnswer, setExpandedAnswer] = useState<number | null>(null);
  const [isAddingToPlan, setIsAddingToPlan] = useState<boolean>(false);
  const [planAddedSuccess, setPlanAddedSuccess] = useState<boolean>(false);

  // Compute aggregate scores from real candidate answers
  const validAnswers = answers.filter((a) => a.evaluation && a.evaluation.score > 0);
  const overallScore =
    validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.score || 0), 0) / validAnswers.length)
      : 0;

  const catScores = {
    technicalKnowledge: validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.categories?.technicalAccuracy || 0), 0) / validAnswers.length)
      : 0,
    communication: validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.categories?.communication || 0), 0) / validAnswers.length)
      : 0,
    problemSolving: validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.categories?.completeness || 0), 0) / validAnswers.length)
      : 0,
    coding: validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.categories?.relevance || 0), 0) / validAnswers.length)
      : 0,
    answerQuality: validAnswers.length > 0
      ? Math.round(validAnswers.reduce((acc, a) => acc + (a.evaluation?.categories?.clarity || 0), 0) / validAnswers.length)
      : 0,
  };

  const strongSet = new Set<string>();
  const weakSet = new Set<string>();
  answers.forEach((a) => {
    a.evaluation?.strongPoints?.forEach((sp: string) => strongSet.add(sp));
    a.evaluation?.areasToImprove?.forEach((wp: string) => weakSet.add(wp));
  });

  const strongAreas = Array.from(strongSet).slice(0, 4);
  const areasToImprove = Array.from(weakSet).slice(0, 4);

  const actionableFeedback =
    areasToImprove.length > 0
      ? `Prioritize deeper technical reasoning and STAR structured communication. Specifically focus on: ${areasToImprove[0]}.`
      : 'Solid interview performance. Continue polishing edge-case architecture and quantifiable impact.';

  // Fire confetti if strong score
  useEffect(() => {
    if (overallScore >= 75) {
      try {
        confetti({
          particleCount: 80,
          spread: 55,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }

    const profile = storageService.getProfile();
    const result: InterviewResult = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'int_' + Date.now(),
      userId: profile.id,
      interviewType,
      targetRole,
      difficulty,
      date: new Date().toISOString(),
      overallScore,
      categoryScores: catScores,
      strongAreas: strongAreas.length > 0 ? strongAreas : ['Clear articulation of technical concepts', 'Good foundation'],
      areasToImprove: areasToImprove.length > 0 ? areasToImprove : ['Include time complexity benchmarks', 'Expand on system trade-offs'],
      actionableFeedback,
      answers,
    };
    storageService.saveInterview(result);
  }, []);

  const handleGenerateLearningPlan = async () => {
    setIsAddingToPlan(true);
    try {
      const plan = await geminiService.generateLearningPlan({
        targetRole,
        weakAreas: areasToImprove,
        strongAreas,
        averageScore: overallScore,
      });
      if (plan) {
        storageService.saveLearningPlan(plan);
        setPlanAddedSuccess(true);
      }
    } catch (e) {
      console.warn('Failed to generate learning plan:', e);
    } finally {
      setIsAddingToPlan(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto space-y-6 depth-surface">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2.5">
            <UserAvatar
              email={profile.email}
              name={profile.fullName}
              photoUrl={profile.avatarUrl}
              size="sm"
            />
            <div className="text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {profile.fullName || profile.email?.split('@')[0] || 'Candidate'}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {profile.email}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Interview Evaluation Report</span>
            <span aria-hidden="true">·</span>
            <span>{targetRole}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{interviewType} ({difficulty})</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Performance & Criteria Breakdown
          </h2>
        </div>

        {/* Score Header */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex flex-col items-center justify-center shrink-0">
              <span className="text-xl font-bold font-mono tabular-nums">{overallScore}%</span>
              <span className="text-[9px] uppercase tracking-wider font-semibold">Overall</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {overallScore >= 80 ? 'Placement Ready' : overallScore >= 65 ? 'Good Foundation' : 'Needs Practice'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5 leading-relaxed">
                Evaluated across {answers.length} questions assessing relevance, technical depth, and communication.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleGenerateLearningPlan}
              disabled={isAddingToPlan || planAddedSuccess}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5 btn-tactile ${
                planAddedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {planAddedSuccess
                  ? 'Roadmap Updated ✓'
                  : isAddingToPlan
                  ? 'Generating Plan...'
                  : 'Add Weak Areas to Plan'}
              </span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNavigate('companies');
              }}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition flex items-center justify-center space-x-1.5 btn-tactile"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Company Matches</span>
            </button>
          </div>
        </div>

        {/* Dimension Breakdown */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Category Dimension Scores
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: 'Technical Depth', val: catScores.technicalKnowledge },
              { label: 'Communication', val: catScores.communication },
              { label: 'Problem Solving', val: catScores.problemSolving },
              { label: 'Coding Precision', val: catScores.coding },
              { label: 'Answer Structure', val: catScores.answerQuality },
            ].map((p) => (
              <div key={p.label} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block truncate">{p.label}</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5 block">{p.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Key Strengths</span>
            </span>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {strongAreas.map((s, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Priority Areas for Growth</span>
            </span>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
              {areasToImprove.map((w, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Transcript */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Question Review ({answers.length})
          </span>
          <div className="space-y-2">
            {answers.map((ans, idx) => {
              const isExpanded = expandedAnswer === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-xs"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedAnswer(isExpanded ? null : idx)}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <div className="min-w-0 pr-4">
                      <span className="font-semibold text-slate-900 dark:text-white block truncate">
                        Q{idx + 1}: {ans.questionText}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {ans.evaluation?.score || 0}%
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Your Response:</span>
                        <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                          {ans.userAnswer}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">Interviewer Assessment:</span>
                        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                          {ans.evaluation?.constructiveFeedback}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('dashboard');
            }}
            className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs btn-tactile"
          >
            Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
