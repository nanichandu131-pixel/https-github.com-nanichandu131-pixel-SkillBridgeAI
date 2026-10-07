import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { matchingService } from '../../services/matchingService';
import { storageService } from '../../services/storageService';
import { Company } from '../../types';
import {
  Briefcase,
  ExternalLink,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  MapPin,
} from 'lucide-react';

export const CareerMatchesView: React.FC = () => {
  const { profile } = useAuth();
  const interviews = storageService.getInterviews();
  const avgScore =
    interviews.length > 0
      ? Math.round(interviews.reduce((a, b) => a + b.overallScore, 0) / interviews.length)
      : 76;

  const companies = matchingService.matchCompanies(profile, avgScore);
  const [filterType, setFilterType] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    storageService.getBookmarks().filter((b) => b.type === 'company').map((b) => b.id)
  );

  const handleToggleBookmark = (c: Company) => {
    const loc = c.locations?.slice(0, 2).join(', ') || c.location || 'Pan India';
    storageService.toggleBookmark({
      id: c.id,
      type: 'company',
      title: c.name,
      subtitle: `${c.industry} • ${loc}`,
      savedAt: new Date().toISOString(),
      category: 'company',
    });
    setBookmarkedIds(
      storageService.getBookmarks().filter((b) => b.type === 'company').map((b) => b.id)
    );
  };

  const filtered = companies.filter((c) => {
    if (filterType === 'saas') return c.industry.toLowerCase().includes('saas') || c.industry.toLowerCase().includes('enterprise');
    if (filterType === 'fintech') return c.industry.toLowerCase().includes('fintech') || c.industry.toLowerCase().includes('finance');
    if (filterType === 'service') return c.industry.toLowerCase().includes('consulting') || c.industry.toLowerCase().includes('it services');
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            <span>Target Role Alignment</span>
            <span>·</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{profile.career?.targetRole || 'Full Stack Developer'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Company Matches For You
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Organizations whose tech stacks and early-career hiring bars match your verified profile and interview performance.
          </p>
        </div>

        <div className="flex items-center space-x-1.5">
          {['all', 'saas', 'fintech', 'service'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterType === ft
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {ft === 'all' ? 'All Roles' : ft === 'saas' ? 'Product / SaaS' : ft === 'fintech' ? 'FinTech' : 'IT Services'}
            </button>
          ))}
        </div>
      </div>

      {/* TRANSPARENCY NOTICE */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-white">Direct Verification:</span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Recommendations link directly to official verified employer career portals. Application standards are calibrated against campus hiring benchmarks.
          </p>
        </div>
      </div>

      {/* COMPANY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((company) => {
          const isSaved = bookmarkedIds.includes(company.id);
          return (
            <div
              key={company.id}
              className="surface-panel p-5 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Top Row: Name, Match Score, Bookmark */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center font-bold text-sm border border-slate-200 dark:border-slate-700">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {company.name}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          Active Track
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>{company.industry}</span>
                        <span>·</span>
                        <span className="flex items-center space-x-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{company.locations?.slice(0, 2).join(', ') || company.location}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                        {company.matchScore}%
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">
                        Match
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(company)}
                      className={`p-1.5 rounded-md border transition ${
                        isSaved
                          ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60'
                          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title="Save company"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Company Overview */}
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                  {company.description}
                </p>

                {/* Why This Matches You */}
                <div className="mt-3 p-2.5 rounded-md bg-slate-50 dark:bg-slate-850/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-1 mb-0.5">
                    <Sparkles className="w-3 h-3 text-slate-500" />
                    <span>Profile Alignment</span>
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    {company.whyMatches}
                  </p>
                </div>

                {/* Matching Skills */}
                <div className="mt-3 space-y-1">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span>Your Matching Skills ({company.matchingSkills?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {company.matchingSkills?.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills To Improve */}
                {company.skillsToImprove && company.skillsToImprove.length > 0 && (
                  <div className="mt-2.5 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span>Recommended Upgrades ({company.skillsToImprove.length})</span>
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {company.skillsToImprove.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Est. Band: <strong className="text-slate-900 dark:text-white font-mono">{company.averagePackage || '₹6 - 18 LPA'}</strong>
                </span>

                <a
                  href={company.careersUrl || company.careerPageUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile px-3 py-1.5 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
                >
                  <span>Careers Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
