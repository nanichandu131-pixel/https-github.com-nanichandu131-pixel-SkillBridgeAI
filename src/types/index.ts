export type UserRole = 'student' | 'fresher' | 'experienced' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  googlePicture?: string;
  authProvider?: 'email' | 'google';
  location?: string;
  role: UserRole;
  education: {
    college: string;
    degree: string;
    branch: string;
    graduationYear: number;
    cgpaOrPercentage: string;
  };
  career: {
    targetRole: string;
    experienceLevel: 'fresher' | 'early_career' | 'experienced';
    preferredLocation: string;
    workPreference: 'remote' | 'hybrid' | 'onsite' | 'any';
    onboarded?: boolean;
    analysis?: ResumeAnalysis;
  };
  skills: string[];
  resume?: ParsedResume;
  streakDays: number;
  lastActiveDate: string;
  createdAt: string;
  isOnboarded?: boolean;
}

export interface ResumeAnalysis {
  targetRole: string;
  readinessScore: number;
  skillMatchPercentage: number;
  strengths: string[];
  skillGaps: string[];
  missingSkills: string[];
  improvementAreas: string[];
  recommendedFocusTopics?: string[];
}

export interface ParsedResume {
  fileName: string;
  uploadedAt: string;
  extractedName?: string;
  education: string[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
  }[];
  experience: {
    title: string;
    company: string;
    duration: string;
    description: string;
  }[];
  certifications: string[];
  rawSummary?: string;
}

export type InterviewType = 'hr' | 'technical' | 'coding' | 'resume' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  totalQuestions: number;
  category: 'hr' | 'technical' | 'coding' | 'resume';
  skillFocus?: string;
  text: string;
  contextHint?: string;
  followUpTrigger?: string;
}

export interface AnswerEvaluation {
  score: number; // 0 - 100
  categories: {
    relevance: number;
    clarity: number;
    structure: number;
    completeness: number;
    technicalAccuracy?: number;
    communication: number;
  };
  strongPoints: string[];
  areasToImprove: string[];
  constructiveFeedback: string;
  suggestedAnswerPoints: string[];
  followUpQuestion?: string;
}

export interface InterviewSessionAnswer {
  questionId: string;
  questionText: string;
  category: string;
  skillFocus?: string;
  userAnswer: string;
  answerMethod?: 'text' | 'voice';
  audioDurationSeconds?: number;
  evaluation?: AnswerEvaluation;
  followUpAnswer?: string;
}

export type InterviewAnswerRecord = InterviewSessionAnswer;

export interface InterviewResult {
  id: string;
  userId: string;
  interviewType: InterviewType;
  targetRole: string;
  difficulty: DifficultyLevel;
  date: string;
  overallScore: number;
  categoryScores: {
    technicalKnowledge: number;
    communication: number;
    problemSolving: number;
    coding: number;
    answerQuality: number;
  };
  strongAreas: string[];
  areasToImprove: string[];
  actionableFeedback: string;
  answers: InterviewSessionAnswer[];
  skillGapInsights?: {
    matchedSkills: string[];
    gapSkills: string[];
  };
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isSecret?: boolean;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  targetRoles: string[];
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string | string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
    [key: string]: string;
  };
  testCases: CodingTestCase[];
  tags?: string[];
  hints?: string[];
}

export interface CodingSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  passedCount: number;
  totalCount: number;
  status: 'passed' | 'failed' | 'syntax_error';
  executionTimeMs: number;
  submittedAt: string;
  aiFeedback?: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  currentSkills: string[];
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchPercentage: number;
  disclaimer: string;
  recommendations: {
    skill: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    estimatedTimeToLearn: string;
  }[];
}

export interface LearningTask {
  id: string;
  dayNumber: number;
  weekNumber: number;
  title: string;
  category: 'technical' | 'dsa' | 'hr' | 'resume' | 'mock_interview';
  topic: string;
  durationMinutes: number;
  completed: boolean;
  resourceGuide?: string;
  practiceLink?: {
    type: 'interview' | 'coding' | 'question_bank';
    targetId?: string;
  };
}

export interface LearningPlan {
  id: string;
  userId: string;
  targetRole: string;
  totalWeeks: number;
  createdAt: string;
  tasks: LearningTask[];
}

export interface Company {
  id: string;
  name: string;
  logoText: string;
  industry: string;
  location: string;
  locations?: string[];
  workType: 'Remote' | 'Hybrid' | 'Onsite' | 'Flexible';
  companyType: 'Product' | 'Services' | 'Fintech' | 'Healthtech' | 'E-commerce' | 'Enterprise';
  relevantRoles: string[];
  commonSkills: string[];
  careersUrl: string;
  careerPageUrl?: string;
  description: string;
  matchScore?: number;
  whyMatches?: string;
  matchingSkills?: string[];
  skillsToImprove?: string[];
  averagePackage?: string;
  interviewProcess?: string[];
}

export interface QuestionBankItem {
  id: string;
  category: 'hr' | 'java' | 'python' | 'javascript' | 'react' | 'sql' | 'dsa' | 'aptitude' | 'behavioral' | 'resume';
  difficulty: DifficultyLevel;
  question: string;
  keyConcepts: string[];
  sampleAnswerTips: string;
  practiceCount?: number;
  tags?: string[];
  expectedPoints?: string[];
}

export interface DailyPracticeSet {
  date: string;
  hrQuestion: QuestionBankItem;
  technicalQuestions: QuestionBankItem[];
  codingProblem: CodingProblem;
  aptitudeQuestion: QuestionBankItem;
  completedTasks: string[]; // task IDs completed
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'daily_practice' | 'learning_plan' | 'interview_reminder' | 'streak';
  actionUrl?: string;
}

export interface BookmarkItem {
  id: string;
  type: 'question' | 'coding' | 'company' | 'resource';
  title: string;
  subtitle: string;
  savedAt: string;
  category?: string;
  metadata?: Record<string, any>;
}
