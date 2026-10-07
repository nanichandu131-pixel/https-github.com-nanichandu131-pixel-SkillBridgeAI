import { InterviewQuestion, AnswerEvaluation, ParsedResume, LearningPlan, ResumeAnalysis } from '../types';

export const geminiService = {
  async analyzeResume(params: {
    resumeText?: string;
    fileBase64?: string;
    mimeType?: string;
    fileName?: string;
    targetRole?: string;
    userId?: string;
    userEmail?: string;
  }): Promise<{
    success: boolean;
    extractedProfile: any;
    careerAnalysis: ResumeAnalysis;
    parsedResume: ParsedResume;
    initialStreak: number;
    lastActiveDate: string;
  }> {
    const res = await fetch('/api/gemini/analyze-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Resume analysis failed: HTTP ${res.status}`);
    return await res.json();
  },

  async generateQuestions(params: {
    interviewType: string;
    targetRole: string;
    difficulty: string;
    questionCount: number;
    skills?: string[];
    resumeHighlights?: string;
  }): Promise<InterviewQuestion[]> {
    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.questions || [];
    } catch (err) {
      console.warn('Network error in generateQuestions, generating fallback questions:', err);
      return [];
    }
  },

  async evaluateAnswer(params: {
    question: string;
    userAnswer: string;
    targetRole: string;
    interviewType: string;
    skillFocus?: string;
    questionIndex?: number;
    totalQuestions?: number;
  }): Promise<AnswerEvaluation> {
    try {
      const res = await fetch('/api/gemini/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.evaluation;
    } catch (err) {
      console.warn('Network error in evaluateAnswer:', err);
      throw err;
    }
  },

  async parseResume(params: {
    resumeText: string;
    fileName?: string;
  }): Promise<ParsedResume> {
    const res = await fetch('/api/gemini/parse-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Resume parse failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.parsedResume;
  },

  async generateLearningPlan(params: {
    targetRole: string;
    weakAreas?: string[];
    strongAreas?: string[];
    currentSkills?: string[];
    averageScore?: number;
  }): Promise<LearningPlan> {
    const res = await fetch('/api/gemini/generate-learning-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Learning plan generation failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.plan;
  },

  async reviewCode(params: {
    problemTitle: string;
    language: string;
    code: string;
    testResults: any;
  }): Promise<any> {
    const res = await fetch('/api/gemini/review-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Code review failed: HTTP ${res.status}`);
    const data = await res.json();
    return data.review;
  }
};
