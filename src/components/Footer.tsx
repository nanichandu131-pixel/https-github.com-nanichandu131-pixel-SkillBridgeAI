import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="4" cy="18" r="2" />
                  <circle cx="20" cy="18" r="2" />
                  <path d="M4 16 C 8 8, 16 8, 20 16" />
                  <path d="M12 11 L 12 5" />
                  <polygon points="12,2 15,6 9,6" fill="currentColor" />
                </svg>
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">SkillBridge AI</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Career and interview preparation platform for engineering students and early-career developers.
            </p>
          </div>

          {/* Modules */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Practice Modules
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('interview')} className="hover:text-slate-900 dark:hover:text-white transition">
                  AI Mock Interviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('coding')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Coding Assessments
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('resume')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Resume Defense AI
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('bank')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Question Bank
                </button>
              </li>
            </ul>
          </div>

          {/* Roadmap & Skills */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Career Acceleration
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigate('skillgap')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Skill Gap Benchmarking
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('learning')} className="hover:text-slate-900 dark:hover:text-white transition">
                  4-Week Learning Roadmap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('companies')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Verified Company Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('progress')} className="hover:text-slate-900 dark:hover:text-white transition">
                  Interview Analytics
                </button>
              </li>
            </ul>
          </div>

          {/* Roles */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Target Roles
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full Stack Developer · Frontend Developer · Backend Developer · Java Developer · Python Developer · Data Analyst
            </p>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>© 2026 SkillBridge AI. Built for placement readiness.</span>
          <div className="flex items-center space-x-4">
            <span>Client-side private evaluation</span>
            <span>·</span>
            <span>Zero telemetry tracking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
