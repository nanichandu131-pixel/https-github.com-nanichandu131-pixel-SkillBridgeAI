import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Flame,
  Sun,
  Moon,
  Bell,
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  BookOpen,
  Calendar,
  Briefcase,
  Layers,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserAvatar } from './common/UserAvatar';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onStartInterview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onStartInterview,
}) => {
  const { profile, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => storageService.getNotifications());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkNotifsRead = () => {
    storageService.markNotificationsRead();
    setNotifications(storageService.getNotifications());
  };

  // 4-6 primary nav items with single-line labels
  const primaryNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'interview', label: 'Interview Prep', isInterviewLaunch: true },
    { id: 'coding', label: 'Assessments' },
    { id: 'skillgap', label: 'Skills' },
    { id: 'companies', label: 'Companies' },
    { id: 'profile', label: 'Profile' },
  ];

  const secondaryNavItems = [
    { id: 'resume', label: 'Resume Defense AI', icon: Sparkles },
    { id: 'learning', label: '4-Week Learning Plan', icon: Calendar },
    { id: 'career', label: 'Role & Stack Matches', icon: Briefcase },
    { id: 'bank', label: 'Question Bank', icon: BookOpen },
    { id: 'daily', label: 'Daily Practice Streak', icon: Flame },
    { id: 'progress', label: 'Performance History', icon: Layers },
    { id: 'bookmarks', label: 'Saved Bookmarks', icon: Award },
  ];

  const firstName = profile.fullName?.trim()
    ? profile.fullName.trim().split(' ')[0]
    : profile.email
    ? profile.email.split('@')[0]
    : 'User';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Zone 1: Single Element Brand Wordmark */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="4" cy="18" r="2" />
                <circle cx="20" cy="18" r="2" />
                <path d="M4 16 C 8 8, 16 8, 20 16" />
                <path d="M12 11 L 12 5" />
                <polygon points="12,2 15,6 9,6" fill="currentColor" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              SkillBridge AI
            </span>
          </div>

          {/* Zone 2: 4-6 Clean Text Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {primaryNavItems.map((item) => {
              const isActive =
                activeTab === item.id ||
                (item.id === 'coding' && activeTab === 'assessments') ||
                (item.id === 'skillgap' && (activeTab === 'skills' || activeTab === 'learning')) ||
                (item.id === 'companies' && activeTab === 'career');

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.isInterviewLaunch) {
                      onStartInterview();
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap btn-tactile ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* More Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                onBlur={() => setTimeout(() => setMoreDropdownOpen(false), 200)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {moreDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-1 z-50 animate-in fade-in">
                  {secondaryNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-xs rounded-md font-medium text-left transition ${
                          activeTab === item.id
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Actions & Profile Utilities */}
          <div className="flex items-center space-x-2">
            
            {/* Quick Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Search topics & interviews (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden md:inline text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1 text-slate-400 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Streak Counter */}
            {isAuthenticated && (
              <div
                onClick={() => setActiveTab('daily')}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 cursor-pointer hover:opacity-90 transition"
                title={`${profile.streakDays || 0}-day active streak`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="tabular-nums font-mono">{profile.streakDays || 0}d</span>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) handleMarkNotifsRead();
                }}
                className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">Notifications</span>
                    <button
                      onClick={handleMarkNotifsRead}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.actionUrl) setActiveTab(n.actionUrl);
                          setNotifDropdownOpen(false);
                        }}
                        className={`p-2 rounded-md text-left cursor-pointer transition ${
                          n.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                            : 'bg-indigo-50/70 dark:bg-indigo-950/40 text-slate-900 dark:text-white border-l-2 border-indigo-500'
                        } hover:bg-slate-100 dark:hover:bg-slate-800`}
                      >
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & User Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
                >
                  <UserAvatar
                    email={profile.email}
                    name={profile.fullName}
                    photoUrl={profile.avatarUrl}
                    size="xs"
                  />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 hidden md:inline max-w-[90px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50 animate-in fade-in">
                    <div className="p-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2.5 mb-1.5">
                        <UserAvatar
                          email={profile.email}
                          name={profile.fullName}
                          photoUrl={profile.avatarUrl}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {profile.fullName || profile.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                          {profile.career?.targetRole || 'Full Stack Developer'}
                        </span>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profile & Skills</span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('progress');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Performance Analytics</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition btn-tactile"
              >
                Sign In
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.isInterviewLaunch) {
                  onStartInterview();
                } else {
                  setActiveTab(item.id);
                }
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              {item.label}
            </button>
          ))}
          <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
          {secondaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center space-x-2"
            >
              <item.icon className="w-3.5 h-3.5 text-slate-400" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
