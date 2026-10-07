import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, Code2, FileText, Award, Calendar, Briefcase, Compass, BookOpen } from 'lucide-react';
import { INITIAL_QUESTION_BANK, INITIAL_CODING_PROBLEMS, INITIAL_COMPANIES } from '../data/initialData';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickNavs = [
    { id: 'interview', title: 'AI Mock Interview', icon: Sparkles, desc: 'Start HR or Technical Mock' },
    { id: 'coding', title: 'Coding Practice', icon: Code2, desc: 'Interactive algorithm editor' },
    { id: 'resume', title: 'Resume AI', icon: FileText, desc: 'Project interrogation from resume' },
    { id: 'skillgap', title: 'Skill Gap Analysis', icon: Award, desc: 'Role benchmark & missing skills' },
    { id: 'learning', title: 'Learning Plan', icon: Calendar, desc: 'Personalized 4-week roadmap' },
    { id: 'career', title: 'Career Matches', icon: Briefcase, desc: 'Matched roles & companies' },
    { id: 'bank', title: 'Question Bank', icon: BookOpen, desc: 'Placement interview questions' },
  ];

  const matchedCoding = query.trim()
    ? INITIAL_CODING_PROBLEMS.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const matchedCompanies = query.trim()
    ? INITIAL_COMPANIES.filter((c) => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  const matchedQuestions = query.trim()
    ? INITIAL_QUESTION_BANK.filter((q) => q.question.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules, questions, coding problems, companies..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          
          {/* Quick Modules */}
          {!query && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Quick Navigation
              </span>
              <div className="space-y-1">
                {quickNavs.map((n) => {
                  const Icon = n.icon;
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        onNavigate(n.id);
                        onClose();
                      }}
                      className="w-full flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
                    >
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                        <p className="text-[10px] text-slate-400">{n.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Matched Coding */}
          {matchedCoding.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Coding Problems
              </span>
              <div className="space-y-1">
                {matchedCoding.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onNavigate('coding');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{p.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 capitalize text-slate-500 font-mono">
                      {p.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Companies */}
          {matchedCompanies.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Companies
              </span>
              <div className="space-y-1">
                {matchedCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigate('companies');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left"
                  >
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-[10px] text-slate-400">{c.industry}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Questions */}
          {matchedQuestions.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-1.5">
                Questions
              </span>
              <div className="space-y-1">
                {matchedQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      onNavigate('bank');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs font-semibold text-slate-900 dark:text-white line-clamp-1"
                  >
                    {q.question}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px]">
            ESC to close
          </kbd>
        </div>
      </div>
    </div>
  );
};
