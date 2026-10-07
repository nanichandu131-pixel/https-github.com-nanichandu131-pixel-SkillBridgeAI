import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { COMMON_SKILLS_LIST, ROLE_TAXONOMY } from '../data/initialData';
import { X, Check, Plus, GraduationCap, Briefcase, Award, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboardingModal, closeOnboardingModal, profile, updateProfile } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state initialized from profile
  const [fullName, setFullName] = useState(profile.fullName || '');
  const [location, setLocation] = useState(profile.location || '');

  // Education
  const [college, setCollege] = useState(profile.education?.college || '');
  const [degree, setDegree] = useState(profile.education?.degree || 'B.Tech');
  const [branch, setBranch] = useState(profile.education?.branch || 'Computer Science and Engineering');
  const [gradYear, setGradYear] = useState(profile.education?.graduationYear || new Date().getFullYear());
  const [cgpa, setCgpa] = useState(profile.education?.cgpaOrPercentage || '');

  // Career
  const [targetRole, setTargetRole] = useState(profile.career?.targetRole || 'Software Developer');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'early_career' | 'experienced'>(
    profile.career?.experienceLevel || 'fresher'
  );
  const [prefLocation, setPrefLocation] = useState(profile.career?.preferredLocation || '');
  const [workPreference, setWorkPreference] = useState<'remote' | 'hybrid' | 'onsite' | 'any'>(
    profile.career?.workPreference || 'hybrid'
  );

  // Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>(profile.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  if (!showOnboardingModal) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleFinish = () => {
    updateProfile({
      fullName,
      location,
      education: {
        college,
        degree,
        branch,
        graduationYear: Number(gradYear),
        cgpaOrPercentage: cgpa,
      },
      career: {
        targetRole,
        experienceLevel,
        preferredLocation: prefLocation,
        workPreference,
      },
      skills: selectedSkills,
    });
    closeOnboardingModal();
  };

  const targetRolesList = Object.keys(ROLE_TAXONOMY);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={closeOnboardingModal}
          className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold text-slate-900 dark:text-white">Step {step} of 4</span>
            <span>
              {step === 1 ? 'Personal Info' : step === 2 ? 'Education' : step === 3 ? 'Target Career' : 'Skill Matrix'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Profile Setup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set up your student identity to calibrate AI interview questions and company matching.
              </p>
            </div>

            {/* Auto Avatar Display */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={fullName || profile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : null}
                <span>{((fullName || profile.fullName || 'SB').split(' ').map((n) => n[0]).join('')).slice(0, 2).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                  {fullName || profile.fullName || 'Student'}
                </span>
                <span className="text-[11px] text-slate-500 block truncate">
                  {profile.email || 'student@skillbridge.ai'}
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Profile avatar will display your initials or custom photo
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Karthik Akash"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Current City / Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Academic Qualifications</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">College / University</label>
              <input
                type="text"
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Degree</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech / B.E."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Branch / Major</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Computer Science & Eng"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Graduation Year</label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">CGPA / Percentage</label>
                <input
                  type="text"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  placeholder="e.g. 8.6 CGPA or 82%"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Career Aspirations */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Target Career & Role</h3>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Engineering Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                {targetRolesList.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {ROLE_TAXONOMY[targetRole]?.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="fresher">Fresher / Final Year Student</option>
                  <option value="early_career">Early Career (0 - 1 year)</option>
                  <option value="experienced">Junior Developer (1 - 3 years)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Work Preference</label>
                <select
                  value={workPreference}
                  onChange={(e) => setWorkPreference(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
                >
                  <option value="hybrid">Hybrid</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="any">Flexible / Any</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Job Locations</label>
              <input
                type="text"
                value={prefLocation}
                onChange={(e) => setPrefLocation(e.target.value)}
                placeholder="e.g. Bengaluru / Hyderabad / Pune / Remote"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 4: Skills Selection */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Skills</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select all technologies you are familiar with. The AI interviewer uses this to configure mock questions.
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-52 overflow-y-auto p-1">
              {COMMON_SKILLS_LIST.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected && <span className="ml-1 opacity-70">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Input */}
            <div className="pt-2 flex items-center space-x-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                placeholder="Add other skill (e.g. Redis, Kafka, Kubernetes)..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={addCustomSkill}
                className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition"
              >
                Add
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              Selected ({selectedSkills.length} skills): {selectedSkills.join(', ')}
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 mt-5 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs transition"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center space-x-1 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Complete Setup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
