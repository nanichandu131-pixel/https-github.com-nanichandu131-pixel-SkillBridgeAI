import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { InterviewResult } from '../../types';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ProgressHistoryView: React.FC<{ onStartNew: () => void }> = ({ onStartNew }) => {
  const [interviews] = useState<InterviewResult[]>(() => storageService.getInterviews());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const total = interviews.length;
  const avg =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / total)
      : 0;
  const highest =
    total > 0 ? Math.max(...interviews.map((i) => i.overallScore)) : 0;

  // Aggregate category averages - only from real interview sessions
  const avgTech =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.technicalKnowledge || 0), 0) / total)
      : 0;
  const avgComm =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.communication || 0), 0) / total)
      : 0;
  const avgProb =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.problemSolving || 0), 0) / total)
      : 0;
  const avgCode =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.coding || 0), 0) / total)
      : 0;
  const avgQuality =
    total > 0
      ? Math.round(interviews.reduce((acc, i) => acc + (i.categoryScores?.answerQuality || 0), 0) / total)
      : 0;

  // Real improvement from initial mock
  let improvementText = total > 1 ? '0%' : 'N/A';
  if (total > 1) {
    const oldest = interviews[total - 1].overallScore;
    const latest = interviews[0].overallScore;
    const diff = latest - oldest;
    improvementText = diff >= 0 ? `+${diff}%` : `${diff}%`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
            <span>Interview Analytics</span>
            <span>·</span>
            <span>Historical Evaluations</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Performance & Trajectory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Longitudinal score history across behavioral and technical mock interviews with competency breakdowns.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="btn-tactile px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition"
        >
          + Start New Mock
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Sessions</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {total}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Rounds evaluated</span>
        </div>

        <div className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Avg Score</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {avg}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">Cross-round baseline</span>
        </div>

        <div className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Top Score</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {highest}%
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">Peak performance</span>
        </div>

        <div className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Improvement</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block font-mono">
            {improvementText}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">{total > 1 ? 'Over initial mock' : 'Requires 2+ sessions'}</span>
        </div>
      </div>

      {total === 0 ? (
        <div className="surface-panel p-8 rounded-xl border border-slate-200/90 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Complete your first interview
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              No interview history recorded yet. Complete your first AI mock session to unlock historical trajectory benchmarks, 5-core competency breakdown, and longitudinal performance analytics.
            </p>
          </div>
          <button
            onClick={onStartNew}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition"
          >
            Start First Mock Interview
          </button>
        </div>
      ) : (
        <>
          {/* 5-PILLAR RADAR BARS & TRAJECTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* 5 Dimensions (6 Cols) */}
            <div className="lg:col-span-6 surface-panel p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Competency Breakdown
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">5 Core Dimensions</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Technical Accuracy & Principles', val: avgTech },
                  { label: 'Communication & STAR Structure', val: avgComm },
                  { label: 'Problem Solving & Architecture', val: avgProb },
                  { label: 'Coding & Algorithmic Efficiency', val: avgCode },
                  { label: 'Answer Completeness & Polish', val: avgQuality },
                ].map((dim) => (
                  <div key={dim.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{dim.label}</span>
                      <span className="font-mono text-slate-900 dark:text-white font-semibold">{dim.val}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900 dark:bg-slate-100 transition-all duration-500"
                        style={{ width: `${dim.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronological Score Timeline (6 Cols) */}
            <div className="lg:col-span-6 surface-panel p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                  Score Timeline
                </h3>
                <p className="text-xs text-slate-500">Progressive score evolution across recent interview attempts.</p>
              </div>

              <div className="flex items-end space-x-3 h-40 pt-4 px-1">
                {interviews.slice(0, 6).reverse().map((intv, idx) => (
                  <div key={intv.id || idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-mono font-bold text-slate-900 dark:text-white">
                      {intv.overallScore}%
                    </span>
                    <div
                      className="w-full max-w-[36px] bg-slate-900 dark:bg-slate-200 rounded-t-sm transition-all"
                      style={{ height: `${(intv.overallScore / 100) * 95}px` }}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      R{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-400 text-center border-t border-slate-100 dark:border-slate-800">
                Consecutive upward progression demonstrates consistent interview readiness.
              </div>
            </div>

          </div>

          {/* SESSIONS HISTORY ACCORDION */}
          <div className="surface-panel p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Completed Sessions Log
            </h3>

            <div className="space-y-2">
              {interviews.map((session) => {
                const isExp = expandedId === session.id;
                return (
                  <div
                    key={session.id}
                    className="border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden bg-white dark:bg-slate-900/60"
                  >
                    <div
                      onClick={() => setExpandedId(isExp ? null : session.id)}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs flex items-center justify-center font-mono border border-slate-200 dark:border-slate-700">
                          {session.overallScore}%
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {session.interviewType.toUpperCase()} MOCK
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium capitalize">
                              {session.difficulty}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {session.targetRole} · {new Date(session.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-slate-600 dark:text-slate-400 hidden md:inline truncate max-w-xs text-[11px]">
                          {session.actionableFeedback.slice(0, 50)}...
                        </span>
                        {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {isExp && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 space-y-3 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                              Demonstrated Strengths:
                            </span>
                            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              {session.strongAreas?.map((sa, i) => (
                                <li key={i}>• {sa}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                            <span className="font-bold text-amber-700 dark:text-amber-400 block mb-1">
                              Focus Upgrades:
                            </span>
                            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                              {session.areasToImprove?.map((ai, i) => (
                                <li key={i}>• {ai}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="p-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                          <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                            Coach's Detailed Action Plan:
                          </span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                            {session.actionableFeedback}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
