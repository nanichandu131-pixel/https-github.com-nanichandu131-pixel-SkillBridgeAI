import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { BookmarkItem } from '../../types';
import {
  Bookmark,
  Trash2,
  BookOpen,
  Code2,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface BookmarksViewProps {
  onNavigate: (tab: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ onNavigate }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => storageService.getBookmarks());
  const [filterType, setFilterType] = useState<string>('all');

  const handleRemove = (item: BookmarkItem) => {
    storageService.toggleBookmark(item);
    setBookmarks(storageService.getBookmarks());
  };

  const filtered = bookmarks.filter((b) => filterType === 'all' || b.type === filterType);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
            <span>Saved Reference</span>
            <span>·</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">{bookmarks.length} Items</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Saved Bookmarks</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Questions, coding challenges, and verified companies flagged for revision.
          </p>
        </div>

        <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {['all', 'question', 'coding', 'company'].map((ft) => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition ${
                filterType === ft
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ft === 'all' ? 'All' : ft + 's'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 surface-panel rounded-lg border border-slate-200/90 dark:border-slate-800">
          <Bookmark className="w-6 h-6 mx-auto text-slate-400 mb-2" />
          <p className="text-xs">No bookmarks saved yet in this category.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="surface-panel p-3.5 rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700">
                  {item.type === 'coding' ? (
                    <Code2 className="w-4 h-4" />
                  ) : item.type === 'company' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-semibold">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.subtitle} · Saved {new Date(item.savedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => onNavigate(item.type === 'coding' ? 'coding' : item.type === 'company' ? 'companies' : 'bank')}
                  className="btn-tactile px-2.5 py-1 rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium hover:bg-slate-800 transition flex items-center space-x-1"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleRemove(item)}
                  className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  title="Remove Bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
