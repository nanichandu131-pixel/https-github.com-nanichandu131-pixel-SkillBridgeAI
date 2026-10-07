import React, { useState } from 'react';
import { QuestionBankItem } from '../../types';
import { INITIAL_QUESTION_BANK } from '../../data/initialData';
import { storageService } from '../../services/storageService';
import {
  BookOpen,
  Search,
  Bookmark,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface QuestionBankViewProps {
  onPracticeQuestion: (q: QuestionBankItem) => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ onPracticeQuestion }) => {
  const [questions] = useState<QuestionBankItem[]>(INITIAL_QUESTION_BANK);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    storageService.getBookmarks().filter((b) => b.type === 'question').map((b) => b.id)
  );

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'hr', label: 'Behavioral & STAR' },
    { id: 'java', label: 'Java Core' },
    { id: 'javascript', label: 'JavaScript & React' },
    { id: 'python', label: 'Python' },
    { id: 'sql', label: 'SQL & Database' },
    { id: 'system_design', label: 'System Design' },
    { id: 'aptitude', label: 'Logic & Problem Solving' },
  ];

  const filtered = questions.filter((q) => {
    const tags = q.tags || q.keyConcepts || [];
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleToggleBookmark = (q: QuestionBankItem) => {
    storageService.toggleBookmark({
      id: q.id,
      type: 'question',
      title: q.question,
      subtitle: `${q.category.toUpperCase()} • ${q.difficulty}`,
      savedAt: new Date().toISOString(),
      category: q.category,
    });
    setBookmarkedIds(
      storageService.getBookmarks().filter((b) => b.type === 'question').map((b) => b.id)
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
            <span>Placement Question Repository</span>
            <span>·</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{questions.length} Questions</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Interview Question Bank
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Frequently asked questions across engineering placement drives with model answer rubrics and key architectural concepts.
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword, topic, or concept (e.g. HashMap, ACID, STAR)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
          <span>Showing {filtered.length} curated questions</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 surface-panel rounded-lg border border-slate-200/90 dark:border-slate-800">
            No questions matched your current filter criteria.
          </div>
        ) : (
          filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isSaved = bookmarkedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className="surface-panel p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 capitalize">
                        {item.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.question}
                    </h3>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {(item.tags || item.keyConcepts || []).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleBookmark(item)}
                      className={`p-1.5 rounded-md border transition ${
                        isSaved
                          ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Bookmark Question"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>

                    <button
                      onClick={() => onPracticeQuestion(item)}
                      className="btn-tactile px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Practice Mock</span>
                    </button>
                  </div>
                </div>

                {/* Model Answer Breakdown Dropdown */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1 transition"
                  >
                    <span>{isExpanded ? 'Hide Model Answer Structure' : 'View Expected Rubric & Model Points'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-md bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white block text-[11px] uppercase tracking-wider">
                        Key Points for High Scores:
                      </span>
                      {item.expectedPoints && item.expectedPoints.length > 0 ? (
                        <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-xs">
                          {item.expectedPoints.map((pt: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-1.5">
                              <span className="text-emerald-500 font-bold shrink-0">✓</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                          {item.sampleAnswerTips || 'Structure using Situation, Task, Action, and Measurable Result.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
