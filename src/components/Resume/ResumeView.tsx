import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { geminiService } from '../../services/geminiService';
import { ParsedResume } from '../../types';
import {
  FileText,
  Upload,
  Sparkles,
  CheckCircle2,
  Code2,
  GraduationCap,
  ArrowRight,
  Trash2,
  Briefcase,
} from 'lucide-react';

interface ResumeViewProps {
  onStartResumeInterview: (resume: ParsedResume) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({ onStartResumeInterview }) => {
  const { profile, updateProfile } = useAuth();
  const [resumeText, setResumeText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('My_Resume.pdf');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const parsedResume: ParsedResume | undefined = profile.resume;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        setResumeText(text);
        await parseResumeContent(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = async () => {
    if (!resumeText.trim() || resumeText.length < 30) {
      setErrorMsg('Please paste at least a paragraph of your resume details.');
      return;
    }
    await parseResumeContent(resumeText, fileName || 'Pasted_Resume.txt');
  };

  const parseResumeContent = async (text: string, fName: string) => {
    setIsParsing(true);
    setErrorMsg(null);
    try {
      const parsed = await geminiService.parseResume({
        resumeText: text,
        fileName: fName,
      });

      if (parsed) {
        updateProfile({ resume: parsed });
      }
    } catch (err: any) {
      setErrorMsg('Could not parse resume text. Please check the content and try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleRemoveResume = () => {
    updateProfile({ resume: undefined });
    setResumeText('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Project Verification</span>
            <span aria-hidden="true">·</span>
            <span>Resume Defense AI</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Resume & Project Defense
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Interrogates candidates on real code trade-offs, architecture decisions, and database schemas directly extracted from your projects.
          </p>
        </div>

        {parsedResume && (
          <button
            onClick={() => onStartResumeInterview(parsedResume)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-semibold text-xs shadow-xs transition flex items-center space-x-1.5 btn-tactile shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulate Project Defense</span>
          </button>
        )}
      </div>

      {/* Upload Zone */}
      {!parsedResume ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* File Upload Box (6 Cols) */}
          <div className="md:col-span-6 p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 depth-surface flex flex-col items-center justify-center text-center space-y-4 hover:border-slate-400 transition">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Upload Your Resume</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                PDF, DOCX, TXT formats supported
              </p>
            </div>

            <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition btn-tactile">
              <span>Choose Resume File</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-[11px] text-slate-400">Processed securely on device</span>
          </div>

          {/* Paste Resume Box (6 Cols) */}
          <div className="md:col-span-6 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Or Paste Resume Text</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste your technical projects, tech stacks, and experience highlights.
              </p>
            </div>

            <textarea
              rows={7}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="e.g. Project 1: Cloud-Native Microservices App&#10;Stack: React, Node.js, PostgreSQL, Docker, Redis&#10;Designed authentication middleware and implemented connection pooling..."
              className="w-full p-3 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100 font-mono"
            />

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">{errorMsg}</div>
            )}

            <button
              onClick={handlePasteSubmit}
              disabled={isParsing || !resumeText.trim()}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold transition flex items-center justify-center space-x-2 btn-tactile disabled:opacity-40"
            >
              <span>{isParsing ? 'Parsing with Gemini AI...' : 'Parse & Extract Highlights'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      ) : (
        /* Parsed Resume Display */
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 depth-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    {parsedResume.fileName}
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    · Parsed
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Extracted on {new Date(parsedResume.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onStartResumeInterview(parsedResume)}
                className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition btn-tactile"
              >
                Launch Project Mock
              </button>
              <button
                onClick={handleRemoveResume}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-800 transition"
                title="Remove resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Extracted Projects */}
          {parsedResume.projects && parsedResume.projects.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 depth-surface space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Verified Projects for Interview Defense ({parsedResume.projects.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedResume.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-lg border border-slate-200/90 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">{proj.name}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies?.map((tech) => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
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
      )}

    </div>
  );
};
