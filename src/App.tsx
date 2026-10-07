import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { InterviewSetupModal } from './components/Interview/InterviewSetupModal';
import { ActiveInterviewView } from './components/Interview/ActiveInterviewView';
import { InterviewReportModal } from './components/Interview/InterviewReportModal';
import { CodingPracticeView } from './components/Coding/CodingPracticeView';
import { ResumeView } from './components/Resume/ResumeView';
import { SkillGapView } from './components/SkillGap/SkillGapView';
import { LearningPlanView } from './components/Learning/LearningPlanView';
import { CareerMatchesView } from './components/Career/CareerMatchesView';
import { CompaniesView } from './components/Companies/CompaniesView';
import { QuestionBankView } from './components/QuestionBank/QuestionBankView';
import { DailyPracticeView } from './components/Daily/DailyPracticeView';
import { ProgressHistoryView } from './components/Progress/ProgressHistoryView';
import { BookmarksView } from './components/Bookmarks/BookmarksView';
import { ProfileView } from './components/Profile/ProfileView';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { OnboardingScreen } from './components/Onboarding/OnboardingScreen';
import { SearchModal } from './components/SearchModal';
import { InterviewType, DifficultyLevel, InterviewAnswerRecord, ParsedResume, QuestionBankItem } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isOnboarded, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Interview state
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [activeInterviewConfig, setActiveInterviewConfig] = useState<{
    type: InterviewType;
    difficulty: DifficultyLevel;
    questionCount: number;
    targetRole: string;
    useResume: boolean;
  } | null>(null);
  const [completedAnswers, setCompletedAnswers] = useState<InterviewAnswerRecord[] | null>(null);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Start standard interview
  const handleOpenInterviewSetup = () => {
    setIsSetupOpen(true);
  };

  const handleStartInterview = (config: {
    type: InterviewType;
    difficulty: DifficultyLevel;
    questionCount: number;
    targetRole: string;
    useResume: boolean;
  }) => {
    setActiveInterviewConfig(config);
    setActiveTab('interview');
  };

  // Start single question mock from Question Bank or Daily Practice
  const handleStartSingleQuestionMock = (questionText: string, category: string = 'technical') => {
    setActiveInterviewConfig({
      type: (category === 'hr' ? 'hr' : 'technical') as InterviewType,
      difficulty: 'intermediate',
      questionCount: 1,
      targetRole: 'Software Developer',
      useResume: false,
    });
    setActiveTab('interview');
  };

  // Start Resume project interview
  const handleStartResumeInterview = (resume: ParsedResume) => {
    setActiveInterviewConfig({
      type: 'resume',
      difficulty: 'intermediate',
      questionCount: 5,
      targetRole: 'Software Developer',
      useResume: true,
    });
    setActiveTab('interview');
  };

  // Handle Interview Completion
  const handleInterviewComplete = (answers: InterviewAnswerRecord[]) => {
    setCompletedAnswers(answers);
    setActiveInterviewConfig(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* Global Modals */}
      <AuthModal />
      <OnboardingModal />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          if (tab === 'interview') handleOpenInterviewSetup();
        }}
      />
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStart={handleStartInterview}
      />

      {/* Completed Interview Report Modal */}
      {completedAnswers && (
        <InterviewReportModal
          answers={completedAnswers}
          targetRole="Software Developer"
          interviewType="mixed"
          difficulty="intermediate"
          onClose={() => setCompletedAnswers(null)}
          onNavigate={(tab) => {
            setCompletedAnswers(null);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'interview') {
            handleOpenInterviewSetup();
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onStartInterview={handleOpenInterviewSetup}
      />

      {/* Main View Area */}
      <main className="flex-1 w-full">
        {/* If an active interview is running, display room directly */}
        {activeInterviewConfig ? (
          <ActiveInterviewView
            config={activeInterviewConfig}
            onComplete={handleInterviewComplete}
            onExit={() => {
              setActiveInterviewConfig(null);
              setActiveTab('dashboard');
            }}
          />
        ) : isAuthenticated && !isOnboarded ? (
          <OnboardingScreen onComplete={() => setActiveTab('dashboard')} />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              isAuthenticated ? (
                <Dashboard
                  onNavigate={setActiveTab}
                  onStartInterview={handleOpenInterviewSetup}
                  onOpenResumeUpload={() => setActiveTab('resume')}
                />
              ) : (
                <LandingPage
                  onStart={handleOpenInterviewSetup}
                  onNavigate={setActiveTab}
                />
              )
            )}

            {activeTab === 'landing' && (
              <LandingPage
                onStart={handleOpenInterviewSetup}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'interview' && (
              <div className="py-16 text-center space-y-4">
                <button
                  onClick={handleOpenInterviewSetup}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-xl"
                >
                  Configure and Launch AI Mock Interview
                </button>
              </div>
            )}

            {(activeTab === 'coding' || activeTab === 'assessments') && <CodingPracticeView />}

            {activeTab === 'resume' && (
              <ResumeView onStartResumeInterview={handleStartResumeInterview} />
            )}

            {(activeTab === 'skillgap' || activeTab === 'skills') && (
              <SkillGapView
                onGeneratePlan={(role, missing) => {
                  setActiveTab('learning');
                }}
              />
            )}

            {activeTab === 'learning' && (
              <LearningPlanView
                onStartMock={handleOpenInterviewSetup}
                onStartCoding={() => setActiveTab('coding')}
              />
            )}

            {activeTab === 'career' && <CareerMatchesView />}

            {activeTab === 'companies' && (
              <CompaniesView
                onStartRoleMock={(role) => {
                  setActiveInterviewConfig({
                    type: 'technical',
                    difficulty: 'intermediate',
                    questionCount: 5,
                    targetRole: role,
                    useResume: false,
                  });
                }}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView onNavigate={setActiveTab} />
            )}

            {activeTab === 'bank' && (
              <QuestionBankView
                onPracticeQuestion={(item: QuestionBankItem) => {
                  handleStartSingleQuestionMock(item.question, item.category);
                }}
              />
            )}

            {activeTab === 'daily' && (
              <DailyPracticeView
                onStartSingleMock={handleStartSingleQuestionMock}
                onStartCoding={() => setActiveTab('coding')}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressHistoryView onStartNew={handleOpenInterviewSetup} />
            )}

            {activeTab === 'bookmarks' && (
              <BookmarksView onNavigate={setActiveTab} />
            )}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={setActiveTab} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
