import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_TAXONOMY, COMMON_SKILLS_LIST } from '../../data/initialData';
import { matchingService } from '../../services/matchingService';
import { storageService } from '../../services/storageService';
import { UserAvatar } from '../common/UserAvatar';
import {
  User,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  CheckCircle2,
  Plus,
  X,
  Flame,
  ArrowRight,
  MapPin,
  Mail,
  Edit3,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ onNavigate }) => {
  const { profile, updateProfile } = useAuth();
  
  // Tab states: 'skills' | 'education' | 'interviews' | 'career' | 'resume'
  const [activeSection, setActiveSection] = useState<'skills' | 'education' | 'interviews' | 'career' | 'resume'>('skills');

  // Edit Profile Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState(profile.fullName || '');
  const [editEmail, setEditEmail] = useState(profile.email || '');
  const [editLocation, setEditLocation] = useState(profile.location || '');
  const [editTargetRole, setEditTargetRole] = useState(profile.career?.targetRole || 'Software Developer');
  const [editCollege, setEditCollege] = useState(profile.education?.college || '');
  const [editDegree, setEditDegree] = useState(profile.education?.degree || 'B.Tech');
  const [editBranch, setEditBranch] = useState(profile.education?.branch || '');
  const [editGradYear, setEditGradYear] = useState(profile.education?.graduationYear || new Date().getFullYear());
  const [editCgpa, setEditCgpa] = useState(profile.education?.cgpaOrPercentage || '');

  // Skills management
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const targetRole = profile.career?.targetRole || 'Software Developer';
  const roleData = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY['Software Developer'] || ROLE_TAXONOMY['Full Stack Developer'];
  const skillGap = matchingService.analyzeSkillGap(targetRole, skills);
  const interviews = storageService.getInterviews();
  const totalInterviews = interviews.length;
  const avgScore = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, i) => acc + i.overallScore, 0) / totalInterviews)
    : 0;

  // Profile completion calculation based on actual user fields
  let profilePoints = 0;
  if (profile.fullName) profilePoints += 20;
  if (profile.education?.college) profilePoints += 20;
  if (profile.career?.targetRole) profilePoints += 20;
  if (profile.skills && profile.skills.length >= 4) profilePoints += 20;
  if (profile.resume) profilePoints += 20;
  const profileCompletion = Math.min(100, profilePoints);

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      location: editLocation.trim(),
      career: {
        ...profile.career,
        targetRole: editTargetRole,
      },
      education: {
        ...profile.education,
        college: editCollege.trim(),
        degree: editDegree.trim(),
        branch: editBranch.trim(),
        graduationYear: Number(editGradYear),
        cgpaOrPercentage: editCgpa.trim(),
      },
    });
    setIsEditModalOpen(false);
    showNotice('Profile updated successfully.');
  };

  const toggleSkill = (skill: string) => {
    let updated: string[];
    if (skills.includes(skill)) {
      updated = skills.filter((s) => s !== skill);
    } else {
      updated = [...skills, skill];
    }
    setSkills(updated);
    updateProfile({ skills: updated });
    showNotice(`Skills updated (${updated.length} verified).`);
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customSkillInput.trim();
    if (!clean) return;
    if (!skills.includes(clean)) {
      const updated = [...skills, clean];
      setSkills(updated);
      updateProfile({ skills: updated });
      setCustomSkillInput('');
      showNotice(`Added "${clean}" to your verified skills.`);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    updateProfile({ skills: updated });
  };

  const skillCategories = [
    {
      category: 'Languages',
      items: ['JavaScript', 'TypeScript', 'Java', 'Python', 'C', 'C++', 'SQL'],
    },
    {
      category: 'Web & Frameworks',
      items: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Spring Boot', 'Django', 'FastAPI'],
    },
    {
      category: 'Core CS & Architecture',
      items: ['Data Structures', 'Algorithms', 'OOP', 'System Design', 'REST APIs'],
    },
    {
      category: 'Databases & Infrastructure',
      items: ['PostgreSQL', 'MongoDB', 'Docker', 'Git', 'Linux', 'AWS'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      
      {/* ========================================================
          1. PROFILE HEADER (Avatar, Name, Email, Target Role, Location, Completion)
          ======================================================== */}
      <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Identity Info */}
          <div className="flex items-start sm:items-center space-x-5">
            <div className="relative shrink-0">
              <UserAvatar
                email={profile.email}
                name={profile.fullName}
                photoUrl={profile.avatarUrl}
                size="xl"
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs" title="Profile Active">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {profile.fullName || profile.email?.split('@')[0] || 'User'}
                </h1>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  · {profile.role ? profile.role.toUpperCase() : 'STUDENT'}
                </span>
                {profile.authProvider === 'google' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center space-x-1">
                    <span>Google Account</span>
                  </span>
                )}
              </div>

              {/* Zero-Pill Unboxed Text Metadata with Typographic Separators */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1 text-slate-700 dark:text-slate-200 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{targetRole}</span>
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.email}</span>
                </span>
                {profile.location && (
                  <>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.location}</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completion & Edit Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 rounded-xl p-3 w-full sm:w-44 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400">Profile Completion</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                setEditFullName(profile.fullName || '');
                setEditEmail(profile.email || '');
                setEditLocation(profile.location || '');
                setEditTargetRole(profile.career?.targetRole || 'Software Developer');
                setEditCollege(profile.education?.college || '');
                setEditDegree(profile.education?.degree || 'B.Tech');
                setEditBranch(profile.education?.branch || '');
                setEditGradYear(profile.education?.graduationYear || new Date().getFullYear());
                setEditCgpa(profile.education?.cgpaOrPercentage || '');
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center space-x-1.5 btn-tactile w-full sm:w-auto justify-center"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>

        </div>

        {/* Section Navigation Tabs in Exact Requested Hierarchy */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {[
            { id: 'skills', label: 'Skills', icon: Award },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'interviews', label: 'Interview Performance', icon: TrendingUp },
            { id: 'career', label: 'Career Readiness & Roles', icon: Briefcase },
            { id: 'resume', label: 'Resume & Projects', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg transition whitespace-nowrap btn-tactile ${
                  isActive
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ========================================================
          2. SECTION 1: SKILLS
          ======================================================== */}
      {activeSection === 'skills' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Technical Skills Matrix</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select and manage technologies on your verified profile. You have <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{skills.length} skills</strong> active.
                </p>
              </div>

              {/* Add Custom Skill Form */}
              <form onSubmit={handleAddCustomSkill} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Add custom skill..."
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg transition flex items-center space-x-1 btn-tactile"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            </div>

            {/* Role Match Status */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white block">
                  Alignment with {targetRole}: {skillGap.skillMatchPercentage}% Match
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {skillGap.matchedSkills.length} of {roleData.requiredSkills.length} core requirements verified.
                </p>
              </div>
              <button
                onClick={() => onNavigate('skillgap')}
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 text-left"
              >
                View Detailed Skill Gap Analysis →
              </button>
            </div>

            {/* Categorized Skills */}
            <div className="space-y-5 pt-1">
              {skillCategories.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {cat.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((skill) => {
                      const isSelected = skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-medium transition btn-tactile ${
                            isSelected
                              ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <span>{skill}</span>
                          {isSelected && <span className="ml-1.5 opacity-80 text-[10px]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Active Skills Chips */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Active Skills On Profile:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================
          3. SECTION 2: EDUCATION
          ======================================================== */}
      {activeSection === 'education' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Academic History & Credentials</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                University background used by AI to calibrate campus placement questions.
              </p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Edit Details
            </button>
          </div>

          <div className="space-y-4">
            {profile.education?.college ? (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {profile.education.college}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                    Graduation {profile.education.graduationYear || new Date().getFullYear()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {profile.education.degree || 'Degree'} {profile.education.branch ? `in ${profile.education.branch}` : ''}
                </p>
                {profile.education.cgpaOrPercentage && (
                  <div className="pt-1 flex items-center space-x-3 text-xs text-slate-500">
                    <span>Cumulative Score: <strong className="text-slate-900 dark:text-white font-mono tabular-nums">{profile.education.cgpaOrPercentage}</strong></span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p>No education background added yet.</p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                >
                  Add Education
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          4. SECTION 3: INTERVIEW PERFORMANCE
          ======================================================== */}
      {activeSection === 'interviews' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Interview Performance History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluation results, scoring breakdowns, and constructive feedback from completed sessions.
              </p>
            </div>
            <button
              onClick={() => onNavigate('interview')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs btn-tactile"
            >
              Start New Mock
            </button>
          </div>

          {interviews.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {interviews.map((res) => (
                <div key={res.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-slate-900 dark:text-white capitalize">
                        {res.interviewType} Round
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-500 capitalize">{res.difficulty}</span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">{new Date(res.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {res.actionableFeedback}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                        {res.overallScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 block">Overall Score</span>
                    </div>
                    <button
                      onClick={() => onNavigate('progress')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                    >
                      Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-3">
              <p>No completed interviews found yet.</p>
              <button
                onClick={() => onNavigate('interview')}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold"
              >
                Launch Your First Interview
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          5. SECTION 4: CAREER READINESS & TARGET ROLES
          ======================================================== */}
      {activeSection === 'career' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Target Roles & Career Preferences</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Benchmark parameters determining which role questions and skill gaps are prioritized.
              </p>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Modify
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Primary Target Engineering Role:
              </span>
              <span className="text-base font-bold text-slate-900 dark:text-white block">
                {targetRole}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {roleData.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Candidate Experience Tier</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {profile.career?.experienceLevel || 'fresher'}
                </span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">Work Environment Mode</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {profile.career?.workPreference || 'hybrid'}
                </span>
              </div>
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                <span className="text-[11px] text-slate-400 block">Preferred Placement Cities</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {profile.career?.preferredLocation || profile.location || 'Not specified yet'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. SECTION 5: RESUME & PROJECTS
          ======================================================== */}
      {activeSection === 'resume' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 depth-surface space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Resume Project Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                AI interrogates you on code architecture, library choices, and trade-offs from your uploaded projects.
              </p>
            </div>
            <button
              onClick={() => onNavigate('resume')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs btn-tactile"
            >
              Resume Studio
            </button>
          </div>

          {profile.resume ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    {profile.resume.fileName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    Uploaded: {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </span>
              </div>

              {profile.resume.projects && profile.resume.projects.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    Parsed Projects ({profile.resume.projects.length})
                  </span>
                  <div className="space-y-2">
                    {profile.resume.projects.map((proj, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white block">{proj.name}</span>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {proj.technologies?.map((tech) => (
                            <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 space-y-3">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <p>No resume uploaded yet. Upload to enable Project Defense mocks.</p>
              <button
                onClick={() => onNavigate('resume')}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs"
              >
                Upload Resume PDF
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          EDIT PROFILE MODAL (NO Avatar Image URL field!)
          ======================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto depth-surface">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit Career Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your identity, target role, and educational background.
              </p>
            </div>

            <form onSubmit={handleSaveProfileModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Engineering Role
                  </label>
                  <select
                    value={editTargetRole}
                    onChange={(e) => setEditTargetRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  >
                    {Object.keys(ROLE_TAXONOMY).map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    College / University
                  </label>
                  <input
                    type="text"
                    required
                    value={editCollege}
                    onChange={(e) => setEditCollege(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={editDegree}
                    onChange={(e) => setEditDegree(e.target.value)}
                    placeholder="e.g. B.Tech"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Branch / Major
                  </label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={editGradYear}
                    onChange={(e) => setEditGradYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    CGPA or Score
                  </label>
                  <input
                    type="text"
                    value={editCgpa}
                    onChange={(e) => setEditCgpa(e.target.value)}
                    placeholder="e.g. 8.8 CGPA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 text-xs"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg shadow-xs btn-tactile"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
