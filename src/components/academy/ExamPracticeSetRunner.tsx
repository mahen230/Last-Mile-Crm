import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  BookOpen,
  Filter,
  Check,
  X,
  FileText,
  ShieldCheck,
  Pause,
  Play,
} from 'lucide-react';
import {
  FULL_MOCK_TEST_SERIES,
  LMSMockTestSet,
  LMSMockTestQuestion,
} from '../../data/lmsMockTestSeries';
import { LanguageMode, UI_STRINGS } from '../../data/bilingualLmsData';

interface ExamPracticeSetRunnerProps {
  language: LanguageMode;
  onRecordMockScore?: (
    testId: string,
    testTitle: string,
    score: number,
    totalMarks: number,
    percentage: number
  ) => void;
}

export default function ExamPracticeSetRunner({
  language,
  onRecordMockScore,
}: ExamPracticeSetRunnerProps) {
  const t = UI_STRINGS[language];

  // 3 Practice sets from FULL_MOCK_TEST_SERIES
  const mockSets = FULL_MOCK_TEST_SERIES.slice(0, 3);
  const [selectedMockId, setSelectedMockId] = useState<string>(mockSets[0]?.id || 'MOCK-MTS-01');
  const activeMock: LMSMockTestSet =
    mockSets.find((m) => m.id === selectedMockId) || mockSets[0];

  // Test Runner State
  const [isTestStarted, setIsTestStarted] = useState<boolean>(false);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(
    activeMock.durationMinutes * 60
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [sectionFilter, setSectionFilter] = useState<'ALL' | string>('ALL');

  // Reset timer and answers when switching mock sets before starting
  useEffect(() => {
    if (!isTestStarted) {
      setTimeRemainingSeconds(activeMock.durationMinutes * 60);
      setUserAnswers({});
      setMarkedForReview({});
      setIsSubmitted(false);
      setCurrentQuestionIndex(0);
    }
  }, [selectedMockId, isTestStarted]);

  // Countdown Timer
  useEffect(() => {
    if (!isTestStarted || isSubmitted || isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestStarted, isSubmitted, isTimerPaused]);

  // Filtered Questions according to active section
  const filteredQuestions = activeMock.questions.filter((q) => {
    if (sectionFilter === 'ALL') return true;
    return q.section.includes(sectionFilter);
  });

  const currentQuestion: LMSMockTestQuestion | undefined =
    activeMock.questions[currentQuestionIndex];

  // Final Submission Calculation
  const handleFinalSubmit = () => {
    let score = 0;
    activeMock.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        score += q.marks || 2;
      }
    });

    const totalPossible = activeMock.questions.reduce((acc, q) => acc + (q.marks || 2), 0);
    const pct = totalPossible > 0 ? Math.round((score / totalPossible) * 100) : 0;

    setIsSubmitted(true);
    setIsTestStarted(false);

    if (onRecordMockScore) {
      onRecordMockScore(activeMock.id, activeMock.testTitle, score, totalPossible, pct);
    }
  };

  const handleStartExam = () => {
    setIsTestStarted(true);
    setIsSubmitted(false);
    setTimeRemainingSeconds(activeMock.durationMinutes * 60);
    setUserAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIndex(0);
  };

  const handleRetakeExam = () => {
    setIsSubmitted(false);
    handleStartExam();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Score stats
  const correctCount = activeMock.questions.filter(
    (q) => userAnswers[q.id] === q.correctIndex
  ).length;
  const attemptedCount = Object.keys(userAnswers).length;
  const incorrectCount = attemptedCount - correctCount;
  const totalQuestions = activeMock.questions.length;
  const totalScoreScored = activeMock.questions.reduce((acc, q) => {
    return userAnswers[q.id] === q.correctIndex ? acc + (q.marks || 2) : acc;
  }, 0);
  const totalMaxMarks = activeMock.questions.reduce((acc, q) => acc + (q.marks || 2), 0);
  const percentage = totalMaxMarks > 0 ? Math.round((totalScoreScored / totalMaxMarks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Exam Practice Sets Overview Header & 3-Mock Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-700">
              <Award size={15} />
              <span>Full-Length Examination Simulation Hub</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {t.practiceSetsHeading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
              {t.practiceSetsDesc}
            </p>
          </div>

          <span className="px-3 py-1 bg-red-100 text-red-900 border border-red-200 rounded-full text-xs font-black self-start lg:self-auto">
            3 Full Practice Sets
          </span>
        </div>

        {/* 3 Practice Sets Cards Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockSets.map((mSet, idx) => {
            const isSelected = selectedMockId === mSet.id;
            const labels = [
              t.mockSet1Title,
              t.mockSet2Title,
              t.mockSet3Title,
            ];

            return (
              <div
                key={mSet.id}
                onClick={() => {
                  if (!isTestStarted) {
                    setSelectedMockId(mSet.id);
                  }
                }}
                className={`p-5 rounded-2xl border-2 transition text-left cursor-pointer space-y-3 relative ${
                  isSelected
                    ? 'border-red-700 bg-red-50/40 shadow-md ring-2 ring-red-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } ${isTestStarted ? 'pointer-events-none opacity-80' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {mSet.testCode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                    {mSet.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug">
                  {labels[idx] || mSet.testTitle}
                </h3>

                <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <strong className="font-mono text-slate-900">{mSet.questions.length}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Marks:</span>
                    <strong className="font-mono text-slate-900">{mSet.totalMarks} Marks</strong>
                  </div>
                </div>

                <div className="pt-2">
                  {isSelected ? (
                    <span className="text-xs font-black text-red-700 flex items-center gap-1">
                      <Check size={14} /> Active Mock Paper
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500">
                      Click to Select
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Active Test Runner Interface (When Started) */}
      {isTestStarted && !isSubmitted && currentQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question & Options Workspace (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Top Bar: Section & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-red-700">
                  {currentQuestion.section}
                </span>
                <div className="text-xs font-bold text-slate-500">
                  {currentQuestion.subject}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [currentQuestion.id]: !prev[currentQuestion.id],
                    }))
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    markedForReview[currentQuestion.id]
                      ? 'bg-purple-100 text-purple-900 border border-purple-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>

                {userAnswers[currentQuestion.id] !== undefined && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextAns = { ...userAnswers };
                      delete nextAns[currentQuestion.id];
                      setUserAnswers(nextAns);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-700 hover:bg-red-50 border border-slate-200 cursor-pointer"
                  >
                    {t.clearResponse}
                  </button>
                )}
              </div>
            </div>

            {/* Question Heading */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-950 text-white font-mono text-sm font-black flex items-center justify-center shrink-0">
                  {currentQuestionIndex + 1}
                </span>
                <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {currentQuestion.pyqTag && (
                <div className="pl-11">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    {currentQuestion.pyqTag}
                  </span>
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 pl-0 sm:pl-11">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = userAnswers[currentQuestion.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() =>
                      setUserAnswers((prev) => ({
                        ...prev,
                        [currentQuestion.id]: optIdx,
                      }))
                    }
                    className={`w-full p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-medium transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'border-red-700 bg-red-50/60 text-slate-950 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isSelected
                            ? 'bg-red-700 text-white'
                            : 'border border-slate-300 text-slate-600 bg-slate-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isSelected && <Check size={18} className="text-red-700 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons (Prev, Next, Finish) */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>{t.prevQuestion}</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < activeMock.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(activeMock.questions.length - 1, prev + 1)
                      )
                    }
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>{t.nextQuestion}</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-lg"
                  >
                    {t.finishMock}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Timer & Question Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Countdown Timer Block */}
            <div
              className={`p-5 rounded-3xl border shadow-sm flex items-center justify-between ${
                timeRemainingSeconds < 300
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {t.timeLeft}
                </span>
                <span className="font-mono text-3xl font-black tabular-nums tracking-tight">
                  {formatTimer(timeRemainingSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
                >
                  {isTimerPaused ? <Play size={16} /> : <Pause size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer shadow-sm"
                >
                  Submit
                </button>
              </div>
            </div>

            {/* Question Palette Grid */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  {t.questionPalette}
                </h4>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {Object.keys(userAnswers).length} / {activeMock.questions.length}
                </span>
              </div>

              {/* Status Legend */}
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span>{t.answered}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  <span>{t.markedReview}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-200" />
                  <span>{t.notVisited}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full border-2 border-red-700 bg-white" />
                  <span>Current</span>
                </div>
              </div>

              {/* 5-Column Question Number Palette Grid */}
              <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
                {activeMock.questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isMarked = markedForReview[q.id];
                  const isCurrent = currentQuestionIndex === idx;

                  let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                  if (isAnswered) {
                    colorClass = 'bg-emerald-600 text-white font-bold';
                  } else if (isMarked) {
                    colorClass = 'bg-purple-600 text-white font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-xl font-mono text-xs transition flex items-center justify-center cursor-pointer ${colorClass} ${
                        isCurrent ? 'ring-2 ring-red-700 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Pre-Test Start Card (When Not Started & Not Submitted) */}
      {!isTestStarted && !isSubmitted && (
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-slate-800 shadow-xl max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-red-600/20 text-red-400 mx-auto flex items-center justify-center border border-red-500/30">
            <BookOpen size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              {activeMock.testCode}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {activeMock.testTitle}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              {activeMock.officialBlueprintNote}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto text-xs py-2">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Questions</span>
              <strong className="text-white font-mono text-base">{activeMock.questions.length}</strong>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Duration</span>
              <strong className="text-white font-mono text-base">{activeMock.durationMinutes} Mins</strong>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-[10px]">Total Marks</span>
              <strong className="text-white font-mono text-base">{activeMock.totalMarks}</strong>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleStartExam}
              className="px-8 py-4 rounded-2xl bg-red-700 hover:bg-red-600 text-white font-black text-sm uppercase tracking-wider shadow-xl transition transform hover:scale-105 cursor-pointer"
            >
              {t.startMockTest}
            </button>
          </div>
        </div>
      )}

      {/* 4. Scorecard & Detailed Performance Report (After Submission) */}
      {isSubmitted && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-red-700">
                  {t.mockScorecard}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {activeMock.testTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleRetakeExam}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>{t.retakeMockTest}</span>
              </button>
            </div>

            {/* Scorecard Metric Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  {t.totalScore}
                </span>
                <div className="text-3xl font-black font-mono text-slate-900 mt-1">
                  {totalScoreScored} <span className="text-sm text-slate-400">/ {totalMaxMarks}</span>
                </div>
                <span className="text-xs text-slate-500 font-bold">{percentage}% Marks</span>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200">
                <span className="text-[11px] font-bold uppercase text-emerald-800 block">
                  {t.accuracy}
                </span>
                <div className="text-3xl font-black font-mono text-emerald-950 mt-1">
                  {attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0}%
                </div>
                <span className="text-xs text-emerald-700 font-bold">
                  {correctCount} Correct / {attemptedCount} Attempted
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  {t.passStatus}
                </span>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {percentage >= 40 ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={18} /> Qualified (UR)
                    </span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1">
                      <AlertCircle size={18} /> Review Needed
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  UR Cutoff: 40% | OBC: 37% | SC/ST: 33%
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">
                  Unanswered / Skipped
                </span>
                <div className="text-3xl font-black font-mono text-slate-700 mt-1">
                  {totalQuestions - attemptedCount}
                </div>
                <span className="text-[11px] text-slate-500 block">Questions Skipped</span>
              </div>
            </div>

            {/* Question-by-Question Solution & Analysis */}
            <div className="space-y-4 pt-4">
              <h4 className="font-black text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText size={16} className="text-red-700" />
                <span>{t.questionReview}</span>
              </h4>

              <div className="space-y-4">
                {activeMock.questions.map((q, idx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctIndex;
                  const isSkipped = userChoice === undefined;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border leading-relaxed space-y-3 ${
                        isSkipped
                          ? 'bg-slate-50/70 border-slate-200'
                          : isCorrect
                          ? 'bg-emerald-50/30 border-emerald-300'
                          : 'bg-red-50/30 border-red-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white'
                                : isSkipped
                                ? 'bg-slate-300 text-slate-800'
                                : 'bg-red-600 text-white'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {q.question}
                          </span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-500 shrink-0">
                          {q.marks || 2} Marks
                        </span>
                      </div>

                      {/* Options Review */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 text-xs">
                        {q.options.map((opt, optIdx) => {
                          const isCorrectOpt = optIdx === q.correctIndex;
                          const isUserPicked = userChoice === optIdx;

                          let bg = 'bg-white border-slate-200 text-slate-700';
                          if (isCorrectOpt) {
                            bg = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                          } else if (isUserPicked) {
                            bg = 'bg-red-100 border-red-400 text-red-950 font-bold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between ${bg}`}
                            >
                              <span>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                              {isCorrectOpt && (
                                <Check size={14} className="text-emerald-700 shrink-0" />
                              )}
                              {isUserPicked && !isCorrectOpt && (
                                <X size={14} className="text-red-700 shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Statutory Explanation */}
                      <div className="pl-8 pt-1">
                        <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                            {t.explanation} ({q.ruleReference}):
                          </span>
                          <p className="text-slate-300">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
