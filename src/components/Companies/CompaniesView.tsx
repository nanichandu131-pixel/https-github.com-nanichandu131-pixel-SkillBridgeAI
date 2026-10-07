import React, { useState } from 'react';
import { INITIAL_COMPANIES } from '../../data/initialData';
import { storageService } from '../../services/storageService';
import { Company } from '../../types';
import {
  Search,
  ExternalLink,
  Bookmark,
  MapPin,
  Play,
  Building2,
} from 'lucide-react';

export const CompaniesView: React.FC<{ onStartRoleMock: (role: string) => void }> = ({
  onStartRoleMock,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() =>
    storageService.getBookmarks().filter((b) => b.type === 'company').map((b) => b.id)
  );

  const filtered = INITIAL_COMPANIES.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commonSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry =
      industryFilter === 'all' ||
      c.industry.toLowerCase().includes(industryFilter.toLowerCase());

    return matchesSearch && matchesIndustry;
  });

  const handleToggleBookmark = (c: Company) => {
    const loc = c.locations?.slice(0, 2).join(', ') || c.location || 'India';
    storageService.toggleBookmark({
      id: c.id,
      type: 'company',
      title: c.name,
      subtitle: `${c.industry} · ${loc}`,
      savedAt: new Date().toISOString(),
      category: 'company',
    });
    setBookmarkedIds(
      storageService.getBookmarks().filter((b) => b.type === 'company').map((b) => b.id)
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Enterprise Directory</span>
          <span aria-hidden="true">·</span>
          <span>Hiring Criteria & Tech Stacks</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Company Discovery & Placement Criteria
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Inspect real interview expectations, common evaluation steps, and required frameworks for verified tech employers.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search companies by name or technology (e.g. React, Java, SQL, Python)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto">
          {['all', 'SaaS', 'Fintech', 'Product'].map((ind) => (
            <button
              key={ind}
              onClick={() => setIndustryFilter(ind.toLowerCase())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition btn-tactile ${
                industryFilter === ind.toLowerCase()
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {ind === 'all' ? 'All Industries' : ind}
            </button>
          ))}
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((company) => {
          const isSaved = bookmarkedIds.includes(company.id);

          return (
            <div
              key={company.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface depth-surface-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0">
                      {company.logoText || company.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 mt-0.5">
                        <span>{company.industry}</span>
                        <span aria-hidden="true">·</span>
                        <span>{company.workType}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(company)}
                    className={`p-1.5 rounded-lg border transition ${
                      isSaved
                        ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/60'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isSaved ? 'Remove bookmark' : 'Save bookmark'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed line-clamp-3">
                  {company.description}
                </p>

                {/* Common Stack */}
                <div className="mt-3.5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Core Engineering Stack
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {company.commonSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                  {company.averagePackage || '₹6 - 18 LPA'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onStartRoleMock(company.relevantRoles[0] || 'Software Developer')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold transition btn-tactile"
                  >
                    Mock Prep
                  </button>
                  <a
                    href={company.careersUrl || company.careerPageUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                    title="Open official career portal"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
