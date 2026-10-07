import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { DailyPracticeSet } from '../../types';
import {
  Flame,
  ArrowRight,
  Check,
  Calendar,
} from 'lucide-react';

interface DailyPracticeViewProps {
  onStartSingleMock: (qText: string, category: string) => void;
  onStartCoding: () => void;
}

export const DailyPracticeView: React.FC<DailyPracticeViewProps> = ({
  onStartSingleMock,
  onStartCoding,
}) => {
  const { profile } = useAuth();
  const [dailySet, setDailySet] = useState<DailyPracticeSet>(() => storageService.getDailyPractice());

  const handleCompleteTask = (taskId: string) => {
    const updated = storageService.markDailyTaskCompleted(taskId);
    setDailySet({ ...updated });
  };

  const tasks = [
    {
      id: 'task-hr',
      title: 'HR / Behavioral Question',
      type: 'Behavioral',
      item: dailySet.hrQuestion,
      badge: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
      action: () => onStartSingleMock(dailySet.hrQuestion.question, 'hr'),
    },
    {
      id: 'task-tech-1',
      title: 'Technical Core Drill #1',
      type: 'Core Concept',
      item: dailySet.technicalQuestions[0],
      badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
      action: () => onStartSingleMock(dailySet.technicalQuestions[0].question, 'technical'),
    },
    {
      id: 'task-tech-2',
      title: 'Technical Core Drill #2',
      type: 'System Design',
      item: dailySet.technicalQuestions[1],
      badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300',
      action: () => onStartSingleMock(dailySet.technicalQuestions[1].question, 'technical'),
    },
    {
      id: 'task-coding',
      title: 'Daily Algorithm Challenge',
      type: 'DSA Practice',
      item: { question: `${dailySet.codingProblem.title} (${dailySet.codingProblem.difficulty})` },
      badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      action: () => onStartCoding(),
    },
  ];

  const completedToday = dailySet.completedTasks.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HERO STREAK BANNER */}
      <div className="surface-panel p-6 sm:p-7 relative overflow-hidden border border-slate-200/90 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Placement Habit Tracker</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {profile.streakDays > 0 ? `${profile.streakDays}-Day` : '0-Day'} Active Practice Streak
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              4 micro-drills every day builds muscle memory for on-campus interviews and technical phone screens.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 text-center shrink-0 min-w-32">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{completedToday} / 4</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-0.5">
              Completed Today
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedToday / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* TODAY'S 4 TASKS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Daily Drill Set
          </h2>
          <span className="text-xs text-slate-400">Resets daily at midnight</span>
        </div>

        <div className="space-y-2.5">
          {tasks.map((task) => {
            const isDone = dailySet.completedTasks.includes(task.id);

            return (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75'
                    : 'surface-panel border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 mt-0.5 ${
                      isDone
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white'
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${task.badge}`}>
                        {task.type}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {task.title}
                      </span>
                    </div>

                    <p className={`text-xs ${isDone ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      "{task.item?.question}"
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                  <button
                    onClick={task.action}
                    className="btn-tactile px-3.5 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
