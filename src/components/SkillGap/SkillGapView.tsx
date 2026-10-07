import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchingService } from '../../services/matchingService';
import { ROLE_TAXONOMY, COMMON_SKILLS_LIST } from '../../data/initialData';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Info,
  Briefcase,
  Check,
  ArrowRight,
} from 'lucide-react';

interface SkillGapViewProps {
  onGeneratePlan: (role: string, missingSkills: string[]) => void;
}

export const SkillGapView: React.FC<SkillGapViewProps> = ({ onGeneratePlan }) => {
  const { profile, updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>(
    profile.career?.targetRole || 'Full Stack Developer'
  );
  const [userSkills, setUserSkills] = useState<string[]>(profile.skills || []);

  const analysis = matchingService.analyzeSkillGap(selectedRole, userSkills);

  const toggleSkill = (skill: string) => {
    let updated: string[];
    if (userSkills.includes(skill)) {
      updated = userSkills.filter((s) => s !== skill);
    } else {
      updated = [...userSkills, skill];
    }
    setUserSkills(updated);
    updateProfile({ skills: updated });
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    updateProfile({
      career: {
        ...(profile.career || {
          experienceLevel: 'fresher',
          preferredLocation: 'Remote',
          workPreference: 'hybrid',
        }),
        targetRole: role,
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Skill Benchmarking</span>
            <span aria-hidden="true">·</span>
            <span>Target Role Requirements vs Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skill Gap Analysis
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Directly compare your verified skills against corporate hiring expectations to pinpoint high-priority study gaps.
          </p>
        </div>

        <button
          onClick={() => onGeneratePlan(selectedRole, analysis.missingSkills)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition flex items-center space-x-2 btn-tactile self-start sm:self-auto shrink-0 shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Generate 4-Week Roadmap</span>
        </button>
      </div>

      {/* Role Picker & Main Score Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Role Picker (5 Cols) */}
        <div className="md:col-span-5 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-4">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Target Engineering Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
          >
            {Object.keys(ROLE_TAXONOMY).map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {ROLE_TAXONOMY[selectedRole]?.description}
          </p>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block">Benchmark Requirements:</span>
            <span>{ROLE_TAXONOMY[selectedRole]?.requiredSkills.length} core technical competencies</span>
          </div>
        </div>

        {/* Match Percentage Visualizer (7 Cols) */}
        <div className="md:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Alignment Score
              </span>
              <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                {analysis.skillMatchPercentage}%
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                {analysis.matchedSkills.length} of {ROLE_TAXONOMY[selectedRole]?.requiredSkills.length}
              </span>
              <span className="block text-[11px] text-slate-400">Core skills matched</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 dark:bg-slate-100 h-full rounded-full transition-all duration-500"
              style={{ width: `${analysis.skillMatchPercentage}%` }}
            />
          </div>

          <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
                Verified Skills ({analysis.matchedSkills.length})
              </span>
              <span className="text-slate-700 dark:text-slate-300 mt-1 block truncate">
                {analysis.matchedSkills.slice(0, 3).join(', ')}...
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                Gaps to Bridge ({analysis.missingSkills.length})
              </span>
              <span className="text-slate-700 dark:text-slate-300 mt-1 block truncate">
                {analysis.missingSkills.slice(0, 3).join(', ')}...
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* SKILL COMPARISON MATRICES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Verified Matched Skills */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Verified On Profile ({analysis.matchedSkills.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">Ready for interview</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {analysis.matchedSkills.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>Missing Role Competencies ({analysis.missingSkills.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">High priority</span>
          </div>

          <div className="space-y-2">
            {analysis.missingSkills.map((s) => (
              <div
                key={s}
                className="p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-white">{s}</span>
                <button
                  onClick={() => toggleSkill(s)}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Mark Verified +
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
