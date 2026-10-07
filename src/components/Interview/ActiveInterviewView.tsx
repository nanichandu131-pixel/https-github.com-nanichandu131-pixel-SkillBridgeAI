import React, { useState, useEffect } from 'react';
import { InterviewQuestion, InterviewType, DifficultyLevel, AnswerEvaluation, InterviewAnswerRecord } from '../../types';
import { geminiService } from '../../services/geminiService';
import { speechService } from '../../services/speechService';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Brain,
} from 'lucide-react';

interface ActiveInterviewViewProps {
  config: {
    type: InterviewType;
    difficulty: DifficultyLevel;
    questionCount: number;
    targetRole: string;
    useResume: boolean;
  };
  onComplete: (answers: InterviewAnswerRecord[]) => void;
  onExit: () => void;
}

export const ActiveInterviewView: React.FC<ActiveInterviewViewProps> = ({
  config,
  onComplete,
  onExit,
}) => {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true);

  // Candidate answer state
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Audio output state
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  // Evaluation state
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<AnswerEvaluation | null>(null);
  const [completedAnswers, setCompletedAnswers] = useState<InterviewAnswerRecord[]>([]);

  // Fetch or generate questions on mount
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoadingQuestions(true);
      try {
        const generated = await geminiService.generateQuestions({
          interviewType: config.type,
          targetRole: config.targetRole,
          difficulty: config.difficulty,
          questionCount: config.questionCount,
        });

        if (isMounted) {
          if (generated && generated.length > 0) {
            setQuestions(generated);
          }
          setLoadingQuestions(false);
        }
      } catch (e) {
        if (isMounted) setLoadingQuestions(false);
      }
    }
    load();
    return () => {
      isMounted = false;
      speechService.stopListening();
      speechService.stopSpeaking();
    };
  }, [config]);

  const currentQ = questions[currentIndex];

  // Auto-read question when index changes
  useEffect(() => {
    if (currentQ && speechService.isVoiceSynthesizerSupported()) {
      setIsSpeakingQuestion(true);
      speechService.speak(currentQ.text, () => {
        setIsSpeakingQuestion(false);
      });
    }
    setUserAnswer('');
    setCurrentEvaluation(null);
    setSpeechError(null);
  }, [currentIndex, questions]);

  const toggleSpeakQuestion = () => {
    if (isSpeakingQuestion) {
      speechService.stopSpeaking();
      setIsSpeakingQuestion(false);
    } else if (currentQ) {
      setIsSpeakingQuestion(true);
      speechService.speak(currentQ.text, () => {
        setIsSpeakingQuestion(false);
      });
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      const success = speechService.startListening({
        onStart: () => setIsListening(true),
        onResult: (transcript) => {
          setUserAnswer(transcript);
        },
        onError: (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        onEnd: () => setIsListening(false),
      });

      if (!success) {
        setInputMode('text');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }

    setEvaluating(true);
    try {
      const evaluation = await geminiService.evaluateAnswer({
        question: currentQ.text,
        userAnswer: userAnswer.trim(),
        targetRole: config.targetRole,
        interviewType: currentQ.category || config.type,
        skillFocus: currentQ.skillFocus,
        questionIndex: currentIndex + 1,
        totalQuestions: questions.length,
      });

      setCurrentEvaluation(evaluation);

      const record: InterviewAnswerRecord = {
        questionId: currentQ.id,
        questionText: currentQ.text,
        category: currentQ.category,
        userAnswer: userAnswer.trim(),
        evaluation,
      };

      setCompletedAnswers((prev) => [...prev, record]);
    } catch (err: any) {
      console.warn('Evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(completedAnswers);
    }
  };

  const handleSkipQuestion = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }
    const skippedRecord: InterviewAnswerRecord = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      category: currentQ.category,
      userAnswer: '(Skipped by candidate)',
      evaluation: {
        score: 0,
        categories: { relevance: 0, clarity: 0, structure: 0, completeness: 0, technicalAccuracy: 0, communication: 0 },
        strongPoints: [],
        areasToImprove: ['Question was skipped. Revise this topic in your learning plan.'],
        constructiveFeedback: 'Skipping questions impacts your overall completeness score. Provide at least a conceptual outline.',
        suggestedAnswerPoints: [],
      },
    };
    setCompletedAnswers((prev) => [...prev, skippedRecord]);
    handleNextQuestion();
  };

  if (loadingQuestions) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 animate-pulse">
          <Brain className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            AI Interviewer Generating Questions...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Targeting {config.difficulty} level competencies for {config.targetRole}.
          </p>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-slate-600">No questions available for this session.</p>
        <button onClick={onExit} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in pb-24">
      
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={onExit}
            className="font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            ← Exit Interview
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
            {config.type} Round
          </span>
          <span className="text-slate-400 capitalize">({config.difficulty})</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400 tabular-nums">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interviewer Card & Question */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 depth-surface space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              AI
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">AI Interviewer</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-500">{currentQ.skillFocus || 'Core Assessment'}</span>
              </div>
              <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
                "{currentQ.text}"
              </p>
            </div>
          </div>

          <button
            onClick={toggleSpeakQuestion}
            className={`p-2 rounded-lg border transition shrink-0 ${
              isSpeakingQuestion
                ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-300'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
            title="Read question out loud"
          >
            {isSpeakingQuestion ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {currentQ.contextHint && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              <strong>Coaching tip:</strong> {currentQ.contextHint}
            </span>
          </div>
        )}
      </div>

      {/* Evaluation Results if Answered */}
      {currentEvaluation ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 depth-surface space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold font-mono text-base tabular-nums">
                {currentEvaluation.score}%
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Answer Score: {currentEvaluation.score} / 100
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentEvaluation.score >= 80 ? 'Strong candidate response' : currentEvaluation.score >= 65 ? 'Good foundation, needs refinement' : 'Needs revision'}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold transition flex items-center space-x-2 btn-tactile self-start sm:self-auto"
            >
              <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Complete Report'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Category Dimension Scores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Object.entries(currentEvaluation.categories || {}).map(([cat, score]) => (
              <div key={cat} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block truncate">
                  {cat.replace(/([A-Z])/g, ' $1')}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-0.5 block">
                  {score}%
                </span>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Strong Points</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {currentEvaluation.strongPoints.map((pt, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Areas to Polish</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {currentEvaluation.areasToImprove.map((pt, i) => (
                  <li key={i} className="flex items-start space-x-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Constructive Feedback */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Constructive Feedback:
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentEvaluation.constructiveFeedback}
            </p>
          </div>
        </div>
      ) : (
        /* Candidate Answer Input Zone */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 depth-surface space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <UserAvatar
                email={profile.email}
                name={profile.fullName}
                photoUrl={profile.avatarUrl}
                size="xs"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {profile.fullName || profile.email?.split('@')[0] || 'Candidate'} Response
              </span>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => {
                  setInputMode('voice');
                  setSpeechError(null);
                }}
                className={`px-3 py-1 font-semibold rounded-md flex items-center space-x-1.5 transition ${
                  inputMode === 'voice'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Voice</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (isListening) speechService.stopListening();
                  setIsListening(false);
                  setInputMode('text');
                }}
                className={`px-3 py-1 font-semibold rounded-md transition ${
                  inputMode === 'text'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Text
              </button>
            </div>
          </div>

          {/* Voice Mode Audio Visualizer */}
          {inputMode === 'voice' && (
            <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center justify-center text-center space-y-3">
              {isListening && (
                <div className="flex items-center space-x-1.5 h-6">
                  <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-6 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-4 bg-indigo-500 rounded-full animate-bounce" />
                  <span className="w-1 h-6 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.2s]" />
                  <span className="w-1 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.35s]" />
                </div>
              )}

              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md btn-tactile ${
                  isListening
                    ? 'bg-red-600 text-white ring-4 ring-red-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900'
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {isListening ? 'Listening to speech... Click to conclude.' : 'Click to begin speaking answer'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Web Speech Recognition converts your spoken response into text.
                </p>
              </div>

              {speechError && (
                <div className="p-2 rounded-lg bg-red-50 text-red-700 text-xs">
                  {speechError}
                </div>
              )}
            </div>
          )}

          {/* Transcript / Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
              <span>{inputMode === 'voice' ? 'Spoken Transcript (Editable):' : 'Response Text:'}</span>
              <span className="font-mono tabular-nums">{userAnswer.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
            <textarea
              rows={5}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder={
                inputMode === 'voice'
                  ? 'Your spoken transcript will appear here. You can refine or edit it before submission...'
                  : 'Type your answer here... Mention concrete technical principles, real trade-offs, and project experience.'
              }
              className="w-full p-3.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
            />
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setUserAnswer('')}
                disabled={!userAnswer}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md transition flex items-center space-x-1 disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-md transition flex items-center space-x-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            </div>

            <button
              type="button"
              disabled={evaluating || !userAnswer.trim()}
              onClick={handleSubmitAnswer}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold text-xs shadow-xs transition flex items-center justify-center space-x-2 btn-tactile disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{evaluating ? 'AI Evaluating...' : 'Submit Answer for AI Review'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
