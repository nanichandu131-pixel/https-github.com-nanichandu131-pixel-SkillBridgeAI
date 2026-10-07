import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LearningPlan } from '../../types';
import { storageService } from '../../services/storageService';
import { geminiService } from '../../services/geminiService';
import {
  Calendar,
  Clock,
  Sparkles,
  Filter,
  Check,
  RotateCcw,
  ArrowRight,
  Target,
  CheckCircle2,
} from 'lucide-react';

interface LearningPlanViewProps {
  onStartMock: () => void;
  onStartCoding: () => void;
}

export const LearningPlanView: React.FC<LearningPlanViewProps> = ({
  onStartMock,
  onStartCoding,
}) => {
  const { profile } = useAuth();
  const [plan, setPlan] = useState<LearningPlan | null>(() => storageService.getLearningPlan());
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // If no plan stored, fetch/generate one
  useEffect(() => {
    if (!plan) {
      handleRegeneratePlan();
    }
  }, []);

  const handleRegeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const newPlan = await geminiService.generateLearningPlan({
        targetRole: profile.career?.targetRole || 'Full Stack Developer',
        currentSkills: profile.skills || [],
      });
      if (newPlan) {
        setPlan(newPlan);
        storageService.saveLearningPlan(newPlan);
      }
    } catch (e) {
      console.warn('Failed to regenerate plan:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = (taskId: string, currentCompleted: boolean) => {
    const updated = storageService.updateTaskStatus(taskId, !currentCompleted);
    if (updated) {
      setPlan({ ...updated });
    }
  };

  if (!plan) {
    return (
      <div className="py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-slate-900 dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Synthesizing personalized 4-week roadmap...
        </h3>
        <p className="text-xs text-slate-500">
          Calibrating against {profile.career?.targetRole || 'Full Stack Developer'} curriculum
        </p>
      </div>
    );
  }

  const tasks = plan.tasks || [];
  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / Math.max(1, tasks.length)) * 100);

  // Filter tasks by week and category
  const filteredTasks = tasks.filter((t) => {
    const matchesWeek = t.weekNumber === selectedWeek;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesWeek && matchesCategory;
  });

  const weekDescriptions: Record<number, { title: string; desc: string }> = {
    1: { title: 'Week 1: Core Fundamentals & Weak Areas', desc: 'Strengthen essential language principles, database basics, and answer structures.' },
    2: { title: 'Week 2: Intermediate Concepts & DSA', desc: 'Two-pointer algorithmic patterns, API design, and behavioral frameworks.' },
    3: { title: 'Week 3: Advanced Architecture & Projects', desc: 'Tree algorithms, transaction isolation, and resume project defense.' },
    4: { title: 'Week 4: Mock Simulations & Final Polish', desc: 'Timed coding rounds, full AI mocks, and company-specific preparation.' },
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER SECTION - Layered Surface */}
      <div className="surface-panel p-6 sm:p-7 relative overflow-hidden border border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Curriculum Acceleration</span>
              <span>·</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">28-Day Plan</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Structured Preparation Roadmap
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Target Role: <strong className="text-slate-900 dark:text-white">{plan.targetRole}</strong>. 45-minute daily practice sessions targeted at high-frequency placement topics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRegeneratePlan}
              disabled={isGenerating}
              className="btn-tactile px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Updating...' : 'Regenerate Plan'}</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-slate-700 dark:text-slate-300">Overall Completion</span>
            <span className="font-mono text-slate-900 dark:text-white">
              {completedCount} of {tasks.length} tasks ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* WEEK TABS & FILTER BAR */}
      <div className="space-y-3">
        {/* Week Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4].map((w) => {
            const isSelected = selectedWeek === w;
            const weekTasks = tasks.filter((t) => t.weekNumber === w);
            const weekDone = weekTasks.filter((t) => t.completed).length;
            return (
              <button
                key={w}
                type="button"
                onClick={() => setSelectedWeek(w)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 dark:border-slate-100 bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-900/10 dark:ring-slate-100/10'
                    : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={`font-bold ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                    Week {w}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {weekDone}/7
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {weekDescriptions[w].title.split(':')[1]}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-slate-400 flex items-center space-x-1 mr-1">
            <Filter className="w-3 h-3" />
            <span>Category:</span>
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'technical', label: 'Technical' },
            { id: 'dsa', label: 'Algorithms' },
            { id: 'hr', label: 'HR / Behavioral' },
            { id: 'resume', label: 'Resume Defense' },
            { id: 'mock_interview', label: 'AI Mock' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                categoryFilter === cat.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* WEEK HEADER */}
      <div className="p-3.5 rounded-lg bg-slate-100/70 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
          {weekDescriptions[selectedWeek].title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {weekDescriptions[selectedWeek].desc}
        </p>
      </div>

      {/* DAILY TASK CARDS LIST */}
      <div className="space-y-2.5">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              task.completed
                ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                : 'surface-panel border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start space-x-3">
              <button
                type="button"
                onClick={() => handleToggleTask(task.id, !!task.completed)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 mt-0.5 ${
                  task.completed
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white'
                }`}
              >
                {task.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-semibold">
                    {task.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{task.durationMinutes}m</span>
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Focus: <strong className="text-slate-700 dark:text-slate-300">{task.topic}</strong>
                </p>

                {task.resourceGuide && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-md border border-slate-200/60 dark:border-slate-800 mt-1.5">
                    <strong>Drill:</strong> {task.resourceGuide}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Practice Triggers */}
            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              {task.category === 'dsa' && (
                <button
                  onClick={onStartCoding}
                  className="btn-tactile px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium hover:bg-slate-800 transition flex items-center space-x-1"
                >
                  <span>Code Drill</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {task.category === 'mock_interview' && (
                <button
                  onClick={onStartMock}
                  className="btn-tactile px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium hover:bg-slate-800 transition flex items-center space-x-1"
                >
                  <span>Start Mock</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
