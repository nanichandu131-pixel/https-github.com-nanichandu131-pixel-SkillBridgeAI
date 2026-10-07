import React, { useState } from 'react';
import { CodingProblem, CodingTestCase } from '../../types';
import { INITIAL_CODING_PROBLEMS } from '../../data/initialData';
import { codeRunnerService, CodeExecutionSummary } from '../../services/codeRunnerService';
import { geminiService } from '../../services/geminiService';
import { storageService } from '../../services/storageService';
import {
  Play,
  Send,
  Sparkles,
  Bookmark,
  CheckCircle2,
  XCircle,
  Terminal,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';

export const CodingPracticeView: React.FC = () => {
  const [problems] = useState<CodingProblem[]>(INITIAL_CODING_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem>(INITIAL_CODING_PROBLEMS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [userCode, setUserCode] = useState<string>(
    INITIAL_CODING_PROBLEMS[0].starterCode['javascript'] || ''
  );

  // Execution & Review State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<CodeExecutionSummary | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'console' | 'aireview'>('tests');
  const [aiReview, setAiReview] = useState<any | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(() => storageService.isBookmarked(INITIAL_CODING_PROBLEMS[0].id));

  // Change problem
  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    const starter = (prob.starterCode as Record<string, string>)[selectedLanguage] || prob.starterCode['javascript'] || '';
    setUserCode(starter);
    setExecResult(null);
    setAiReview(null);
    setIsSaved(storageService.isBookmarked(prob.id));
  };

  // Change language
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    const code = (selectedProblem.starterCode as Record<string, string>)[lang];
    if (code) {
      setUserCode(code);
    }
  };

  // Run code against test cases
  const handleRunTests = async () => {
    setIsRunning(true);
    setExecResult(null);
    try {
      const summary = await codeRunnerService.runCode(
        selectedLanguage,
        userCode,
        selectedProblem.testCases,
        selectedProblem.slug || selectedProblem.id
      );
      setExecResult(summary);
      setActiveTab('tests');
    } catch (e: any) {
      console.warn('Execution error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit and get Gemini Code Review
  const handleSubmitSolution = async () => {
    await handleRunTests();
    setIsReviewing(true);
    setActiveTab('aireview');
    try {
      const review = await geminiService.reviewCode({
        problemTitle: selectedProblem.title,
        language: selectedLanguage,
        code: userCode,
        testResults: execResult?.results || [],
      });
      setAiReview(review);
    } catch (e) {
      console.warn('AI review error:', e);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleToggleBookmark = () => {
    const newState = storageService.toggleBookmark({
      id: selectedProblem.id,
      type: 'coding',
      title: selectedProblem.title,
      subtitle: `${selectedProblem.category.toUpperCase()} · ${selectedProblem.difficulty}`,
      savedAt: new Date().toISOString(),
      category: selectedProblem.category,
    });
    setIsSaved(newState);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Top Bar / Problem Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={selectedProblem.id}
              onChange={(e) => {
                const found = problems.find((p) => p.id === e.target.value);
                if (found) handleSelectProblem(found);
              }}
              className="py-1.5 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.difficulty})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <span className="text-xs text-slate-500 capitalize">
            {selectedProblem.difficulty} · {selectedProblem.category}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`p-1.5 rounded-lg border transition ${
              isSaved
                ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800'
                : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Save problem"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Reset Code */}
          <button
            onClick={() => setUserCode((selectedProblem.starterCode as Record<string, string>)[selectedLanguage] || '')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Reset Starter Code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="javascript">JavaScript (ES6)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="java">Java 17</option>
            <option value="cpp">C++ 20</option>
          </select>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* Left Column: Problem Statement (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-5 overflow-y-auto max-h-[750px]">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {selectedProblem.title}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(selectedProblem.tags || [selectedProblem.category]).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <p className="whitespace-pre-line">{selectedProblem.description}</p>
          </div>

          {/* Examples */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Example Test Cases
            </h3>
            {selectedProblem.testCases.map((tc) => (
              <div
                key={tc.id}
                className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1 font-mono text-[11px]"
              >
                <div>
                  <span className="text-slate-400">Input: </span>
                  <span className="text-slate-900 dark:text-slate-200">{tc.input}</span>
                </div>
                <div>
                  <span className="text-slate-400">Expected: </span>
                  <span className="text-emerald-600 dark:text-emerald-400">{tc.expectedOutput}</span>
                </div>
                {tc.explanation && (
                  <p className="text-[10px] font-sans text-slate-500 pt-1 border-t border-slate-200/80 dark:border-slate-700/60">
                    💡 {tc.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Constraints */}
          {selectedProblem.constraints && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Constraints
              </h3>
              <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400 list-disc list-inside font-mono text-[11px]">
                {(Array.isArray(selectedProblem.constraints) ? selectedProblem.constraints : [selectedProblem.constraints]).map((c: string, i: number) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints */}
          {selectedProblem.hints && selectedProblem.hints.length > 0 && (
            <details className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <summary className="font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                💡 View Algorithmic Hint
              </summary>
              <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-400">
                {selectedProblem.hints.map((h: string, i: number) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </details>
          )}
        </div>

        {/* Right Column: Code Editor & Execution Console (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Code Editor Container */}
          <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800 shadow-md overflow-hidden flex flex-col min-h-[380px]">
            {/* Editor Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400 font-mono">
              <span className="text-slate-300 font-semibold">
                solution.{selectedLanguage === 'python' ? 'py' : selectedLanguage === 'java' ? 'java' : selectedLanguage === 'cpp' ? 'cpp' : 'js'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono tabular-nums">In-Browser VM</span>
            </div>

            {/* Code Input Area */}
            <textarea
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none min-h-[300px]"
            />

            {/* Action Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-900/90 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedLanguage === 'javascript' ? 'JavaScript Execution' : 'Syntax Check'}
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  disabled={isRunning}
                  onClick={handleRunTests}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-1.5 btn-tactile"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>{isRunning ? 'Running...' : 'Run Tests'}</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning || isReviewing}
                  onClick={handleSubmitSolution}
                  className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold transition flex items-center space-x-1.5 btn-tactile"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReviewing ? 'Analyzing...' : 'Submit & Review'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lower Results & Console Panel */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === 'tests'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setActiveTab('console')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === 'console'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Console Logs
              </button>
              <button
                onClick={() => setActiveTab('aireview')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  activeTab === 'aireview'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                AI Code Review
              </button>
            </div>

            {/* Test Results Output */}
            {activeTab === 'tests' && (
              <div className="space-y-2 text-xs">
                {execResult ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span className={execResult.status === 'passed' ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                        {execResult.status === 'passed' ? '✓ All Test Cases Passed' : '✗ Tests Failed'}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 tabular-nums">
                        {execResult.passedCount} / {execResult.totalCount} passed
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500 tabular-nums">{execResult.totalTimeMs}ms</span>
                    </div>

                    <div className="space-y-1.5">
                      {execResult.results.map((r, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                        >
                          <div className="flex items-center space-x-2">
                            {r.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                            )}
                            <span className="text-slate-700 dark:text-slate-300">Case {i + 1}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 tabular-nums">{r.executionTimeMs}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 py-3 text-center">
                    Click "Run Tests" to execute your solution against test cases.
                  </p>
                )}
              </div>
            )}

            {/* Console Output */}
            {activeTab === 'console' && (
              <pre className="p-3 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto min-h-[80px]">
                {execResult?.outputLogs?.length ? execResult.outputLogs.join('\n') : '// Console is empty'}
              </pre>
            )}

            {/* AI Review Output */}
            {activeTab === 'aireview' && (
              <div className="space-y-3 text-xs">
                {isReviewing ? (
                  <p className="text-slate-500 py-4 text-center animate-pulse">
                    Gemini AI is analyzing code time complexity, edge cases, and code style...
                  </p>
                ) : aiReview ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Code Quality Score: {aiReview.score || 85} / 100
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {aiReview.summary || 'Code logic is sound. Consider testing with large input constraints to verify memory usage.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-400 py-3 text-center">
                    Click "Submit & Review" to receive feedback from Gemini AI.
                  </p>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
