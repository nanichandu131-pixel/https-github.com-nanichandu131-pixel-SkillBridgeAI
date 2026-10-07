import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/geminiService';
import { ROLE_TAXONOMY, COMMON_SKILLS_LIST } from '../../data/initialData';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Briefcase,
  Layers,
  MapPin,
  User,
  ArrowRight,
  ShieldCheck,
  Plus,
  X,
  Loader2,
  Flame,
} from 'lucide-react';
import { ResumeAnalysis } from '../../types';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const { user, profile, completeOnboarding } = useAuth();

  // Resume File & Text State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [useTextPaste, setUseTextPaste] = useState<boolean>(false);

  // Profile Form State
  const [fullName, setFullName] = useState<string>(profile.fullName || user?.fullName || '');
  const [targetRole, setTargetRole] = useState<string>(profile.career?.targetRole || 'Software Developer');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'early_career' | 'experienced'>('fresher');
  const [location, setLocation] = useState<string>(profile.location || '');

  // Education
  const [college, setCollege] = useState<string>(profile.education?.college || '');
  const [degree, setDegree] = useState<string>(profile.education?.degree || 'B.Tech');
  const [branch, setBranch] = useState<string>(profile.education?.branch || 'Computer Science and Engineering');
  const [graduationYear, setGraduationYear] = useState<number>(profile.education?.graduationYear || new Date().getFullYear());
  const [cgpaOrPercentage, setCgpaOrPercentage] = useState<string>(profile.education?.cgpaOrPercentage || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(profile.skills || []);
  const [customSkillInput, setCustomSkillInput] = useState<string>('');

  // Processing & Result State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedAnalysis, setCompletedAnalysis] = useState<{
    analysis: ResumeAnalysis;
    skillsCount: number;
    projectsCount: number;
  } | null>(null);

  const availableRoles = Object.keys(ROLE_TAXONOMY);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage(null);

    const reader = new FileReader();

    if (file.type === 'application/pdf') {
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:application/pdf;base64, prefix for Gemini inlineData
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        setFileBase64(base64);
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text, markdown, doc, etc.
      reader.onload = () => {
        const text = reader.result as string;
        setResumeText(text);
      };
      reader.readAsText(file);
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter((s) => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setCustomSkillInput('');
    }
  };

  const handleAnalyzeResume = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedFile && !resumeText.trim()) {
      setErrorMessage('Please upload your resume file (PDF/TXT) or paste your resume content below.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStage('Extracting technical credentials, projects, and coursework...');

    try {
      // Step 1: Call Gemini AI backend
      setAnalysisStage('Evaluating career readiness benchmark against industry standards...');
      const response = await geminiService.analyzeResume({
        resumeText: resumeText.trim() || undefined,
        fileBase64: fileBase64 || undefined,
        mimeType: selectedFile?.type === 'application/pdf' ? 'application/pdf' : 'text/plain',
        fileName: selectedFile?.name || 'Candidate_Resume.pdf',
        targetRole,
        userId: user?.id,
        userEmail: user?.email,
      });

      setAnalysisStage('Persisting your profile and starting your 1-day active streak in Supabase...');

      const extracted = response.extractedProfile || {};
      const analysis = response.careerAnalysis;

      // Merge user explicit form fields with AI extracted information
      const finalSkills = Array.from(new Set([...skills, ...(extracted.skills || [])]));
      const finalCollege = college.trim() || extracted.education?.college || 'University';
      const finalDegree = degree.trim() || extracted.education?.degree || 'Degree';
      const finalBranch = branch.trim() || extracted.education?.branch || 'Engineering';
      const finalGradYear = Number(graduationYear) || extracted.education?.graduationYear || new Date().getFullYear();
      const finalCgpa = cgpaOrPercentage.trim() || extracted.education?.cgpaOrPercentage || '';

      // Complete Onboarding & Save
      await completeOnboarding({
        fullName: fullName.trim() || extracted.fullName || 'Engineer',
        location: location.trim() || extracted.location || '',
        skills: finalSkills,
        role: experienceLevel === 'experienced' ? 'experienced' : 'student',
        education: {
          college: finalCollege,
          degree: finalDegree,
          branch: finalBranch,
          graduationYear: finalGradYear,
          cgpaOrPercentage: finalCgpa,
        },
        career: {
          targetRole,
          experienceLevel,
          preferredLocation: location.trim() || extracted.location || '',
          workPreference: 'hybrid',
          onboarded: true,
          analysis,
        },
        resume: response.parsedResume,
        streakDays: 1, // Rule 1: First completed activity on first active day = 1 day!
        lastActiveDate: response.lastActiveDate,
        isOnboarded: true,
      });

      setCompletedAnalysis({
        analysis,
        skillsCount: finalSkills.length,
        projectsCount: (response.parsedResume?.projects || []).length,
      });
    } catch (err: any) {
      console.warn('Resume onboarding analysis error:', err);
      setErrorMessage(
        err?.message || 'Failed to complete resume analysis. Please verify your document and try again.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Onboarding Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>First-Time Profile Setup & Career Readiness</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to SkillBridge AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Upload your resume to benchmark real skills, calibrate your interview readiness, and personalize your preparation plan with Gemini AI.
          </p>
        </div>

        {/* Success Modal / Screen */}
        {completedAnalysis ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6 text-center animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Resume Analyzed Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your profile, technical skills, and initial career benchmark are now saved to Supabase.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 py-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Readiness Score
                </span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {completedAnalysis.analysis.readinessScore}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Skill Match
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {completedAnalysis.analysis.skillMatchPercentage}%
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Active Streak
                </span>
                <span className="text-2xl font-black text-amber-500 font-mono flex items-center justify-center space-x-1">
                  <Flame className="w-5 h-5 fill-amber-500 text-amber-500 inline" />
                  <span>1 day</span>
                </span>
              </div>
            </div>

            {/* Key Strengths & Gaps */}
            <div className="text-left space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Identified Strengths:
                </span>
                <ul className="text-xs text-indigo-800 dark:text-indigo-300 list-disc list-inside space-y-0.5">
                  {completedAnalysis.analysis.strengths.slice(0, 3).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 space-y-1">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Target Role Skill Gaps ({targetRole}):
                </span>
                <ul className="text-xs text-amber-800 dark:text-amber-300 list-disc list-inside space-y-0.5">
                  {completedAnalysis.analysis.skillGaps.slice(0, 2).map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-md transition flex items-center justify-center space-x-2"
            >
              <span>Go to Personalized Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Onboarding Form */
          <form
            onSubmit={handleAnalyzeResume}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. RESUME UPLOAD SECTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Step 1: Upload Resume (Required)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setUseTextPaste(!useTextPaste)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {useTextPaste ? 'Switch to File Upload' : 'Paste text instead'}
                </button>
              </div>

              {!useTextPaste ? (
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center transition bg-slate-50/50 dark:bg-slate-800/30 group">
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    {selectedFile ? (
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB · Ready to analyze
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Drop your resume file here or <span className="text-indigo-600 dark:text-indigo-400 underline">browse</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PDF, DOCX, and TXT files
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume sections here (Education, Projects, Technical Skills, Experience)..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              )}
            </div>

            {/* 2. PERSONAL & CAREER TARGET */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Karthik Akash"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Role *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {availableRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="fresher">Fresher / Campus Graduate (0-1 yrs)</option>
                  <option value="early_career">Early Career (1-3 yrs)</option>
                  <option value="experienced">Experienced (3+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 3. EDUCATION DETAILS */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Education Background</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="College / University Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="Degree (e.g. B.Tech)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Branch / Major (e.g. CSE)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    placeholder="Graduation Year"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cgpaOrPercentage}
                    onChange={(e) => setCgpaOrPercentage(e.target.value)}
                    placeholder="CGPA or Percentage"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 4. SKILLS SELECTOR */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Primary Technical Skills</span>
              </label>

              {/* Selected Skill Tags */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200/80 dark:border-indigo-800/80"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className="hover:text-indigo-950 dark:hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Common Skills */}
              <div className="flex flex-wrap gap-1.5">
                {COMMON_SKILLS_LIST.slice(0, 12).map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                      skills.includes(skill)
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    + {skill}
                  </button>
                ))}
              </div>

              {/* Custom Skill Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSkill();
                    }
                  }}
                  placeholder="Add another skill..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-extrabold text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Analyzing Resume with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                    <span>Analyze My Resume</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {analysisStage && (
                <p className="text-center text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
                  {analysisStage}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
